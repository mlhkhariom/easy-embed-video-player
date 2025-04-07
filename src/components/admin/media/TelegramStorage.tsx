
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { getTelegramFiles, deleteTelegramFile, useTelegramUploader, TelegramFile } from '@/services/TelegramStorage';
import { Trash2, Upload, FileIcon, FileCog, ExternalLink, Copy } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const TelegramStorage: React.FC = () => {
  const [files, setFiles] = useState<TelegramFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { uploadFile } = useTelegramUploader();
  const { toast } = useToast();
  
  useEffect(() => {
    loadFiles();
  }, []);
  
  const loadFiles = async () => {
    setIsLoading(true);
    const telegramFiles = await getTelegramFiles();
    setFiles(telegramFiles);
    setIsLoading(false);
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const file = fileList[0];
    
    try {
      // Upload file with progress tracking
      const uploadResult = await uploadFile({
        fileName: file.name,
        fileData: file,
        onProgress: (progress) => setUploadProgress(progress),
      });
      
      if (uploadResult) {
        // Refresh files list
        loadFiles();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload Error',
        description: 'An error occurred while uploading the file.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };
  
  const handleDelete = async (fileId: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      const success = await deleteTelegramFile(fileId);
      
      if (success) {
        setFiles(files.filter(file => file.fileId !== fileId));
        toast({
          title: 'File Deleted',
          description: 'The file has been successfully deleted.',
        });
      } else {
        toast({
          title: 'Delete Failed',
          description: 'Failed to delete the file.',
          variant: 'destructive',
        });
      }
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'URL Copied',
        description: 'File URL copied to clipboard.',
      });
    });
  };
  
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    return '📁';
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium">Upload to Telegram Storage</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload files to be stored through the Telegram Bot API
            </p>
            
            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="file-upload">File</Label>
                <Input 
                  id="file-upload" 
                  type="file" 
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </div>
              
              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-xs text-muted-foreground text-right">
                    {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Telegram Files</h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-2 text-muted-foreground">Loading files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileIcon className="mx-auto h-12 w-12 opacity-30" />
              <p className="mt-2">No files uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <Card key={file.id} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2 truncate">
                        <span className="text-2xl">{getFileIcon(file.mimeType)}</span>
                        <div className="truncate">
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <p className="font-medium truncate hover:underline cursor-help">{file.fileName}</p>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80" align="start">
                              <div className="space-y-1">
                                <p className="text-sm font-semibold">{file.fileName}</p>
                                <p className="text-xs text-muted-foreground">{file.mimeType}</p>
                                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                                <p className="text-xs text-muted-foreground">Uploaded: {new Date(file.uploadDate).toLocaleString()}</p>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                          <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(file.fileId)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    
                    <div className="mt-4 flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => copyToClipboard(file.url || '')}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          {!isLoading && files.length > 0 && (
            <div className="mt-4 text-right">
              <Button 
                variant="outline" 
                size="sm"
                onClick={loadFiles}
              >
                Refresh List
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TelegramStorage;
