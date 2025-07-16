// @ts-nocheck
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Basic user-agent parser
function parseUserAgent(ua) {
  let device_type = 'Desktop';
  if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    device_type = 'Mobile';
  } else if (/Tablet|iPad/i.test(ua)) {
    device_type = 'Tablet';
  }

  let os = 'Unknown';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Unknown';
  const browserMatch = ua.match(/(Firefox|Chrome|Safari|Edge|Opera|MSIE|Trident)\/([\d.]+)/);
  if (browserMatch) {
    browser = `${browserMatch[1]} ${browserMatch[2]}`;
  }

  return { device_type, os, browser };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { film_id, user_id, anonymous_id, duration_watched_seconds, watch_percentage } = await req.json()
    if (!film_id || (!user_id && !anonymous_id)) {
      throw new Error('film_id and either user_id or anonymous_id are required');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get device info from headers
    const userAgent = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim();
    const { device_type, os, browser } = parseUserAgent(userAgent);

    let country = 'Unknown', city = 'Unknown';
    if (ip) {
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          country = geoData.country || 'Unknown';
          city = geoData.city || 'Unknown';
        }
      } catch (geoError) {
        console.error('IP Geolocation failed:', geoError);
      }
    }

    const viewData = {
      film_id,
      user_id: user_id || null,
      anonymous_id: anonymous_id || null,
      device_type,
      os,
      browser,
      country,
      city,
      duration_watched_seconds: Math.round(duration_watched_seconds),
      watch_percentage,
      ip_address: ip,
    };

    const { error: insertError } = await supabaseAdmin.from('film_views').insert(viewData);
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ message: 'View logged successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})