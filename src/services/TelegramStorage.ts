
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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
    const { data, error } = await supabase
      .from('telegram_files')
      .select('*')
      .order('uploadDate', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching Telegram files:', error);
    return [];
  }
};

/**
 * Delete a file from Telegram storage
 */
export const deleteTelegramFile = async (fileId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('telegram_files')
      .delete()
      .eq('fileId', fileId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting Telegram file:', error);
    return false;
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
