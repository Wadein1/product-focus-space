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

    // Calculate donation amount if this is a fundraiser order
    let donationAmount = 0;
    if (metadata?.is_fundraiser && metadata?.fundraiser_id) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: fundraiser } = await supabase
        .from('fundraisers')
        .select('donation_type, donation_percentage, donation_amount')
        .eq('id', metadata.fundraiser_id)
        .single();

      if (fundraiser) {
        const orderAmount = items.reduce((sum: number, item: any) => 
          sum + (item.price * (item.quantity || 1)), 0);

        donationAmount = fundraiser.donation_type === 'percentage'
          ? (orderAmount * (fundraiser.donation_percentage / 100))
          : (fundraiser.donation_amount * items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0));
      }
    }

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product_name,
          ...(item.image_path && !item.image_path.startsWith('data:') && {
            images: [item.image_path]
          })
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    }));

    console.log('Creating Stripe session with metadata:', {
      ...metadata,
      donation_amount: donationAmount,
    });

    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.get('origin') || 'https://lovable.dev'}/success`,
      cancel_url: `${req.headers.get('origin') || 'https://lovable.dev'}/cancel`,
      automatic_tax: {
        enabled: true,
      },
      metadata: {
        ...metadata,
        donation_amount: donationAmount.toString(),
        order_status: 'received',
      },
      ...(customerEmail && { customer_email: customerEmail }),
    };

    if (!metadata?.is_fundraiser) {
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