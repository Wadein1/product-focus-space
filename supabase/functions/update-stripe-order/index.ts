import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const { orderId, newStatus } = await req.json();
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Get the session
    const session = await stripe.checkout.sessions.retrieve(orderId, {
      expand: ['line_items.data.price.product'],
    });

    // Update the product metadata with the new status
    const lineItem = session.line_items?.data[0];
    if (lineItem?.price?.product) {
      await stripe.products.update(lineItem.price.product.id, {
        metadata: {
          ...lineItem.price.product.metadata,
          initial_order_status: newStatus,
        },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});