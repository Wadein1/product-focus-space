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
    const { items, metadata, customerEmail, shippingAddress } = await req.json();
    console.log('Received request data:', { items, metadata, customerEmail, shippingAddress });

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
            image_url: item.image_path || ''
          }
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    }));

    console.log('Creating Stripe session with metadata:', metadata);

    // Check if there are any regular products
    const hasRegularProducts = items.some((item: any) => !item.is_fundraiser);

    // Get the base URL from the request, ensuring proper URL construction
    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}`;
    console.log('Base URL constructed:', baseUrl);

    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/cancel`,
      automatic_tax: {
        enabled: true,
      },
      metadata: {
        ...metadata,
        order_status: 'received',
      },
      ...(customerEmail && { customer_email: customerEmail }),
    };

    // Only add shipping if there are regular products
    if (hasRegularProducts) {
      sessionConfig.shipping_address_collection = {
        allowed_countries: ['US'],
      };
      sessionConfig.shipping_options = [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 800,
              currency: 'usd',
            },
            display_name: 'Standard shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 5,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            },
          },
        },
      ];
    }

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