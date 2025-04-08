
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { formatBytes } from '@/lib/utils';

export interface TelegramFile {
  id: string;
  fileId: string;
  fileName: string;
  mimeType: string;
  size: number;
  metadata: Record<string, any>;
  uploadDate: string;
  url?: string;
}

export interface TelegramUploadOptions {
  fileName: string;
  fileData: File | Blob;
  metadata?: Record<string, any>;
  onProgress?: (progress: number) => void;
}

// Telegram Bot configuration
const TELEGRAM_BOT_TOKEN = '7932369696:AAH420iQ3bgzOcz0JsW2pmq342BIupjw7dw';
const TELEGRAM_CHANNEL_ID = '1924990488';

/**
 * Upload a file to Telegram storage through our backend
 */
export const uploadFileToTelegram = async (options: TelegramUploadOptions): Promise<TelegramFile | null> => {
  try {
    // Create form data for the file upload
    const formData = new FormData();
    formData.append('file', options.fileData, options.fileName);
    
    if (options.metadata) {
      formData.append('metadata', JSON.stringify(options.metadata));
    }
    
    // Call our backend API to upload the file to Telegram
    const response = await fetch('/api/telegram/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload file to Telegram');
    }
    
    const data = await response.json();
    return data.file;
  } catch (error) {
    console.error('Error uploading file to Telegram:', error);
    return null;
  }
};

/**
 * Get all files stored in Telegram through our backend
 */
export const getTelegramFiles = async (): Promise<TelegramFile[]> => {
  try {
    // Use any type to bypass TypeScript checking for RPC calls
    const { data, error } = await (supabase as any).rpc('get_all_telegram_files');
    
    if (error) {
      console.error('Error fetching telegram files:', error);
      throw error;
    }

    // Transform the DB column names to our interface format
    return (data || []).map((file: any) => ({
      id: file.id,
      fileId: file.file_id,
      fileName: file.file_name,
      mimeType: file.mime_type,
      size: file.size,
      metadata: file.metadata || {},
      uploadDate: file.upload_date,
      url: getTelegramFileUrl(file.file_id)
    }));
  } catch (error) {
    console.error('Error fetching Telegram files:', error);
    return [];
  }
};

/**
 * Search files in Telegram storage by name or metadata
 */
export const searchTelegramFiles = async (query: string): Promise<TelegramFile[]> => {
  try {
    // Use any type to bypass TypeScript checking for RPC calls
    const { data, error } = await (supabase as any).rpc('search_telegram_files', { 
      search_query: query.toLowerCase() 
    });
    
    if (error) {
      console.error('Error searching telegram files:', error);
      throw error;
    }

    // Transform the DB column names to our interface format
    return (data || []).map((file: any) => ({
      id: file.id,
      fileId: file.file_id,
      fileName: file.file_name,
      mimeType: file.mime_type,
      size: file.size,
      metadata: file.metadata || {},
      uploadDate: file.upload_date,
      url: getTelegramFileUrl(file.file_id)
    }));
  } catch (error) {
    console.error('Error searching Telegram files:', error);
    return [];
  }
};

/**
 * Delete a file from Telegram storage
 */
export const deleteTelegramFile = async (fileId: string): Promise<boolean> => {
  try {
    // Use any type to bypass TypeScript checking for RPC calls
    const { error } = await (supabase as any).rpc('delete_telegram_file', {
      file_id_param: fileId
    });
    
    if (error) {
      console.error('Error deleting telegram file:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting Telegram file:', error);
    return false;
  }
};

/**
 * Upload media content from API to Telegram
 */
export const uploadContentToTelegram = async (
  contentData: { title: string; posterUrl: string; backdropUrl?: string; type: string; id: string },
  onProgress?: (progress: number) => void
): Promise<Record<string, string>> => {
  try {
    const results: Record<string, string> = {};
    let progress = 0;
    
    // Upload poster image
    if (contentData.posterUrl) {
      const posterResponse = await fetch(contentData.posterUrl);
      if (posterResponse.ok) {
        const posterBlob = await posterResponse.blob();
        const fileName = `${contentData.type}_${contentData.id}_poster.${posterBlob.type.split('/')[1] || 'jpg'}`;
        
        const posterFile = await uploadFileToTelegram({
          fileName,
          fileData: posterBlob,
          metadata: {
            contentType: contentData.type,
            contentId: contentData.id,
            imageType: 'poster',
            title: contentData.title
          }
        });
        
        if (posterFile) {
          results.poster = posterFile.url || '';
          progress = 50;
          if (onProgress) onProgress(progress);
        }
      }
    }
    
    // Upload backdrop image if available
    if (contentData.backdropUrl) {
      const backdropResponse = await fetch(contentData.backdropUrl);
      if (backdropResponse.ok) {
        const backdropBlob = await backdropResponse.blob();
        const fileName = `${contentData.type}_${contentData.id}_backdrop.${backdropBlob.type.split('/')[1] || 'jpg'}`;
        
        const backdropFile = await uploadFileToTelegram({
          fileName,
          fileData: backdropBlob,
          metadata: {
            contentType: contentData.type,
            contentId: contentData.id,
            imageType: 'backdrop',
            title: contentData.title
          }
        });
        
        if (backdropFile) {
          results.backdrop = backdropFile.url || '';
          progress = 100;
          if (onProgress) onProgress(progress);
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error uploading content to Telegram:', error);
    return {};
  }
};

/**
 * Generate a public URL for a Telegram file
 */
export const getTelegramFileUrl = (fileId: string): string => {
  return `/api/telegram/file/${fileId}`;
};

/**
 * Hook for uploading files to Telegram with toast notifications
 */
export const useTelegramUploader = () => {
  const { toast } = useToast();
  
  const uploadFile = async (options: TelegramUploadOptions) => {
    toast({
      title: 'Uploading file',
      description: `Uploading ${options.fileName} to Telegram...`,
    });
    
    const result = await uploadFileToTelegram(options);
    
    if (result) {
      toast({
        title: 'Upload successful',
        description: `${options.fileName} has been uploaded successfully.`,
      });
    } else {
      toast({
        title: 'Upload failed',
        description: `Failed to upload ${options.fileName}.`,
        variant: 'destructive',
      });
    }
    
    return result;
  };
  
  return { uploadFile };
};
