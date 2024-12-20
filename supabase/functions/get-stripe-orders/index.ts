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
    const { searchTerm, statusFilter, orderTypeFilter } = await req.json();
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Fetch all checkout sessions
    const sessions = await stripe.checkout.sessions.list({
      limit: 100, // Adjust as needed
      expand: ['data.line_items', 'data.payment_intent'],
    });

    // Transform Stripe data into our Order format
    const orders = sessions.data.map(session => {
      const lineItem = session.line_items?.data[0];
      const metadata = lineItem?.price?.product.metadata || {};
      
      return {
        id: session.id,
        created_at: new Date(session.created * 1000).toISOString(),
        customer_email: session.customer_details?.email || metadata.customer_email,
        product_name: lineItem?.description || '',
        total_amount: session.amount_total ? session.amount_total / 100 : 0,
        status: metadata.initial_order_status || 'received',
        shipping_address: session.shipping_details || JSON.parse(session.metadata?.shipping_address || '{}'),
        image_path: metadata.image_url,
        design_notes: metadata.design_notes,
        is_fundraiser: session.metadata?.order_type === 'fundraiser'
      };
    });

    // Apply filters
    let filteredOrders = orders;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredOrders = filteredOrders.filter(order => 
        order.customer_email?.toLowerCase().includes(searchLower) ||
        order.product_name?.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'all') {
      filteredOrders = filteredOrders.filter(order => 
        order.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (orderTypeFilter === 'fundraiser') {
      filteredOrders = filteredOrders.filter(order => order.is_fundraiser);
    } else {
      filteredOrders = filteredOrders.filter(order => !order.is_fundraiser);
    }

    return new Response(JSON.stringify({ orders: filteredOrders }), {
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