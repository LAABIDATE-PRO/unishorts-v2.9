// @ts-nocheck
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// List of common free email providers to block
const blockedDomains = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'protonmail.com', 'zoho.com', 'gmx.com', 'mail.com'
]);

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

    // Step 1: Validate the email domain
    const emailDomain = email.split('@')[1];
    if (!emailDomain) {
        return new Response(JSON.stringify({ error: 'Invalid email format.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }

    // Check if the domain is on the blocked list of free providers
    if (blockedDomains.has(emailDomain.toLowerCase())) {
      return new Response(JSON.stringify({ error: 'Please use a valid university email address. Free email providers are not accepted.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Step 2: Check if the domain is on the approved list
    const { count, error: domainError } = await supabaseAdmin
      .from('institutions')
      .select('id', { count: 'exact', head: true })
      .filter('approved_domains', 'cs', `{${emailDomain}}`);

    if (domainError) {
        console.error('Error checking domain:', domainError);
        throw new Error('Could not verify university domain.');
    }

    if (count === 0) {
      return new Response(JSON.stringify({ error: 'The provided email does not belong to an approved university. Please contact support if you believe this is an error.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Step 3: Create the user in auth.users
    const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: data,
      email_confirm: false, // We will trigger the email from the client
    })

    if (authError) {
      console.error('Error creating user:', authError)
      return new Response(JSON.stringify({ error: authError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (!userData.user) {
        throw new Error("User creation did not return a user object.");
    }

    // Step 4: Create the profile in public.profiles
    const profileData = {
        id: userData.user.id,
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        university_email: data.university_email,
        institution_name: data.institution_name,
        phone_number: data.phone_number,
        short_bio: data.short_bio,
        role: 'user',
        account_status: 'pending_email_verification' // Set initial status
    };

    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert(profileData);

    if (profileError) {
        console.error('Error creating profile:', profileError);
        await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
        
        if (profileError.code === '23505') { // Unique constraint violation
            return new Response(JSON.stringify({ error: 'This username is already taken. Please choose another one.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 409, // Conflict
            });
        }

        return new Response(JSON.stringify({ error: `Failed to create profile: ${profileError.message}` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }

    // Log the registration event
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]
    await supabaseAdmin.from('system_logs').insert({
      user_id: userData.user.id,
      user_email: userData.user.email,
      action: 'USER_REGISTER',
      details: { message: `New user registered: ${userData.user.email}` },
      ip_address: ip,
    })

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