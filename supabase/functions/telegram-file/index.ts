
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
    // Get file ID from URL path
    const url = new URL(req.url);
    const fileId = url.pathname.split('/').pop();

    if (!fileId) {
      return new Response(
        JSON.stringify({ error: 'No file ID provided' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      )
    }

    // Get file info from Supabase
    const { data: fileInfo, error: fileError } = await supabaseClient
      .from('telegram_files')
      .select('*')
      .eq('file_id', fileId)
      .single()

    if (fileError) {
      return new Response(
        JSON.stringify({ error: 'File not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      )
    }

    // Get file path from Telegram
    const telegramFileResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`
    )

    if (!telegramFileResponse.ok) {
      const errorData = await telegramFileResponse.json()
      throw new Error(`Telegram API error: ${JSON.stringify(errorData)}`)
    }

    const telegramFileData = await telegramFileResponse.json()
    const filePath = telegramFileData?.result?.file_path

    if (!filePath) {
      throw new Error('Failed to get file path from Telegram')
    }

    // Get the file content from Telegram
    const fileResponse = await fetch(
      `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`
    )

    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch file from Telegram: ${fileResponse.status}`)
    }

    // Return file content with appropriate headers
    const fileContent = await fileResponse.arrayBuffer()
    
    return new Response(fileContent, {
      status: 200,
      headers: {
        'Content-Type': fileInfo.mime_type,
        'Content-Disposition': `inline; filename="${fileInfo.file_name}"`,
        ...corsHeaders,
      },
    })
  } catch (error) {
    // Log and return error
    console.error('Error processing request:', error)
    
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
