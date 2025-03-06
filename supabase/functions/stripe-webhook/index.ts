
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
      
      // Get line items to extract product metadata
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      
      // Find shipping item if it exists
      const shippingItem = lineItems.data.find(item => 
        item.description === 'Shipping'
      );
      
      // Calculate shipping cost from the line items
      const shippingCost = shippingItem ? shippingItem.amount_total / 100 : 0;
      
      // Remove shipping item from processing
      const productItems = lineItems.data.filter(item => 
        item.description !== 'Shipping'
      );
      
      // Process each product line item (excluding shipping)
      for (const item of productItems) {
        const orderData = {
          customer_email: session.customer_details?.email,
          product_name: item.description,
          price: item.amount_total ? item.amount_total / 100 : 0,
          quantity: item.quantity,
          status: session.metadata?.order_status || 'received',
          shipping_address: session.shipping_details,
          shipping_cost: shippingCost,
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

        // If this is a fundraiser order, create the fundraiser order record
        if (isFundraiser && fundraiserId && variationId && orderData_) {
          console.log('Processing fundraiser order:', {
            fundraiserId,
            variationId,
            orderId: orderData_.id
          });

          // Get the fundraiser details to calculate donation amount
          const { data: fundraiser, error: fundraiserError } = await supabase
            .from('fundraisers')
            .select('donation_percentage')
            .eq('id', fundraiserId)
            .single();

          if (fundraiserError) {
            console.error('Error fetching fundraiser:', fundraiserError);
            throw fundraiserError;
          }

          const donationPercentage = fundraiser.donation_percentage / 100;
          const donationAmount = orderData.price * donationPercentage;

          // Create fundraiser order record
          const { error: fundraiserOrderError } = await supabase
            .from('fundraiser_orders')
            .insert([{
              fundraiser_id: fundraiserId,
              variation_id: variationId,
              order_id: orderData_.id,
              amount: orderData.price,
              donation_amount: donationAmount
            }]);

          if (fundraiserOrderError) {
            console.error('Error creating fundraiser order:', fundraiserOrderError);
            throw fundraiserOrderError;
          }

          console.log(`Successfully processed fundraiser order. Donation amount: $${donationAmount}`);
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
