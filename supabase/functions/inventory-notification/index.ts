import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { Resend } from 'https://esm.sh/resend@2.0.0';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const resend = new Resend(RESEND_API_KEY);

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    const { itemId, variationId, quantity } = await req.json();

    // Get item and variation details
    const { data: item } = await supabase
      .from('inventory_items')
      .select('*, inventory_variations!inner(*)')
      .eq('id', itemId)
      .eq('inventory_variations.id', variationId)
      .single();

    if (!item) {
      throw new Error('Item not found');
    }

    // Send email notification
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['wadesportssolutions@gmail.com'],
      subject: `Low Inventory Alert: ${item.name}`,
      html: `
        <h2>Low Inventory Alert</h2>
        <p>The following item has fallen below its par level:</p>
        <ul>
          <li><strong>Item:</strong> ${item.name}</li>
          <li><strong>Variation:</strong> ${item.inventory_variations[0].name}</li>
          <li><strong>Current Quantity:</strong> ${quantity}</li>
          <li><strong>Par Level:</strong> ${item.par_level}</li>
        </ul>
        <p>Please restock this item as soon as possible.</p>
      `,
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      throw emailError;
    }

    return new Response(
      JSON.stringify({ message: 'Notification sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in inventory-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});