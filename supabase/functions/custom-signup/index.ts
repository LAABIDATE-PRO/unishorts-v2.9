/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password, data } = await req.json()
    if (!email || !password || !data) {
      return new Response(JSON.stringify({ error: 'Email, password, and data are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: userData, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: data,
      email_confirm: true, // Automatically confirm the user's email
    })

    if (error) {
      console.error('Error creating user:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Log the registration event
    if (userData.user) {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]
      await supabaseAdmin.from('system_logs').insert({
        user_id: userData.user.id,
        user_email: userData.user.email,
        action: 'USER_REGISTER',
        details: { message: `New user registered: ${userData.user.email}` },
        ip_address: ip,
      })
    }

    return new Response(JSON.stringify(userData), {
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