
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Trash2, Plus, Edit2, Save, X, ArrowUp, ArrowDown, 
  Play, Pause, Shield, Info
} from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { PlayerAPI } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const PlayerAPIManager = () => {
  const { settings, updateSettings } = useAdmin();
  const [playerAPIs, setPlayerAPIs] = useState<PlayerAPI[]>([]);
  const [editingAPI, setEditingAPI] = useState<PlayerAPI | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<PlayerAPI>({
    defaultValues: {
      id: '',
      name: '',
      url: '',
      isActive: true,
      priority: 1,
      apiKey: '',
    },
  });
  
  useEffect(() => {
    if (settings.playerAPIs) {
      setPlayerAPIs(settings.playerAPIs);
    }
  }, [settings.playerAPIs]);
  
  const handleAddNew = () => {
    form.reset({
      id: `api-${Date.now()}`, // Generate a unique ID
      name: '',
      url: '',
      isActive: true,
      priority: playerAPIs.length > 0 ? Math.max(...playerAPIs.map(api => api.priority)) + 1 : 1,
      apiKey: '',
    });
    setEditingAPI(null);
    setIsAddingNew(true);
  };
  
  const handleEdit = (api: PlayerAPI) => {
    form.reset(api);
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
    form.reset();
  };
  
  const cancelEdit = () => {
    setIsAddingNew(false);
    setEditingAPI(null);
    form.reset();
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., VidSrc, SuperEmbed" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this player source
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Template</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/embed/{type}/{id}" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      URL template with placeholders: {'{id}'}, {'{type}'}, {'{season}'}, {'{episode}'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Lower numbers are tried first
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your API key if required" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Use {'{api_key}'} in the URL template
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Enable or disable this player source
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={cancelEdit} type="button">
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" /> {isAddingNew ? 'Add Source' : 'Update Source'}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div>
            {playerAPIs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">Priority</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">URL Template</TableHead>
                    <TableHead className="w-16 text-center">Status</TableHead>
                    <TableHead className="w-28 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playerAPIs
                    .sort((a, b) => a.priority - b.priority)
                    .map((api) => (
                      <TableRow key={api.id}>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-medium">{api.priority}</span>
                            <div className="flex mt-1">
                              <button 
                                onClick={() => handleMovePriority(api.id, 'up')}
                                disabled={api.priority === 1}
                                className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button 
                                onClick={() => handleMovePriority(api.id, 'down')}
                                disabled={api.priority === Math.max(...playerAPIs.map(a => a.priority))}
                                className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                              >
                                <ArrowDown size={14} />
                              </button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium flex items-center">
                            <Shield size={16} className="mr-2 text-muted-foreground" />
                            {api.name}
                            {api.apiKey && (
                              <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                API Key
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell truncate max-w-xs">
                          <code className="text-xs bg-muted p-1 rounded">{api.url}</code>
                        </TableCell>
                        <TableCell className="text-center">
                          <button
                            onClick={() => handleToggleActive(api.id)}
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              api.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                          >
                            {api.isActive ? (
                              <>
                                <Play size={12} className="mr-1" /> Active
                              </>
                            ) : (
                              <>
                                <Pause size={12} className="mr-1" /> Inactive
                              </>
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(api)}
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(api.id)}
                              className="text-destructive hover:text-destructive/90"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">No Player Sources</h3>
                <p className="mt-1 text-muted-foreground">
                  Add your first player API source to enable video playback.
                </p>
                <Button onClick={handleAddNew} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" /> Add API Source
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
      
      {/* Help Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Player API URL Format Guide</DialogTitle>
            <DialogDescription>
              Use these placeholders in your URL templates for dynamic content
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Available Placeholders</h4>
              <ul className="mt-2 space-y-2">
                <li className="flex items-start">
                  <code className="bg-muted p-1 rounded mr-2">{'{'}<span className="text-blue-500">id</span>{'}'}</code>
                  <span>- TMDB ID or IMDB ID of the content</span>
                </li>
                <li className="flex items-start">
                  <code className="bg-muted p-1 rounded mr-2">{'{'}<span className="text-blue-500">type</span>{'}'}</code>
                  <span>- Either "movie" or "tv"</span>
                </li>
                <li className="flex items-start">
                  <code className="bg-muted p-1 rounded mr-2">{'{'}<span className="text-blue-500">season</span>{'}'}</code>
                  <span>- Season number for TV shows</span>
                </li>
                <li className="flex items-start">
                  <code className="bg-muted p-1 rounded mr-2">{'{'}<span className="text-blue-500">episode</span>{'}'}</code>
                  <span>- Episode number for TV shows</span>
                </li>
                <li className="flex items-start">
                  <code className="bg-muted p-1 rounded mr-2">{'{'}<span className="text-blue-500">api_key</span>{'}'}</code>
                  <span>- Your API key (if needed)</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium">Example Templates</h4>
              <div className="mt-2 space-y-2">
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium mb-1">VidSrc</p>
                  <code className="text-sm">https://vidsrc.dev/embed/{'{type}'}/{'{id}'}</code>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium mb-1">SuperEmbed</p>
                  <code className="text-sm">https://multiembed.mov/directstream.php?video_id={'{id}'}&{'{type}'}=1</code>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium mb-1">With Season & Episode</p>
                  <code className="text-sm">https://example.com/play?id={'{id}'}&s={'{season}'}&e={'{episode}'}</code>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium mb-1">With API Key</p>
                  <code className="text-sm">https://api.example.com/stream/{'{id}'}?key={'{api_key}'}</code>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowHelpDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlayerAPIManager;
