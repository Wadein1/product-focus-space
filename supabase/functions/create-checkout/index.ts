import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('Missing Stripe secret key');
      throw new Error('Server configuration error: Missing Stripe secret key');
    }

    const { items, customerEmail, shippingAddress, fundraiserId, variationId } = await req.json();
    console.log('Received request data:', { items, customerEmail, shippingAddress, fundraiserId, variationId });

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Test the Stripe connection
    try {
      await stripe.paymentMethods.list({ limit: 1 });
      console.log('Successfully connected to Stripe API');
    } catch (stripeError) {
      console.error('Failed to connect to Stripe:', stripeError);
      throw new Error('Failed to connect to Stripe API. Please check your API key.');
    }

    const lineItems = items.map((item: any) => {
      const name = item.product_name.length > 100 
        ? item.product_name.substring(0, 97) + '...' 
        : item.product_name;

      const imageUrl = item.image_path && item.image_path.length < 500 
        ? [item.image_path] 
        : undefined;

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name,
            images: imageUrl,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity || 1,
      };
    });

    console.log('Creating Stripe session with line items:', lineItems);

    // Get the base URL from the request URL
    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    console.log('Base URL for redirect:', baseUrl);

    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success`,
      cancel_url: `${baseUrl}/cart`,
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      metadata: {
        fundraiserId: fundraiserId || '',
        variationId: variationId || '',
      },
    });

    console.log('Stripe session created successfully:', session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-checkout function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack,
        hint: error.message.includes('Invalid Stripe secret key') 
          ? 'Please ensure a valid Stripe secret key is set in the Edge Function secrets'
          : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});