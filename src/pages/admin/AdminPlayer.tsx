
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import AdminLayout from '@/components/admin/AdminLayout';
import PlayerAPIManager from '@/components/admin/player/PlayerAPIManager';
import PlayerSettings from '@/components/admin/player/PlayerSettings';
import { Film, Settings, Shield } from 'lucide-react';

const AdminPlayer = () => {
  return (
    <AdminLayout>
      <div className="container px-4 py-6 max-w-7xl mx-auto">
        <div className="flex items-center">
          <Film className="h-8 w-8 mr-3 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Player Management</h1>
            <p className="text-muted-foreground">
              Configure player sources and settings for optimal content viewing
            </p>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <Tabs defaultValue="sources" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="sources" className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                <span>API Sources</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                <span>Player Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="sources" className="space-y-6">
            <PlayerAPIManager />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <PlayerSettings />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPlayer;
