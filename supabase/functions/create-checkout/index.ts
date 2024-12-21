import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Missing Stripe secret key');
    }
    
    const { items, customerEmail, shippingAddress, fundraiserId, variationId } = await req.json();
    console.log('Received request data:', { items, customerEmail, shippingAddress, fundraiserId, variationId });

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    try {
      const processedItems = await Promise.all(items.map(async (item: any) => {
        const isFundraiser = item.is_fundraiser || fundraiserId;
        const basePrice = item.price;
        const quantity = item.quantity || 1;
        
        // Calculate components
        const subtotal = basePrice * quantity;
        const shippingCost = isFundraiser ? 0 : 8.00; // No shipping for fundraisers
        const taxRate = 0.05;
        const taxAmount = subtotal * taxRate;
        const total = subtotal + shippingCost + taxAmount;

        // Format the description with price breakdown
        const priceBreakdown = [
          `Base Price: $${(basePrice).toFixed(2)}`,
          !isFundraiser ? `Shipping: $${shippingCost.toFixed(2)}` : null,
          `Tax (5%): $${taxAmount.toFixed(2)}`,
          `Total: $${total.toFixed(2)}`
        ].filter(Boolean).join('\n');

        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.product_name,
              description: priceBreakdown,
              metadata: {
                initial_order_status: 'received',
                chain_color: item.chain_color || 'Not specified',
                image_url: item.image_path || 'No image uploaded',
                is_fundraiser: isFundraiser,
                base_price: basePrice.toString(),
                shipping_cost: shippingCost.toString(),
                tax_amount: taxAmount.toString()
              }
            },
            unit_amount: Math.round(total * 100), // Convert to cents
          },
          quantity: 1, // We've already factored quantity into the total price
        };
      }));

      const origin = req.headers.get('origin') || 'https://lovable.dev';

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: processedItems,
        mode: 'payment',
        success_url: `${origin}/checkout/success`,
        cancel_url: `${origin}/cart`,
        metadata: {
          order_status: 'received',
          fundraiser_id: fundraiserId,
          variation_id: variationId
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
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});