import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders
    });
  }

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
  
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

  try {
    const processedItems = await Promise.all(items.map(async (item: any) => {
      let imageUrl = item.image_path;

      // If it's a base64 image, upload it to Supabase Storage
      if (imageUrl?.startsWith('data:')) {
        try {
          // Convert base64 to Blob
          const base64Data = imageUrl.split(',')[1];
          const binaryData = atob(base64Data);
          const array = new Uint8Array(binaryData.length);
          for (let i = 0; i < binaryData.length; i++) {
            array[i] = binaryData.charCodeAt(i);
          }
          const blob = new Blob([array], { type: 'image/png' });

          // Upload to Supabase Storage
          const fileName = `${crypto.randomUUID()}.png`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('gallery')
            .upload(`cart-images/${fileName}`, blob);

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('gallery')
            .getPublicUrl(`cart-images/${fileName}`);

          imageUrl = publicUrl;
        } catch (error) {
          console.error('Error uploading image:', error);
          imageUrl = undefined;
        }
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product_name,
            metadata: {
              initial_order_status: 'received',
              chain_color: item.chain_color || 'Not specified',
              image_url: imageUrl || 'No image uploaded',
              customer_email: customerEmail || 'Not provided',
              shipping_name: shippingAddress?.name || 'Not provided',
              shipping_address: shippingAddress?.address || 'Not provided',
              shipping_city: shippingAddress?.city || 'Not provided',
              shipping_state: shippingAddress?.state || 'Not provided',
              shipping_zip: shippingAddress?.zipCode || 'Not provided',
              design_notes: item.design_notes || 'No notes provided'
            }
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity || 1,
      };
    }));

    // Get the origin from the request headers
    const origin = req.headers.get('origin') || 'https://lovable.dev';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: processedItems,
      mode: 'payment',
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cancel`,
      metadata: {
        order_status: 'received',
        fundraiser_id: fundraiserId || null,
        variation_id: variationId || null,
        customer_email: customerEmail || null,
        shipping_address: JSON.stringify(shippingAddress || {}),
        order_type: fundraiserId ? 'fundraiser' : 'regular',
        created_at: new Date().toISOString()
      }
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});