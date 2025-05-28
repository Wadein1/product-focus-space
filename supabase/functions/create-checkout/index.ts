
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from 'https://esm.sh/stripe@14.21.0';

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
    const { items, metadata, customerEmail, shippingAddress, shipping_cost = 0 } = requestData;
    console.log('Received request data:', { items, metadata, customerEmail, shippingAddress, shipping_cost });

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product_name,
          ...(item.image_path && !item.image_path.startsWith('data:') && {
            images: [item.image_path]
          }),
          metadata: {
            chain_color: item.chain_color || "Designers' Choice",
            image_url: item.image_path || '',
            delivery_method: item.delivery_method || 'shipping'
          }
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    }));

    // Add shipping as a separate line item if cost is provided
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
          unit_amount: Math.round(shipping_cost * 100),
        },
        quantity: 1,
      });
    }

    // Prepare session metadata with all order details
    const sessionMetadata = {
      ...metadata,
      order_status: 'received',
      // Add item-specific data to session metadata
      item_image_path: items[0]?.image_path || '',
      item_chain_color: items[0]?.chain_color || "Designers' Choice",
      item_team_name: items[0]?.team_name || '',
      item_team_location: items[0]?.team_location || '',
      item_quantity: (items[0]?.quantity || 1).toString(),
      item_product_name: items[0]?.product_name || ''
    };

    console.log('Creating Stripe session with metadata:', sessionMetadata);

    // Use the application domain instead of the request URL origin
    const appDomain = "gimmedrip.lovable.app";

    // Create the base session config
    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `https://${appDomain}/success`,
      cancel_url: `https://${appDomain}/cancel`,
      metadata: sessionMetadata,
      ...(customerEmail && { customer_email: customerEmail }),
      // Enable promotion code support
      allow_promotion_codes: true,
    };

    // Enable automatic tax calculation
    sessionConfig.automatic_tax = { enabled: true };

    console.log('Creating Stripe session with config:', sessionConfig);
    const session = await stripe.checkout.sessions.create(sessionConfig);
    console.log('Stripe session created successfully:', session.url);

    return new Response(
      JSON.stringify({ url: session.url }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
