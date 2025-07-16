// @ts-nocheck
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const blockedDomains = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'protonmail.com', 'zoho.com', 'gmx.com', 'mail.com'
]);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const { email, password, data } = await req.json()
    if (!email || !password || !data || !data.username) {
      return new Response(JSON.stringify({ error: 'Email, password, and user data (including username) are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // --- Pre-flight Checks ---
    const emailDomain = email.split('@')[1];
    if (!emailDomain) {
        return new Response(JSON.stringify({ error: 'Invalid email format.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }
    if (blockedDomains.has(emailDomain.toLowerCase())) {
      return new Response(JSON.stringify({ error: 'Please use a valid university email address. Free email providers are not accepted.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }
    const { count: domainCount, error: domainError } = await supabaseAdmin.from('institutions').select('id', { count: 'exact', head: true }).filter('approved_domains', 'cs', `{${emailDomain}}`);
    if (domainError) {
        console.error('Error checking domain:', domainError);
        throw new Error('Could not verify university domain.');
    }
    if (domainCount === 0) {
      return new Response(JSON.stringify({ error: 'The provided email does not belong to an approved university. Please contact support if you believe this is an error.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }

    const { count: usernameCount, error: usernameError } = await supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('username', data.username);
    if (usernameError) {
      console.error('Error checking username:', usernameError);
      throw new Error('Could not verify username.');
    }
    if (usernameCount > 0) {
      return new Response(JSON.stringify({ error: 'This username is already taken.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 });
    }

    // --- User & Profile Creation ---
    const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // User is confirmed automatically
      user_metadata: { 
        first_name: data.first_name,
        last_name: data.last_name,
      },
    })

    if (authError) {
      console.error('Error creating user in auth:', authError)
      return new Response(JSON.stringify({ error: authError.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: authError.status || 400 })
    }

    const user = userData.user;
    if (!user) {
        throw new Error("User creation did not return a user object.");
    }

    const profileData = {
        id: user.id,
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        university_email: data.university_email,
        institution_name: data.institution_name,
        phone_number: data.phone_number,
        join_reason: data.join_reason,
        role: 'user',
        account_status: 'pending_admin_approval' // Set status directly to pending approval
    };
    const { error: profileError } = await supabaseAdmin.from('profiles').insert(profileData);
    
    if (profileError) {
      console.error('Error creating profile, rolling back user:', profileError);
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      return new Response(JSON.stringify({ error: `Failed to create profile: ${profileError.message}` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }

    return new Response(JSON.stringify({ message: "User created successfully. Your account is pending admin approval." }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 })

  } catch (e) {
    console.error('Top-level signup error:', e)
    return new Response(JSON.stringify({ error: e.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
  }
})