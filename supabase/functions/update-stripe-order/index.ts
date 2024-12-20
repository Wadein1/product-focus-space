import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

    console.log(`Updating order ${orderId} status to ${newStatus}`);

    // First retrieve the session to ensure it exists
    const session = await stripe.checkout.sessions.retrieve(orderId);
    
    // Create the metadata update
    const metadata = {
      ...session.metadata,
      order_status: newStatus,
    };

    // Update the session with new metadata using the correct method
    const updatedSession = await stripe.checkout.sessions.update(
      orderId,
      { metadata }
    );

    console.log('Session updated successfully:', updatedSession.id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});