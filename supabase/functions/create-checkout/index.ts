import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
  
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { items, customerEmail, shippingAddress, fundraiserId, variationId } = await req.json();
  console.log('Received request data:', { items, customerEmail, shippingAddress, fundraiserId, variationId });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  });

  const processedItems = await Promise.all(items.map(async (item: any) => {
    let imageUrl = item.image_path;

    if (imageUrl?.startsWith('data:')) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.product_name}-image.${blob.type.split('/')[1]}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading image:', error);
      }
    }

    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product_name,
          metadata: {
            initial_order_status: 'received', // Set initial order status
            chain_color: item.chain_color || 'Not specified',
            image_url: imageUrl || 'No image uploaded'
          }
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    };
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: processedItems,
    mode: 'payment',
    success_url: `${Deno.env.get('BASE_URL')}/success`,
    cancel_url: `${Deno.env.get('BASE_URL')}/cancel`,
    metadata: {
      order_status: 'received', // Top-level order status
      fundraiser_id: fundraiserId,
      variation_id: variationId
    }
  });

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
});
