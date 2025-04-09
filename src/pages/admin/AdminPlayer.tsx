
import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Film, Link as LinkIcon, FilePlus2, Settings as SettingsIcon, ExternalLink } from 'lucide-react';
import PlayerAPIManager from '@/components/admin/player/PlayerAPIManager';
import PlayerSettings from '@/components/admin/player/PlayerSettings';

const AdminPlayer = () => {
  const [activeTab, setActiveTab] = useState('sources');
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [addSourceDialogOpen, setAddSourceDialogOpen] = useState(false);

  const handleOpenTestPlayer = () => {
    setTestDialogOpen(true);
  };
  
  const handleAddSource = () => {
    // We'll set this to true and switch to the sources tab
    setActiveTab('sources');
    setAddSourceDialogOpen(true);
  };

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
            <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={handleOpenTestPlayer}>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Test Player
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Player Testing</DialogTitle>
                  <DialogDescription>Test your configured video sources with sample content</DialogDescription>
                </DialogHeader>
                <div className="aspect-video bg-black rounded-md flex items-center justify-center">
                  <div className="text-center text-white">
                    <ExternalLink className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Player preview will appear here</p>
                    <p className="text-sm text-gray-400 mt-1">This feature is coming soon</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={addSourceDialogOpen} onOpenChange={setAddSourceDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" onClick={handleAddSource}>
                  <FilePlus2 className="h-4 w-4 mr-2" />
                  Add Source
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Source</DialogTitle>
                  <DialogDescription>Add a new video player API source</DialogDescription>
                </DialogHeader>
                <p className="py-4">
                  Please use the form in the API Sources tab to add a new source.
                </p>
              </DialogContent>
            </Dialog>
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
            <PlayerAPIManager addSourceDialogOpen={addSourceDialogOpen} setAddSourceDialogOpen={setAddSourceDialogOpen} />
            
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
