
import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Film, Link, FilePlus2, Settings as SettingsIcon } from 'lucide-react';
import PlayerAPIManager from '@/components/admin/player/PlayerAPIManager';
import PlayerSettings from '@/components/admin/player/PlayerSettings';

const AdminPlayer = () => {
  const [activeTab, setActiveTab] = useState('sources');

  return (
    <AdminLayout>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Player Management</h1>
            <p className="text-muted-foreground mt-1">
              Configure video player sources and settings
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Link className="h-4 w-4 mr-2" />
              Test Player
            </Button>
            <Button variant="default">
              <FilePlus2 className="h-4 w-4 mr-2" />
              Add Source
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="sources" className="gap-2">
              <Film className="h-4 w-4" />
              API Sources
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <SettingsIcon className="h-4 w-4" />
              Player Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sources" className="space-y-6">
            {/* Player API Manager */}
            <PlayerAPIManager />
            
            {/* Testing Card */}
            <Card>
              <CardHeader>
                <CardTitle>Testing</CardTitle>
                <CardDescription>
                  Test your player sources against specific content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-6 text-center">
                  <p className="text-muted-foreground">
                    Player testing functionality coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <PlayerSettings />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPlayer;
