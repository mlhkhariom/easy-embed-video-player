
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get request body
    const { action, sources } = await req.json()

    // Based on action, perform different operations
    if (action === 'syncSources' && Array.isArray(sources)) {
      // Sync sources to the database
      for (const source of sources) {
        const { data, error } = await supabase
          .from('cloudstream_sources')
          .upsert({
            name: source.name,
            url: source.url,
            logo: source.logo || null,
            language: source.language || null,
            categories: source.categories || [],
            repo: source.repo,
            description: source.description || null,
            is_enabled: true
          }, {
            onConflict: 'name',
            ignoreDuplicates: false
          })

        if (error) {
          console.error(`Error syncing source ${source.name}:`, error)
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Sources synced successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If we reach this point, the action was not recognized
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    // Return error response
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
