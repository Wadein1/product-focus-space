
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Track fundraiser sale function started');

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { 
      fundraiser_id, 
      variation_id, 
      quantity, 
      item_price, 
      donation_amount,
      stripe_session_id,
      customer_email 
    } = await req.json();

    console.log('Received tracking data:', {
      fundraiser_id,
      variation_id,
      quantity,
      item_price,
      donation_amount,
      stripe_session_id
    });

    if (!fundraiser_id || !variation_id || !quantity || !item_price || !donation_amount) {
      throw new Error('Missing required fields for fundraiser tracking');
    }

    // Create a tracking record in fundraiser_orders table without order_id reference
    const { data: trackingData, error: trackingError } = await supabaseClient
      .from('fundraiser_orders')
      .insert({
        fundraiser_id: fundraiser_id,
        variation_id: variation_id,
        order_id: null, // Set to null to avoid foreign key constraint
        amount: item_price * quantity,
        donation_amount: donation_amount * quantity
      })
      .select()
      .single();

    if (trackingError) {
      console.error('Error creating fundraiser tracking record:', trackingError);
      throw trackingError;
    }

    console.log('Fundraiser sale tracked successfully:', trackingData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Fundraiser sale tracked successfully',
        tracking_id: trackingData.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in track-fundraiser-sale:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to track fundraiser sale' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
