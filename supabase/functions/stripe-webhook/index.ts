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

  // Handle CORS preflight requests
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
      
      // Extract order status from metadata
      const orderStatus = session.metadata?.order_status || 'received';
      
      // Get line items to extract product metadata
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      
      // Create orders in Supabase
      for (const item of lineItems.data) {
        const productId = item.price?.product as string;
        const product = await stripe.products.retrieve(productId);
        
        const orderData = {
          customer_email: session.customer_details?.email,
          product_name: item.description,
          price: item.amount_total ? item.amount_total / 100 : 0,
          quantity: item.quantity,
          status: orderStatus,
          shipping_address: session.shipping_details,
          image_path: product.metadata.image_url,
          is_fundraiser: session.metadata?.fundraiser_id ? true : false,
          shipping_cost: 8.00, // Default shipping cost
          tax_amount: session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0,
          total_amount: session.amount_total ? session.amount_total / 100 : 0,
        };

        const { error: orderError } = await supabase
          .from('orders')
          .insert([orderData]);

        if (orderError) {
          console.error('Error creating order:', orderError);
          throw orderError;
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