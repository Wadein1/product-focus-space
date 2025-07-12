import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log('Received request data:', requestData);

    const { 
      items, 
      metadata = {}, 
      customerEmail, 
      shippingAddress, 
      shipping_cost = 0,
      success_url_params = {},
      return_url = null
    } = requestData;

    if (!items || items.length === 0) {
      throw new Error('No items provided');
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Build success URL with tracking parameters for fundraisers
    const origin = req.headers.get("origin") || "https://gimmedrip.lovable.app";
    let successUrl = `${origin}/success`;
    
    // Add fundraiser tracking parameters to success URL if this is a fundraiser purchase
    if (success_url_params && Object.keys(success_url_params).length > 0) {
      const urlParams = new URLSearchParams();
      Object.entries(success_url_params).forEach(([key, value]) => {
        if (value) urlParams.append(key, String(value));
      });
      successUrl += `?${urlParams.toString()}`;
    }

    console.log('Success URL with tracking params:', successUrl);

    // Prepare line items for Stripe
    const lineItems = items.map((item: any) => {
      let unitAmount = Math.round((item.price || 0) * 100); // Convert to cents
      
      // Ensure minimum amount for Stripe
      if (unitAmount < 50) {
        unitAmount = 50; // $0.50 minimum
      }

      const productData: any = {
        name: item.product_name || 'Product',
        metadata: {
          // Add individual item metadata
          item_image_path: item.image_path || '',
          item_chain_color: item.chain_color || 'Designers\' Choice',
          item_team_name: item.team_name || '',
          item_team_location: item.team_location || '',
          item_quantity: String(item.quantity || 1),
          item_product_name: item.product_name || '',
          is_fundraiser: item.is_fundraiser ? 'true' : 'false',
          // Add fundraiser-specific metadata if applicable
          ...(item.is_fundraiser && {
            fundraiser_id: metadata.fundraiser_id || '',
            variation_id: metadata.variation_id || '',
            fundraiser_name: metadata.fundraiser_name || '',
            item_name: metadata.item_name || '',
            delivery_method: metadata.delivery_method || '',
            team_age_division: metadata.team_age_division || '',
            team_name: metadata.team_name || '',
            pickup_team_name: metadata.pickup_team_name || ''
          })
        }
      };

      // Add images if available and not a data URL
      if (item.image_path && !item.image_path.startsWith('data:')) {
        productData.images = [item.image_path];
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: productData,
          unit_amount: unitAmount,
        },
        quantity: item.quantity || 1,
      };
    });

    // Add shipping as a separate line item if there's a shipping cost
    if (shipping_cost > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
            metadata: {
              type: 'shipping'
            }
          },
          unit_amount: Math.round(shipping_cost * 100), // Convert to cents
        },
        quantity: 1,
      });
    }

    // Prepare session metadata
    const sessionMetadata = {
      ...metadata,
      order_status: 'received',
      // Keep existing item metadata for backward compatibility
      ...Object.fromEntries(
        Object.entries(metadata).filter(([key]) => key.startsWith('item_'))
      )
    };

    console.log('Creating Stripe session with metadata:', sessionMetadata);

    // Create Stripe checkout session
    let cancelUrl = `${origin}/cancel`;
    if (return_url) {
      cancelUrl += `?return_url=${encodeURIComponent(return_url)}`;
    }
    
    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: sessionMetadata,
      allow_promotion_codes: true,
      automatic_tax: { enabled: true }
    };

    console.log('Creating Stripe session with config:', sessionConfig);

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('Stripe session created successfully:', session.url);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
