import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from 'https://esm.sh/resend@2.0.0';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const resend = new Resend(RESEND_API_KEY);

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
    const { type, data } = await req.json();
    let subject, html;

    if (type === 'support') {
      subject = `New Support Ticket: ${data.supportType}`;
      html = `
        <h2>New Support Ticket</h2>
        <p><strong>Type:</strong> ${data.supportType}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Description:</strong> ${data.description}</p>
        ${data.imagePath ? `<p><strong>Image:</strong> ${data.imagePath}</p>` : ''}
      `;
    } else if (type === 'fundraising') {
      subject = `New Fundraising Request: ${data.companyName}`;
      html = `
        <h2>New Fundraising Request</h2>
        <p><strong>Company:</strong> ${data.companyName}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        ${data.description ? `<p><strong>Description:</strong> ${data.description}</p>` : ''}
      `;
    } else {
      throw new Error('Invalid notification type');
    }

    // For testing, send to the verified email
    const { data: emailData, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['wadesportssolutions@gmail.com'],
      subject,
      html,
    });

    if (error) {
      console.error('Resend API error:', error);
      throw error;
    }

    return new Response(
      JSON.stringify(emailData),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in send-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});