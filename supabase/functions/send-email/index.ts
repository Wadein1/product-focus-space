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
    const formData = await req.formData();
    const type = formData.get('type');
    let subject, html, attachments = [];

    if (type === 'support') {
      const supportType = formData.get('supportType');
      const email = formData.get('email');
      const description = formData.get('description');
      const image = formData.get('image');
      const imageName = formData.get('imageName');

      subject = `New Support Ticket: ${supportType}`;
      html = `
        <h2>New Support Ticket</h2>
        <p><strong>Type:</strong> ${supportType}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Description:</strong> ${description}</p>
      `;

      if (image && imageName) {
        try {
          // Convert base64 to buffer
          const base64Data = String(image).split(',')[1];
          const binaryStr = atob(base64Data);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          
          attachments.push({
            filename: String(imageName),
            content: bytes,
          });
        } catch (error) {
          console.error('Error processing image attachment:', error);
        }
      }
    } else if (type === 'fundraising') {
      const companyName = formData.get('companyName');
      const email = formData.get('email');
      const description = formData.get('description');

      subject = `New Fundraising Request: ${companyName}`;
      html = `
        <h2>New Fundraising Request</h2>
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
      `;
    } else {
      throw new Error('Invalid notification type');
    }

    console.log('Sending email with attachments:', attachments);

    const { data: emailData, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['wadesportssolutions@gmail.com'],
      subject,
      html,
      attachments,
    });

    if (error) {
      console.error('Resend API error:', error);
      throw error;
    }

    return new Response(
      JSON.stringify(emailData),
      { 
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