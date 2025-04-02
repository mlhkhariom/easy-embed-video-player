
// Create RPC functions to access CloudStream data

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get data from request
    const requestData = await req.json()
    const { action, data } = requestData

    let responseData = null
    let error = null

    // Handle different actions
    switch (action) {
      case 'get_plugins':
        const pluginsResult = await supabaseClient
          .from('cloudstream_plugins')
          .select('*')
        
        responseData = pluginsResult.data
        error = pluginsResult.error
        break
      
      case 'get_repositories':
        const reposResult = await supabaseClient
          .from('cloudstream_repositories')
          .select('*')
        
        responseData = reposResult.data
        error = reposResult.error
        break
      
      case 'get_sources':
        const sourcesResult = await supabaseClient
          .from('cloudstream_sources')
          .select('*')
        
        responseData = sourcesResult.data
        error = sourcesResult.error
        break
      
      case 'add_plugin':
        const addPluginResult = await supabaseClient
          .from('cloudstream_plugins')
          .insert([data])
        
        responseData = { success: !addPluginResult.error }
        error = addPluginResult.error
        break
      
      case 'add_repository':
        const addRepoResult = await supabaseClient
          .from('cloudstream_repositories')
          .insert([data])
        
        responseData = { success: !addRepoResult.error }
        error = addRepoResult.error
        break
      
      case 'sync_content':
        // For now, we'll just update the last_synced timestamp
        const timestamp = new Date().toISOString()
        
        // Update repositories
        const syncResult = await supabaseClient
          .from('cloudstream_repositories')
          .update({ last_synced: timestamp })
          .eq('is_enabled', true)
        
        responseData = { success: !syncResult.error }
        error = syncResult.error
        break
      
      case 'sync_sources':
        // This would be a more complex operation in a real app
        // For now, we'll just return success
        responseData = { success: true }
        break
      
      case 'search_content':
        // Mock search functionality for now
        const { query, sources, options } = requestData
        console.log('Search query:', query)
        console.log('Sources:', sources)
        console.log('Options:', options)
        
        // In a real app, this would search the content table
        responseData = { 
          results: [], 
          hasMore: false, 
          totalResults: 0 
        }
        break
      
      case 'get_content_details':
        // Mock content details for now
        const { contentId, sourceId } = requestData
        console.log('Content ID:', contentId)
        console.log('Source ID:', sourceId)
        
        // In a real app, this would fetch from the content table
        responseData = null
        break
      
      case 'parse_repository':
        // Mock repository parsing for now
        const { repoUrl } = requestData
        console.log('Repository URL:', repoUrl)
        
        // In a real app, this would fetch the repository and parse it
        responseData = { 
          plugins: [], 
          sources: [] 
        }
        break
      
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
    }

    if (error) throw error

    return new Response(
      JSON.stringify({ data: responseData }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

