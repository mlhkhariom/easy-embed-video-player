
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TelegramFile, getTelegramFiles, deleteTelegramFile, useTelegramUploader } from '@/services/TelegramStorage';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Cloud,
  File,
  FileText,
  FilePlus,
  FileVideo,
  FileImage,
  FileAudio,
  Trash2,
  Loader2,
  Download,
  Info,
  Link2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const TelegramStorage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMetadata, setUploadMetadata] = useState<string>('');
  const [metadataError, setMetadataError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [fileDetails, setFileDetails] = useState<TelegramFile | null>(null);
  const { toast } = useToast();
  const { uploadFile } = useTelegramUploader();
  const queryClient = useQueryClient();
  
  // Fetch files
  const { data: files = [], isLoading, error } = useQuery({
    queryKey: ['telegramFiles'],
    queryFn: getTelegramFiles
  });
  
  // Delete file mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTelegramFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegramFiles'] });
      toast({
        title: 'File deleted',
        description: 'The file has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete file: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleMetadataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUploadMetadata(e.target.value);
    setMetadataError('');
  };
  
  const validateMetadata = () => {
    if (!uploadMetadata.trim()) return true;
    
    try {
      JSON.parse(uploadMetadata);
      return true;
    } catch (e) {
      setMetadataError('Invalid JSON format');
      return false;
    }
  };
  
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!validateMetadata()) return;
    
    setIsUploading(true);
    
    try {
      let metadata = {};
      if (uploadMetadata.trim()) {
        metadata = JSON.parse(uploadMetadata);
      }
      
      await uploadFile({
        fileName: selectedFile.name,
        fileData: selectedFile,
        metadata
      });
      
      // Reset form
      setSelectedFile(null);
      setUploadMetadata('');
      
      // Refetch file list
      queryClient.invalidateQueries({ queryKey: ['telegramFiles'] });
      
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload failed',
        description: 'An error occurred during upload.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDelete = (fileId: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      deleteMutation.mutate(fileId);
    }
  };
  
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <FileImage className="h-5 w-5" />;
    if (mimeType.startsWith('video/')) return <FileVideo className="h-5 w-5" />;
    if (mimeType.startsWith('audio/')) return <FileAudio className="h-5 w-5" />;
    if (mimeType.startsWith('text/')) return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };
  
  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };
  
  const viewFileDetails = (file: TelegramFile) => {
    setFileDetails(file);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'The link has been copied to your clipboard.',
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Telegram Storage</h2>
          <p className="text-muted-foreground">
            Upload and manage media files using Telegram as a storage backend
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" /> Upload File
            </CardTitle>
            <CardDescription>
              Upload new files to Telegram storage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept="*/*"
                />
                {selectedFile && (
                  <div className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="metadata">
                  Metadata (Optional JSON)
                </Label>
                <Textarea
                  id="metadata"
                  placeholder='{ "title": "My Video", "description": "A great video" }'
                  value={uploadMetadata}
                  onChange={handleMetadataChange}
                  className="h-32"
                />
                {metadataError && (
                  <p className="text-sm text-destructive">{metadataError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter metadata as JSON to store with the file
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isUploading || !selectedFile}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FilePlus className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Uploaded Files
            </CardTitle>
            <CardDescription>
              Manage your uploaded files
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="py-8 text-center text-destructive">
                Failed to load files
              </div>
            ) : files.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No files uploaded yet
              </div>
            ) : (
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Size</TableHead>
                      <TableHead className="hidden lg:table-cell">Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>
                          <div className="flex justify-center">
                            {getFileIcon(file.mimeType)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium truncate max-w-[120px] md:max-w-[200px]">
                          {file.fileName}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatFileSize(file.size)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {new Date(file.uploadDate).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => copyToClipboard(`/api/telegram/file/${file.fileId}`)}
                                  >
                                    <Link2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copy file URL</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => viewFileDetails(file)}
                                  >
                                    <Info className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View details</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(file.fileId)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete file</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={!!fileDetails} onOpenChange={(open) => !open && setFileDetails(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>File Details</DialogTitle>
            <DialogDescription>
              Information about the uploaded file
            </DialogDescription>
          </DialogHeader>
          
          {fileDetails && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-muted p-4">
                  {getFileIcon(fileDetails.mimeType)}
                </div>
                <div>
                  <h3 className="font-medium">{fileDetails.fileName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(fileDetails.size)} • {fileDetails.mimeType}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">File ID</Label>
                  <div className="flex rounded-md border mt-1 overflow-hidden">
                    <div className="truncate p-2 flex-1 bg-muted font-mono text-xs">
                      {fileDetails.fileId}
                    </div>
                    <Button
                      variant="ghost"
                      className="px-2 rounded-none border-l"
                      onClick={() => copyToClipboard(fileDetails.fileId)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Upload Date</Label>
                  <div className="text-sm p-2 bg-muted rounded-md mt-1">
                    {new Date(fileDetails.uploadDate).toLocaleString()}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <Label className="text-sm">File URL</Label>
                  <div className="flex rounded-md border mt-1 overflow-hidden">
                    <div className="truncate p-2 flex-1 bg-muted font-mono text-xs">
                      {`/api/telegram/file/${fileDetails.fileId}`}
                    </div>
                    <Button
                      variant="ghost"
                      className="px-2 rounded-none border-l"
                      onClick={() => copyToClipboard(`/api/telegram/file/${fileDetails.fileId}`)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
              
              {fileDetails.metadata && Object.keys(fileDetails.metadata).length > 0 && (
                <div>
                  <Label className="text-sm">Metadata</Label>
                  <ScrollArea className="h-64 mt-1 rounded-md border">
                    <pre className="p-4 text-xs bg-muted">
                      {JSON.stringify(fileDetails.metadata, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFileDetails(null)}
            >
              Close
            </Button>
            {fileDetails && (
              <Button
                variant="default"
                onClick={() => window.open(`/api/telegram/file/${fileDetails.fileId}`, '_blank')}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TelegramStorage;
