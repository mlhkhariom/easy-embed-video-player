
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create Supabase client using environment variables
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Telegram Bot API
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') ?? '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  try {
    // Parse URL to get search query
    const url = new URL(req.url);
    const query = url.searchParams.get('query') || '';

    // Search files in telegram_files table
    const { data: files, error } = await supabaseClient
      .from('telegram_files')
      .select('*')
      .or(`file_name.ilike.%${query}%,metadata->>'title'.ilike.%${query}%`)
      .order('upload_date', { ascending: false });

    if (error) {
      throw error;
    }

    // Transform file data for response
    const transformedFiles = files.map(file => ({
      id: file.id,
      fileId: file.file_id,
      fileName: file.file_name,
      mimeType: file.mime_type,
      size: file.size,
      metadata: file.metadata || {},
      uploadDate: file.upload_date,
      url: `/api/telegram/file/${file.file_id}`
    }));

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        files: transformedFiles
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  } catch (error) {
    // Log and return error
    console.error('Error processing search request:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  }
})
