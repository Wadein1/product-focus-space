
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
      
      console.log('Session metadata:', session.metadata);
      
      // Check if this is a fundraiser order
      const isFundraiser = session.metadata?.is_fundraiser === 'true';
      const fundraiserId = session.metadata?.fundraiser_id;
      const variationId = session.metadata?.variation_id;
      
      console.log('Fundraiser check:', { isFundraiser, fundraiserId, variationId });
      
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
        // Extract custom order data from session metadata
        const orderData = {
          customer_email: session.customer_details?.email,
          product_name: session.metadata?.item_product_name || item.description,
          price: item.amount_total ? item.amount_total / 100 : 0,
          quantity: parseInt(session.metadata?.item_quantity || '1'),
          status: session.metadata?.order_status || 'received',
          shipping_address: session.shipping_details,
          shipping_cost: shippingCost,
          tax_amount: session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0,
          total_amount: session.amount_total ? session.amount_total / 100 : 0,
          is_fundraiser: isFundraiser,
          // Add fundraiser tracking columns to orders table
          fundraiser_id: fundraiserId || null,
          variation_id: variationId || null,
          // Add team information for pickup orders
          age_division: session.metadata?.team_age_division || null,
          pickup_team_name: session.metadata?.pickup_team_name || null,
          // Add custom fields from metadata
          image_path: session.metadata?.item_image_path || null,
          chain_color: session.metadata?.item_chain_color || null,
          team_name: session.metadata?.item_team_name || null,
          team_location: session.metadata?.item_team_location || null,
          // Add School Mode fields
          school_mode: session.metadata?.school_mode === 'true',
          big_school: session.metadata?.big_school === 'true',
          school_button_clicked: session.metadata?.school_button_clicked === 'true',
          grade: session.metadata?.grade || null,
          teacher: session.metadata?.teacher || null,
          homeroom_teacher: session.metadata?.homeroom_teacher || null
        };

        console.log('Creating order with data:', orderData);

        // Create the order with fundraiser tracking
        const { data: orderData_, error: orderError } = await supabase
          .from('orders')
          .insert([orderData])
          .select()
          .single();

        if (orderError) {
          console.error('Error creating order:', orderError);
          throw orderError;
        }

        console.log('Order created successfully:', orderData_.id);

        // If this is a fundraiser order, create the fundraiser order record
        if (isFundraiser && fundraiserId && variationId && orderData_) {
          console.log('Processing fundraiser order:', {
            fundraiserId,
            variationId,
            orderId: orderData_.id,
            quantity: orderData.quantity
          });

          // First, verify the fundraiser and variation exist
          const { data: fundraiser, error: fundraiserError } = await supabase
            .from('fundraisers')
            .select('donation_percentage, donation_amount, donation_type')
            .eq('id', fundraiserId)
            .single();

          if (fundraiserError) {
            console.error('Error fetching fundraiser:', fundraiserError);
            throw fundraiserError;
          }

          const { data: variation, error: variationError } = await supabase
            .from('fundraiser_variations')
            .select('price')
            .eq('id', variationId)
            .single();

          if (variationError) {
            console.error('Error fetching variation:', variationError);
            throw variationError;
          }

          console.log('Found fundraiser:', fundraiser);
          console.log('Found variation:', variation);

          // Calculate donation amount based on type - CORRECTED LOGIC
          let donationPerItem = 0;
          const itemPriceExcludingShipping = (orderData.price - orderData.shipping_cost) / orderData.quantity;
          
          if (fundraiser.donation_type === 'percentage') {
            // For percentage: use item price excluding shipping
            donationPerItem = itemPriceExcludingShipping * (fundraiser.donation_percentage / 100.0);
          } else {
            // For fixed amount: use the exact fixed donation amount set in fundraiser
            donationPerItem = fundraiser.donation_amount || 0;
          }

          const totalDonationAmount = donationPerItem * orderData.quantity;

          console.log('Calculated donation amount:', {
            donationPerItem,
            totalDonationAmount,
            itemPriceExcludingShipping,
            quantity: orderData.quantity,
            donationType: fundraiser.donation_type,
            donationPercentage: fundraiser.donation_percentage,
            fixedDonationAmount: fundraiser.donation_amount
          });

          // Create fundraiser order record
          const { data: fundraiserOrderData, error: fundraiserOrderError } = await supabase
            .from('fundraiser_orders')
            .insert([{
              fundraiser_id: fundraiserId,
              variation_id: variationId,
              order_id: orderData_.id,
              amount: orderData.price,
              donation_amount: totalDonationAmount
            }])
            .select()
            .single();

          if (fundraiserOrderError) {
            console.error('Error creating fundraiser order:', fundraiserOrderError);
            throw fundraiserOrderError;
          }

          console.log(`Successfully processed fundraiser order:`, fundraiserOrderData);
          console.log(`Donation amount: $${totalDonationAmount} for ${orderData.quantity} items`);
        } else if (isFundraiser) {
          console.warn('Missing fundraiser data:', { fundraiserId, variationId, orderExists: !!orderData_ });
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
