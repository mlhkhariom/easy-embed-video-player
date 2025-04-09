
import { useState, useEffect } from 'react';
import { Plus, Info } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { PlayerAPI } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import PlayerAPISourceTable from './PlayerAPISourceTable';
import PlayerAPISourceForm from './PlayerAPISourceForm';
import PlayerAPIHelpDialog from './PlayerAPIHelpDialog';

const PlayerAPIManager = () => {
  const { settings, updateSettings } = useAdmin();
  const [playerAPIs, setPlayerAPIs] = useState<PlayerAPI[]>([]);
  const [editingAPI, setEditingAPI] = useState<PlayerAPI | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (settings.playerAPIs) {
      setPlayerAPIs(settings.playerAPIs);
    }
  }, [settings.playerAPIs]);

  const handleAddNew = () => {
    const newAPI: PlayerAPI = {
      id: `api-${Date.now()}`, // Generate a unique ID
      name: '',
      url: '',
      isActive: true,
      priority: playerAPIs.length > 0 ? Math.max(...playerAPIs.map(api => api.priority)) + 1 : 1,
      apiKey: '',
    };
    
    setEditingAPI(newAPI);
    setIsAddingNew(true);
  };
  
  const handleEdit = (api: PlayerAPI) => {
    setEditingAPI(api);
    setIsAddingNew(false);
  };
  
  const handleDelete = (id: string) => {
    const updatedAPIs = playerAPIs.filter(api => api.id !== id);
    setPlayerAPIs(updatedAPIs);
    updateSettings({ playerAPIs: updatedAPIs });
    
    toast({
      title: "API Source Deleted",
      description: "The player API source has been removed.",
    });
  };
  
  const handleToggleActive = (id: string) => {
    const updatedAPIs = playerAPIs.map(api => 
      api.id === id ? { ...api, isActive: !api.isActive } : api
    );
    setPlayerAPIs(updatedAPIs);
    updateSettings({ playerAPIs: updatedAPIs });
  };
  
  const handleMovePriority = (id: string, direction: 'up' | 'down') => {
    const currentIndex = playerAPIs.findIndex(api => api.id === id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= playerAPIs.length) return;
    
    const updatedAPIs = [...playerAPIs];
    [updatedAPIs[currentIndex], updatedAPIs[newIndex]] = [updatedAPIs[newIndex], updatedAPIs[currentIndex]];
    
    // Update priorities to match the new order
    const reorderedAPIs = updatedAPIs.map((api, index) => ({
      ...api,
      priority: index + 1
    }));
    
    setPlayerAPIs(reorderedAPIs);
    updateSettings({ playerAPIs: reorderedAPIs });
  };
  
  const onSubmit = (data: PlayerAPI) => {
    let updatedAPIs: PlayerAPI[];
    
    if (isAddingNew) {
      updatedAPIs = [...playerAPIs, data];
    } else {
      updatedAPIs = playerAPIs.map(api => 
        api.id === data.id ? data : api
      );
    }
    
    // Sort APIs by priority
    updatedAPIs.sort((a, b) => a.priority - b.priority);
    
    setPlayerAPIs(updatedAPIs);
    updateSettings({ playerAPIs: updatedAPIs });
    
    toast({
      title: isAddingNew ? "API Added" : "API Updated",
      description: `Player API ${isAddingNew ? 'added' : 'updated'} successfully.`,
    });
    
    setIsAddingNew(false);
    setEditingAPI(null);
  };
  
  const cancelEdit = () => {
    setIsAddingNew(false);
    setEditingAPI(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Player API Sources</h2>
          <p className="text-muted-foreground">
            Configure video player sources in order of preference
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setShowHelpDialog(true)}>
                  <Info size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View format guidelines and examples</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" /> Add API Source
          </Button>
        </div>
      </div>
      
      <Card className="p-6">
        {(isAddingNew || editingAPI) ? (
          <PlayerAPISourceForm 
            initialData={editingAPI!}
            onSubmit={onSubmit}
            onCancel={cancelEdit}
            isAddingNew={isAddingNew}
          />
        ) : (
          <PlayerAPISourceTable 
            playerAPIs={playerAPIs}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleToggleActive={handleToggleActive}
            handleMovePriority={handleMovePriority}
            handleAddNew={handleAddNew}
          />
        )}
      </Card>
      
      <PlayerAPIHelpDialog 
        open={showHelpDialog}
        onOpenChange={setShowHelpDialog}
      />
    </div>
  );
};

export default PlayerAPIManager;
