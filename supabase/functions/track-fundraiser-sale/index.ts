
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

    if (!fundraiser_id || !variation_id || !quantity || !item_price) {
      throw new Error('Missing required fields for fundraiser tracking');
    }

    // Fetch fundraiser details to calculate correct donation amount
    const { data: fundraiser, error: fundraiserError } = await supabaseClient
      .from('fundraisers')
      .select('donation_type, donation_percentage, donation_amount')
      .eq('id', fundraiser_id)
      .single();

    if (fundraiserError) {
      console.error('Error fetching fundraiser:', fundraiserError);
      throw fundraiserError;
    }

    // Calculate donation amount correctly based on fundraiser type
    let calculatedDonationAmount = 0;
    
    if (fundraiser.donation_type === 'percentage') {
      // For percentage: item_price * percentage (item_price should already exclude shipping)
      calculatedDonationAmount = item_price * (fundraiser.donation_percentage / 100.0);
    } else {
      // For fixed amount: use the exact fixed donation amount from fundraiser
      calculatedDonationAmount = fundraiser.donation_amount || 0;
    }

    // Total donation for all items
    const totalDonationAmount = calculatedDonationAmount * quantity;

    console.log('Donation calculation:', {
      donationType: fundraiser.donation_type,
      donationPercentage: fundraiser.donation_percentage,
      fixedDonationAmount: fundraiser.donation_amount,
      calculatedDonationPerItem: calculatedDonationAmount,
      totalDonationAmount,
      quantity
    });

    // Create a tracking record in fundraiser_orders table
    const { data: trackingData, error: trackingError } = await supabaseClient
      .from('fundraiser_orders')
      .insert({
        fundraiser_id: fundraiser_id,
        variation_id: variation_id,
        order_id: null, // Direct tracking without order reference
        amount: item_price * quantity,
        donation_amount: totalDonationAmount
      })
      .select()
      .single();

    if (trackingError) {
      console.error('Error creating fundraiser tracking record:', trackingError);
      throw trackingError;
    }

    console.log('Fundraiser sale tracked successfully:', trackingData);

    // The trigger will automatically update fundraiser_totals table
    console.log('Fundraiser totals will be updated automatically by database trigger');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Fundraiser sale tracked successfully',
        tracking_id: trackingData.id,
        calculated_donation: totalDonationAmount
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
