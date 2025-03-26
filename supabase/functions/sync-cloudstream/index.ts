
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
    const { action, sources, plugin, repo, filters } = await req.json()

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
    
    // Search content with filters
    else if (action === 'searchContent') {
      console.log('Searching CloudStream content with filters:', filters)
      
      try {
        let query = supabase
          .from('cloudstream_content')
          .select('*, cloudstream_sources(*)')
          
        // Apply filters for Indian content
        if (filters) {
          if (filters.language) {
            query = query.eq('cloudstream_sources.language', filters.language)
          }
          
          if (filters.category) {
            query = query.contains('cloudstream_sources.categories', [filters.category])
          }
          
          // Special filter for Indian content
          if (filters.indianContent) {
            query = query.or('cloudstream_sources.language.eq.hi,cloudstream_sources.language.eq.ta,cloudstream_sources.language.eq.te,cloudstream_sources.language.eq.ml,cloudstream_sources.language.eq.kn,cloudstream_sources.language.eq.bn,cloudstream_sources.categories.cs.{indian}')
          }
          
          if (filters.query) {
            query = query.ilike('title', `%${filters.query}%`)
          }
        }
        
        // Add pagination
        if (filters && filters.page && filters.pageSize) {
          const start = (filters.page - 1) * filters.pageSize
          query = query.range(start, start + filters.pageSize - 1)
        }
        
        query = query.order('created_at', { ascending: false })
        
        const { data, error, count } = await query
        
        if (error) {
          throw error
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: data || [],
            total: count || 0
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Error searching content:', error)
        return new Response(
          JSON.stringify({ success: false, message: `Error searching content: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
    
    // Sync content
    else if (action === 'syncContent') {
      console.log('Syncing content')
      
      try {
        // Get all enabled sources
        const { data: sources, error: sourcesError } = await supabase
          .from('cloudstream_sources')
          .select('*')
          .eq('is_enabled', true)
          
        if (sourcesError) {
          throw sourcesError
        }
        
        if (!sources || sources.length === 0) {
          return new Response(
            JSON.stringify({ success: false, message: 'No enabled sources found' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // Mock syncing content from sources (in a real implementation, you would fetch from the actual sources)
        let syncedCount = 0
        
        for (const source of sources) {
          // Focus on Indian content
          if (source.language && ['hi', 'ta', 'te', 'ml', 'kn', 'bn'].includes(source.language) || 
              (source.categories && source.categories.includes('indian'))) {
            
            // Simulate adding random content for this source
            const contentCount = Math.floor(Math.random() * 5) + 1  // 1-5 random content items
            
            for (let i = 0; i < contentCount; i++) {
              const isMovie = Math.random() > 0.5
              const contentItem = {
                title: `${source.name} ${isMovie ? 'Movie' : 'Series'} ${i + 1}`,
                type: isMovie ? 'movie' : 'series',
                year: 2020 + Math.floor(Math.random() * 4),
                poster: `https://picsum.photos/seed/${source.name}${i}/300/450`,
                backdrop: `https://picsum.photos/seed/${source.name}${i}-bg/1280/720`,
                plot: `This is a sample ${source.language || 'Indian'} content item from the ${source.name} source.`,
                rating: Math.floor(Math.random() * 100) / 10,
                source_id: source.id,
                external_id: `${source.name.toLowerCase().replace(/\s+/g, '-')}-${i}`
              }
              
              const { error: insertError } = await supabase
                .from('cloudstream_content')
                .upsert(contentItem, {
                  onConflict: 'external_id',
                  ignoreDuplicates: false
                })
                
              if (insertError) {
                console.error(`Error inserting content for ${source.name}:`, insertError)
              } else {
                syncedCount++
              }
            }
          }
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Content sync completed. Added/updated ${syncedCount} items.` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Error syncing content:', error)
        return new Response(
          JSON.stringify({ success: false, message: `Error syncing content: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
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
