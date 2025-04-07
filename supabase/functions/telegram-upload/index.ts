
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
const TELEGRAM_CHANNEL_ID = Deno.env.get('TELEGRAM_CHANNEL_ID') ?? '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Check if Telegram bot token is configured
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
      return new Response(
        JSON.stringify({
          error: 'Telegram bot not configured. Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID environment variables.'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      )
    }

    // Parse multipart form data
    const formData = await req.formData()
    const file = formData.get('file') as File
    const metadataRaw = formData.get('metadata')
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      )
    }

    // Parse metadata if provided
    let metadata = {}
    if (metadataRaw) {
      try {
        metadata = JSON.parse(metadataRaw as string)
      } catch (e) {
        console.error('Error parsing metadata:', e)
      }
    }

    // Get the file data as ArrayBuffer
    const fileData = await file.arrayBuffer()

    // Upload file to Telegram
    const formDataTelegram = new FormData()
    formDataTelegram.append('chat_id', TELEGRAM_CHANNEL_ID)
    formDataTelegram.append('document', new Blob([fileData], { type: file.type }), file.name)

    // Send document to Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`,
      {
        method: 'POST',
        body: formDataTelegram,
      }
    )

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.json()
      throw new Error(`Telegram API error: ${JSON.stringify(errorData)}`)
    }

    const telegramData = await telegramResponse.json()
    
    // Get the file ID from Telegram's response
    const telegramFileId = telegramData?.result?.document?.file_id
    
    if (!telegramFileId) {
      throw new Error('Failed to get file ID from Telegram')
    }

    // Store the file information in Supabase
    const { data: storedFile, error } = await supabaseClient
      .from('telegram_files')
      .insert({
        file_id: telegramFileId,
        file_name: file.name,
        mime_type: file.type,
        size: file.size,
        metadata: metadata,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        file: {
          id: storedFile.id,
          fileId: storedFile.file_id,
          fileName: storedFile.file_name,
          mimeType: storedFile.mime_type,
          size: storedFile.size,
          metadata: storedFile.metadata,
          uploadDate: storedFile.created_at
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
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
