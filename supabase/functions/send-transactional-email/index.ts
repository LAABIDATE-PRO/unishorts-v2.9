// @ts-nocheck
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { template_name, recipient_email, data: templateData } = await req.json()
    if (!template_name || !recipient_email || !templateData) {
      throw new Error('template_name, recipient_email, and data are required.')
    }

    if (!RESEND_API_KEY) {
      throw new Error('Resend API key is not configured.')
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: template, error: templateError } = await supabaseAdmin
      .from('email_templates')
      .select('subject, body')
      .eq('name', template_name)
      .eq('is_enabled', true)
      .single()

    if (templateError || !template) {
      throw new Error(`Template "${template_name}" not found or is disabled.`)
    }

    let subject = template.subject
    let body = template.body
    for (const key in templateData) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      subject = subject.replace(regex, templateData[key])
      body = body.replace(regex, templateData[key])
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: [recipient_email],
        subject: subject,
        html: body.replace(/\n/g, '<br>'),
      }),
    })

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.json()
      console.error('Resend API Error:', errorBody)
      throw new Error(`Failed to send email: ${errorBody.message}`)
    }

    return new Response(JSON.stringify({ message: 'Email sent successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})