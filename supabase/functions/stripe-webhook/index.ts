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
      
      const fundraiserId = session.metadata?.fundraiser_id;
      const variationId = session.metadata?.variation_id;
      
      if (fundraiserId && variationId) {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const item = lineItems.data[0]; // We only have one item per fundraiser purchase
        
        // Calculate donation amount based on fundraiser's donation percentage
        const { data: fundraiser } = await supabase
          .from('fundraisers')
          .select('donation_percentage')
          .eq('id', fundraiserId)
          .single();
        
        if (!fundraiser) {
          throw new Error('Fundraiser not found');
        }
        
        const amount = item.amount_total ? item.amount_total / 100 : 0;
        const donationAmount = (amount * (fundraiser.donation_percentage / 100));

        // Create order first
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            customer_email: session.customer_details?.email,
            product_name: item.description,
            price: amount,
            shipping_address: session.shipping_details,
            image_path: session.metadata?.image_url,
            is_fundraiser: true,
            shipping_cost: 8.00,
            tax_amount: session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0,
            total_amount: amount,
            status: 'received'
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Create fundraiser order
        const { error: fundraiserOrderError } = await supabase
          .from('fundraiser_orders')
          .insert({
            fundraiser_id: fundraiserId,
            variation_id: variationId,
            order_id: order.id,
            amount: amount,
            donation_amount: donationAmount
          });

        if (fundraiserOrderError) throw fundraiserOrderError;
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