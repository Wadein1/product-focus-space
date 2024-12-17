import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey || !stripeKey.startsWith('sk_')) {
      console.error('Invalid or missing Stripe secret key');
      throw new Error('Server configuration error: Invalid Stripe secret key format');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const { items, customerEmail, shippingAddress } = await req.json();

    console.log('Received request data:', { items, customerEmail, shippingAddress });

    if (!items || !items.length || !customerEmail || !shippingAddress) {
      throw new Error('Missing required checkout information');
    }

    const lineItems = items.map((item: any) => {
      // Truncate product name if too long
      const name = item.product_name.length > 100 
        ? item.product_name.substring(0, 97) + '...' 
        : item.product_name;

      // Create line item without image if URL is too long
      const imageUrl = item.image_path && item.image_path.length < 500 
        ? item.image_path 
        : undefined;

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name,
            images: imageUrl ? [imageUrl] : undefined,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    console.log('Creating Stripe session with line items:', lineItems);

    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/checkout/success`,
      cancel_url: `${req.headers.get('origin')}/cart`,
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 800,
              currency: 'usd',
            },
            display_name: 'Standard Shipping',
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
      ],
    });

    console.log('Stripe session created successfully:', session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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