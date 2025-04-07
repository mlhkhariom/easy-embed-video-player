
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import AdminLayout from '@/components/admin/AdminLayout';
import TelegramStorage from '@/components/admin/media/TelegramStorage';
import { FileVideo, Upload, Cloud, Database } from 'lucide-react';

const AdminMedia = () => {
  return (
    <AdminLayout>
      <div className="container px-4 py-6 max-w-7xl mx-auto">
        <div className="flex items-center">
          <FileVideo className="h-8 w-8 mr-3 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Media Management</h1>
            <p className="text-muted-foreground">
              Upload and manage your media files from different sources
            </p>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <Tabs defaultValue="telegram" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="telegram" className="flex items-center">
                <Cloud className="h-4 w-4 mr-2" />
                <span>Telegram Storage</span>
              </TabsTrigger>
              <TabsTrigger value="uploader" className="flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                <span>File Uploader</span>
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center">
                <Database className="h-4 w-4 mr-2" />
                <span>Media Library</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="telegram" className="space-y-6">
            <TelegramStorage />
          </TabsContent>
          
          <TabsContent value="uploader" className="space-y-6">
            <div className="text-center py-16">
              <Upload className="h-16 w-16 text-muted-foreground mx-auto" />
              <h3 className="mt-4 text-lg font-medium">File Uploader</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                This feature is coming soon. You'll be able to upload files directly to the server.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="library" className="space-y-6">
            <div className="text-center py-16">
              <Database className="h-16 w-16 text-muted-foreground mx-auto" />
              <h3 className="mt-4 text-lg font-medium">Media Library</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                This feature is coming soon. You'll be able to manage all your media files in one place.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminMedia;
