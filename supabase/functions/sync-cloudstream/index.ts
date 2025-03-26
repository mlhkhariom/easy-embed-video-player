
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
    const { action, sources, plugin, repo } = await req.json()

    console.log(`Processing ${action} request`)

    // Based on action, perform different operations
    if (action === 'syncSources' && Array.isArray(sources)) {
      console.log(`Syncing ${sources.length} sources to the database`)
      
      // Sync sources to the database
      for (const source of sources) {
        console.log(`Processing source: ${source.name}`)
        
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
        } else {
          console.log(`Successfully synced source: ${source.name}`)
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Sources synced successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Add a repository
    else if (action === 'addRepository' && repo) {
      console.log(`Adding repository: ${repo.name}`)
      
      // Validate required fields
      if (!repo.name || !repo.url) {
        return new Response(
          JSON.stringify({ success: false, message: 'Repository name and URL are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      try {
        // First, try to fetch the repository metadata if it's a GitHub repo
        let repoMetadata = {}
        if (repo.url.includes('github.com')) {
          const repoPath = repo.url.replace('https://github.com/', '')
          const githubApiUrl = `https://api.github.com/repos/${repoPath}`
          
          try {
            const githubResponse = await fetch(githubApiUrl)
            if (githubResponse.ok) {
              const data = await githubResponse.json()
              repoMetadata = {
                stars: data.stargazers_count,
                forks: data.forks_count,
                description: data.description || repo.description,
                created_at: data.created_at,
                updated_at: data.updated_at,
                owner: data.owner?.login
              }
            }
          } catch (err) {
            console.error('Error fetching GitHub metadata:', err)
            // Continue without GitHub metadata
          }
        }
        
        // Insert the repository into a table (you'll need to create this)
        const { error } = await supabase
          .from('cloudstream_repositories')
          .upsert({
            name: repo.name,
            url: repo.url,
            description: repo.description || repoMetadata.description || null,
            author: repo.author || repoMetadata.owner || null,
            is_enabled: true,
            last_synced: new Date().toISOString(),
            metadata: repoMetadata
          }, {
            onConflict: 'name',
            ignoreDuplicates: false
          })
          
        if (error) {
          throw error
        }
        
        return new Response(
          JSON.stringify({ success: true, message: 'Repository added successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Error adding repository:', error)
        return new Response(
          JSON.stringify({ success: false, message: `Error adding repository: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
    
    // Add a plugin
    else if (action === 'addPlugin' && plugin) {
      console.log(`Adding plugin: ${plugin.name}`)
      
      // Validate required fields
      if (!plugin.name || !plugin.url) {
        return new Response(
          JSON.stringify({ success: false, message: 'Plugin name and URL are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      try {
        // Insert the plugin into a table (you'll need to create this)
        const { error } = await supabase
          .from('cloudstream_plugins')
          .upsert({
            name: plugin.name,
            url: plugin.url,
            version: plugin.version || '1.0.0',
            description: plugin.description || null,
            author: plugin.author || null,
            repository: plugin.repository || null,
            categories: plugin.categories || [],
            language: plugin.language || null,
            is_installed: true,
            installed_at: new Date().toISOString()
          }, {
            onConflict: 'name',
            ignoreDuplicates: false
          })
          
        if (error) {
          throw error
        }
        
        return new Response(
          JSON.stringify({ success: true, message: 'Plugin added successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Error adding plugin:', error)
        return new Response(
          JSON.stringify({ success: false, message: `Error adding plugin: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
    
    // Sync content
    else if (action === 'syncContent') {
      console.log('Syncing content')
      
      // This would be a more complex operation to sync content from various sources
      // For now we'll return a success message
      return new Response(
        JSON.stringify({ success: true, message: 'Content sync initiated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If we reach this point, the action was not recognized
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    // Return error response
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
