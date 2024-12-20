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
    
    console.log(`Attempting to update order ${orderId} to status ${newStatus}`);
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // First retrieve the session to ensure it exists
    const session = await stripe.checkout.sessions.retrieve(orderId);
    console.log('Retrieved session:', session.id);
    
    // Prepare the metadata update
    const metadata = {
      ...session.metadata, // Keep existing metadata
      order_status: newStatus,
    };

    // Use the correct method to update the session
    const updatedSession = await stripe.checkout.sessions.update(
      orderId,
      { metadata }
    );

    console.log('Successfully updated session:', updatedSession.id);

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