import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTelegramFiles, searchTelegramFiles, TelegramFile } from '@/services/TelegramStorage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatBytes } from '@/lib/utils';
import { Search, ImageIcon, FileIcon, Film, Tv } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface TelegramMediaSelectorProps {
  onSelect: (file: TelegramFile) => void;
  contentType?: 'movie' | 'tv' | 'web-series';
  imageType?: 'poster' | 'backdrop' | 'all';
}

const TelegramMediaSelector: React.FC<TelegramMediaSelectorProps> = ({
  onSelect,
  contentType,
  imageType = 'all'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState<TelegramFile[]>([]);
  
  // Fetch all files
  const { data: allFiles = [], isLoading, refetch } = useQuery({
    queryKey: ['telegram-files'],
    queryFn: getTelegramFiles
  });
  
  useEffect(() => {
    if (allFiles.length > 0) {
      applyFilters(allFiles);
    }
  }, [allFiles, contentType, imageType]);
  
  // Apply filters based on contentType and imageType
  const applyFilters = (files: TelegramFile[]) => {
    let result = [...files];
    
    if (contentType) {
      result = result.filter(file => 
        file.metadata.contentType === contentType ||
        !file.metadata.contentType
      );
    }
    
    if (imageType && imageType !== 'all') {
      result = result.filter(file => 
        file.metadata.imageType === imageType ||
        !file.metadata.imageType
      );
    }
    
    setFilteredFiles(result);
  };
  
  // Handle search input
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      applyFilters(allFiles);
      return;
    }
    
    const searchResults = await searchTelegramFiles(searchQuery);
    applyFilters(searchResults);
  };
  
  // Handle file type icon
  const getFileIcon = (file: TelegramFile) => {
    if (file.mimeType.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5" />;
    } else if (file.mimeType.startsWith('video/')) {
      return <Film className="h-5 w-5" />;
    } else {
      return <FileIcon className="h-5 w-5" />;
    }
  };
  
  // Handle content type icon
  const getContentTypeIcon = (file: TelegramFile) => {
    const type = file.metadata?.contentType;
    
    if (type === 'movie') {
      return <Film className="h-4 w-4" />;
    } else if (type === 'tv' || type === 'web-series') {
      return <Tv className="h-4 w-4" />;
    }
    
    return null;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search Telegram files..."
            className="pl-10"
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
        <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {isLoading ? (
              <p>Loading files...</p>
            ) : filteredFiles.length === 0 ? (
              <p>No files found</p>
            ) : (
              filteredFiles.map(file => (
                <Card 
                  key={file.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => onSelect(file)}
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="aspect-video bg-muted flex items-center justify-center relative rounded-sm overflow-hidden">
                      {file.mimeType.startsWith('image/') ? (
                        <img 
                          src={file.url} 
                          alt={file.fileName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          {getFileIcon(file)}
                          <span className="text-xs mt-1">{file.mimeType.split('/')[1]}</span>
                        </div>
                      )}
                      
                      {file.metadata?.contentType && (
                        <div className="absolute top-1 right-1 bg-black/50 p-1 rounded-sm">
                          {getContentTypeIcon(file)}
                        </div>
                      )}
                      
                      {file.metadata?.imageType && (
                        <div className="absolute bottom-1 left-1 bg-black/50 p-1 rounded-sm text-xs">
                          {file.metadata.imageType}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium truncate" title={file.fileName}>
                        {file.fileName}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center justify-between">
                        <span>{formatBytes(file.size)}</span>
                        {file.metadata?.title && (
                          <span className="truncate max-w-[70%]" title={file.metadata.title}>
                            {file.metadata.title}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="images" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredFiles
              .filter(file => file.mimeType.startsWith('image/'))
              .map(file => (
                <Card 
                  key={file.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => onSelect(file)}
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="aspect-video bg-muted flex items-center justify-center relative rounded-sm overflow-hidden">
                      <img 
                        src={file.url} 
                        alt={file.fileName}
                        className="w-full h-full object-cover"
                      />
                      
                      {file.metadata?.contentType && (
                        <div className="absolute top-1 right-1 bg-black/50 p-1 rounded-sm">
                          {getContentTypeIcon(file)}
                        </div>
                      )}
                      
                      {file.metadata?.imageType && (
                        <div className="absolute bottom-1 left-1 bg-black/50 p-1 rounded-sm text-xs">
                          {file.metadata.imageType}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium truncate" title={file.fileName}>
                        {file.fileName}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center justify-between">
                        <span>{formatBytes(file.size)}</span>
                        {file.metadata?.title && (
                          <span className="truncate max-w-[70%]" title={file.metadata.title}>
                            {file.metadata.title}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
        
        {/* Videos tab with similar structure */}
        <TabsContent value="videos" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredFiles
              .filter(file => file.mimeType.startsWith('video/'))
              .map(file => (
                <Card 
                  key={file.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => onSelect(file)}
                >
                  <CardContent className="p-3 space-y-2">
                    {/* Similar content structure as images */}
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <Film className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-medium truncate" title={file.fileName}>
                        {file.fileName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatBytes(file.size)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
        
        {/* Other files tab */}
        <TabsContent value="other" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredFiles
              .filter(file => !file.mimeType.startsWith('image/') && !file.mimeType.startsWith('video/'))
              .map(file => (
                <Card 
                  key={file.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => onSelect(file)}
                >
                  <CardContent className="p-3 space-y-2">
                    {/* Similar content structure as images */}
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <FileIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-medium truncate" title={file.fileName}>
                        {file.fileName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatBytes(file.size)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TelegramMediaSelector;
