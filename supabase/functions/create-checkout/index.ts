import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const uploadImageToStorage = async (supabase: any, dataUrl: string): Promise<string> => {
  try {
    // Convert data URL to Blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // Generate a unique filename
    const filename = `${crypto.randomUUID()}.${blob.type.split('/')[1]}`;
    const filePath = `cart-images/${filename}`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(filePath, blob);

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Process items and handle image URLs
    const processedItems = await Promise.all(items.map(async (item: any) => {
      let imageUrl = item.image_path;

      // If it's a data URL, upload it to storage first
      if (imageUrl?.startsWith('data:')) {
        try {
          imageUrl = await uploadImageToStorage(supabase, imageUrl);
        } catch (error) {
          console.error('Failed to upload image:', error);
          imageUrl = undefined; // Skip image if upload fails
        }
      }

      const name = item.product_name.length > 100 
        ? item.product_name.substring(0, 97) + '...' 
        : item.product_name;

      const imageUrls = imageUrl ? [imageUrl] : undefined;

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name,
            images: imageUrls,
            metadata: {
              chain_color: item.chain_color || 'Not specified',
              image_url: imageUrl || 'No image uploaded'
            }
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity || 1,
      };
    }));

    console.log('Creating Stripe session with line items:', processedItems);

    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    console.log('Base URL for redirect:', baseUrl);

    const sessionConfig: any = {
      line_items: processedItems,
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success`,
      cancel_url: `${baseUrl}/cart`,
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
    };

    if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }

    if (fundraiserId) {
      sessionConfig.metadata = {
        fundraiserId: fundraiserId,
        variationId: variationId || '',
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

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