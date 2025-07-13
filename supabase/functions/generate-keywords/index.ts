/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// v1.2 - Force redeploy to load secrets
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')

serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  let logData: any = { feature_used: 'generate-keywords' };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { title, description, userId } = await req.json()
    logData.user_id = userId;
    logData.input = { title, description };

    if (!title || !description) {
      throw new Error('Title and description are required');
    }
    
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API key is not set in environment variables.')
    }

    const prompt = `You are an expert in film categorization and SEO. Based on the following film title and summary, generate a list of 10 relevant and specific keywords or tags. Return ONLY the keywords as a JSON array of strings (e.g., ["keyword1", "keyword2"]). Do not include any other text or explanations. Title: ${title}. Summary: ${description}.`

    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { "role": "user", "content": prompt }
        ],
        temperature: 0.7,
        max_tokens: 100,
      })
    })

    if (!deepseekResponse.ok) {
      const errorBody = await deepseekResponse.text()
      throw new Error(`DeepSeek API error: ${deepseekResponse.status} ${errorBody}`)
    }

    const responseData = await deepseekResponse.json()
    const content = responseData.choices[0].message.content
    
    let keywords = []
    try {
      const jsonMatch = content.match(/\[.*\]/s);
      if (jsonMatch) {
        keywords = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Could not parse keywords from AI response.")
      }
    } catch (e) {
      console.error("Failed to parse keywords:", content)
      throw new Error("Could not parse keywords from AI response.")
    }

    logData.output = { keywords };
    await supabaseAdmin.from('ai_logs').insert(logData);

    return new Response(JSON.stringify({ keywords }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (e) {
    console.error(e)
    logData.error = e.message;
    await supabaseAdmin.from('ai_logs').insert(logData);
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})