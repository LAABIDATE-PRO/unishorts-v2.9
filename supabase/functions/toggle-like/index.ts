// @ts-nocheck
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
    const { film_id, user_id } = await req.json()
    if (!film_id || !user_id) {
      return new Response(JSON.stringify({ error: 'film_id and user_id are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if the user has already liked the film
    const { data: existingLike, error: selectError } = await supabaseAdmin
      .from('likes')
      .select('id')
      .eq('user_id', user_id)
      .eq('film_id', film_id)
      .single()

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 means no rows found
      throw selectError
    }

    let message = ''
    if (existingLike) {
      // If liked, unlike it
      const { error: deleteError } = await supabaseAdmin
        .from('likes')
        .delete()
        .eq('id', existingLike.id)
      if (deleteError) throw deleteError
      message = 'Film unliked successfully'
    } else {
      // If not liked, like it
      const { error: insertError } = await supabaseAdmin
        .from('likes')
        .insert({ user_id, film_id })
      if (insertError) throw insertError
      message = 'Film liked successfully'
    }

    return new Response(JSON.stringify({ message }), {
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