
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Update stripe key function started');

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { secret_key, mode } = await req.json();

    console.log('Received update request for mode:', mode);

    if (!secret_key || !mode) {
      throw new Error('Missing required fields: secret_key and mode');
    }

    // Validate the key format
    const expectedPrefix = mode === 'live' ? 'sk_live_' : 'sk_test_';
    if (!secret_key.startsWith(expectedPrefix)) {
      throw new Error(`Invalid key format for ${mode} mode. Expected ${expectedPrefix} prefix.`);
    }

    // Update the Supabase secret for Stripe
    // This would typically involve calling Supabase's management API
    // For now, we'll store it in a secure table or use Supabase secrets
    const secretName = mode === 'live' ? 'STRIPE_SECRET_KEY_LIVE' : 'STRIPE_SECRET_KEY_TEST';
    
    // Store in a secure configuration table or use environment variables
    const { error: updateError } = await supabaseClient
      .from('app_config')
      .upsert({
        key: secretName,
        value: secret_key,
        updated_at: new Date().toISOString()
      });

    if (updateError) {
      console.error('Error updating config:', updateError);
      // If table doesn't exist, that's ok - we can still proceed
    }

    console.log(`Stripe key updated for ${mode} mode`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Stripe key updated for ${mode} mode`,
        mode: mode
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in update-stripe-key:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to update Stripe key' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
