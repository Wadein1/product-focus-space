import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
  const stripe = new Stripe(stripeKey, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  });

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log('Processing webhook event:', event.type);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Check if this is a fundraiser order
      const isFundraiser = session.metadata?.is_fundraiser === 'true';
      const fundraiserId = session.metadata?.fundraiser_id;
      const variationId = session.metadata?.variation_id;
      const donationAmount = parseFloat(session.metadata?.donation_amount || '0');
      
      // Get line items to extract product metadata
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      
      // Process each line item
      for (const item of lineItems.data) {
        const orderData = {
          customer_email: session.customer_details?.email,
          product_name: item.description,
          price: item.amount_total ? item.amount_total / 100 : 0,
          quantity: item.quantity,
          status: session.metadata?.order_status || 'received',
          shipping_address: session.shipping_details,
          shipping_cost: isFundraiser ? 0 : 8.00,
          tax_amount: session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0,
          total_amount: session.amount_total ? session.amount_total / 100 : 0,
          is_fundraiser: isFundraiser
        };

        // Create the order
        const { data: orderData_, error: orderError } = await supabase
          .from('orders')
          .insert([orderData])
          .select()
          .single();

        if (orderError) {
          console.error('Error creating order:', orderError);
          throw orderError;
        }

        // If this is a fundraiser order, create the fundraiser transaction record
        if (isFundraiser && fundraiserId && orderData_) {
          console.log('Processing fundraiser transaction:', {
            fundraiserId,
            orderId: orderData_.id,
            amount: orderData.price,
            donationAmount
          });

          // Get the fundraiser details
          const { data: fundraiser, error: fundraiserError } = await supabase
            .from('fundraisers')
            .select('donation_type')
            .eq('id', fundraiserId)
            .single();

          if (fundraiserError) {
            console.error('Error fetching fundraiser:', fundraiserError);
            throw fundraiserError;
          }

          // Create fundraiser transaction record
          const { error: transactionError } = await supabase
            .from('fundraiser_transactions')
            .insert([{
              fundraiser_id: fundraiserId,
              order_id: orderData_.id,
              amount: orderData.price,
              donation_amount: donationAmount,
              donation_type: fundraiser.donation_type,
              quantity: item.quantity || 1,
              stripe_payment_id: session.payment_intent as string
            }]);

          if (transactionError) {
            console.error('Error creating fundraiser transaction:', transactionError);
            throw transactionError;
          }

          console.log(`Successfully processed fundraiser transaction. Donation amount: $${donationAmount}`);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});