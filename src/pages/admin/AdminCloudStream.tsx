
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Cloud, Edit, Trash2, Plus, Check, X, Loader2, RefreshCw } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { CLOUDSTREAM_SOURCES, CloudStreamSource, syncSourcesToSupabase } from '@/services/cloudstream';
import { supabase } from '@/integrations/supabase/client';

const AdminCloudStream = () => {
  const [activeTab, setActiveTab] = useState('sources');
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [editingSource, setEditingSource] = useState<CloudStreamSource | null>(null);
  const [newSource, setNewSource] = useState<Partial<CloudStreamSource>>({
    name: '',
    url: '',
    repo: '',
    categories: [],
    is_enabled: true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch cloud stream sources
  const { data: sources = [], isLoading: isLoadingSources, refetch: refetchSources } = useQuery({
    queryKey: ['admin-cloudstream-sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cloudstream_sources')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data as CloudStreamSource[];
    }
  });
  
  // Mutation to toggle source enabled status
  const toggleSourceMutation = useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string, is_enabled: boolean }) => {
      const { error } = await supabase
        .from('cloudstream_sources')
        .update({ is_enabled })
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cloudstream-sources'] });
      toast({
        title: "Source Updated",
        description: "Source status has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update source: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Mutation to delete a source
  const deleteSourceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cloudstream_sources')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cloudstream-sources'] });
      toast({
        title: "Source Deleted",
        description: "Source has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete source: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Mutation to add/update a source
  const updateSourceMutation = useMutation({
    mutationFn: async (source: Partial<CloudStreamSource>) => {
      if (source.id) {
        // Update existing source
        const { error } = await supabase
          .from('cloudstream_sources')
          .update({
            name: source.name,
            url: source.url,
            logo: source.logo,
            language: source.language,
            categories: source.categories,
            repo: source.repo,
            description: source.description,
            is_enabled: source.is_enabled
          })
          .eq('id', source.id);
          
        if (error) throw error;
      } else {
        // Add new source
        const { error } = await supabase
          .from('cloudstream_sources')
          .insert({
            name: source.name,
            url: source.url,
            logo: source.logo,
            language: source.language,
            categories: source.categories,
            repo: source.repo,
            description: source.description,
            is_enabled: source.is_enabled
          });
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cloudstream-sources'] });
      setIsAddingSource(false);
      setEditingSource(null);
      setNewSource({
        name: '',
        url: '',
        repo: '',
        categories: [],
        is_enabled: true
      });
      toast({
        title: "Source Saved",
        description: "Source has been saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save source: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Handle syncing sources
  const handleSyncSources = async () => {
    try {
      const success = await syncSourcesToSupabase();
      if (success) {
        refetchSources();
        toast({
          title: "Sources Synced",
          description: "CloudStream sources have been synchronized",
        });
      } else {
        throw new Error("Sync operation failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to sync sources: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  // Handle toggle source enabled status
  const handleToggleSource = (id: string, is_enabled: boolean) => {
    toggleSourceMutation.mutate({ id, is_enabled: !is_enabled });
  };
  
  // Handle delete source
  const handleDeleteSource = (id: string) => {
    if (confirm("Are you sure you want to delete this source?")) {
      deleteSourceMutation.mutate(id);
    }
  };
  
  // Handle edit source
  const handleEditSource = (source: CloudStreamSource) => {
    setEditingSource(source);
    setNewSource(source);
    setIsAddingSource(true);
  };
  
  // Handle save source
  const handleSaveSource = () => {
    if (!newSource.name || !newSource.url || !newSource.repo) {
      toast({
        title: "Validation Error",
        description: "Name, URL, and Repository are required fields",
        variant: "destructive"
      });
      return;
    }
    
    updateSourceMutation.mutate(newSource);
  };
  
  // Handle cancel edit/add
  const handleCancelSource = () => {
    setIsAddingSource(false);
    setEditingSource(null);
    setNewSource({
      name: '',
      url: '',
      repo: '',
      categories: [],
      is_enabled: true
    });
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="h-6 w-6 text-moviemate-primary" />
            <h1 className="text-3xl font-bold text-white">CloudStream Management</h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleSyncSources}
              disabled={toggleSourceMutation.isPending}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${toggleSourceMutation.isPending ? 'animate-spin' : ''}`} />
              Sync Sources
            </Button>
            
            <Button 
              onClick={() => setIsAddingSource(true)}
              className="bg-moviemate-primary hover:bg-moviemate-primary/80"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Source
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sources" className="space-y-4">
            {isLoadingSources ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : sources.length === 0 ? (
              <Card className="bg-moviemate-card/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>No Sources Available</CardTitle>
                  <CardDescription>
                    Click "Sync Sources" to import predefined sources or add a new one manually.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    onClick={handleSyncSources}
                    className="w-full"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Sources
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sources.map(source => (
                  <Card key={source.id} className={`bg-moviemate-card/60 backdrop-blur-sm ${!source.is_enabled ? 'opacity-60' : ''}`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{source.name}</CardTitle>
                        <Switch 
                          checked={source.is_enabled} 
                          onCheckedChange={() => handleToggleSource(source.id as string, source.is_enabled as boolean)}
                          disabled={toggleSourceMutation.isPending}
                        />
                      </div>
                      <CardDescription>{source.description || `Provider from ${source.repo}`}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-xs text-muted-foreground mb-2">
                        {source.language && <div>Language: {source.language.toUpperCase()}</div>}
                        <div>Repository: {source.repo}</div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(source.categories || []).map(category => (
                          <span 
                            key={category} 
                            className="inline-flex px-2 py-1 text-xs rounded-full bg-moviemate-primary/20 text-moviemate-primary"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditSource(source)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteSource(source.id as string)}
                        disabled={deleteSourceMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="content">
            <Card className="bg-moviemate-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>
                  Content is automatically synced from sources. You can manage individual content items here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This section is coming soon. Content management will allow you to edit, delete, or manually add CloudStream content.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Add/Edit Source Dialog */}
        <Dialog open={isAddingSource} onOpenChange={setIsAddingSource}>
          <DialogContent className="bg-moviemate-card/80 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle>{editingSource ? 'Edit Source' : 'Add New Source'}</DialogTitle>
              <DialogDescription>
                {editingSource 
                  ? `Update the details for ${editingSource.name}`
                  : 'Add a new CloudStream content source'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newSource.name || ''}
                    onChange={(e) => setNewSource(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Source name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="repo">Repository</Label>
                  <Select 
                    value={newSource.repo || ''}
                    onValueChange={(value) => setNewSource(prev => ({ ...prev, repo: value }))}
                  >
                    <SelectTrigger id="repo">
                      <SelectValue placeholder="Select repository" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CSX">CSX</SelectItem>
                      <SelectItem value="PHISHER">PHISHER</SelectItem>
                      <SelectItem value="KEKIK">KEKIK</SelectItem>
                      <SelectItem value="CUSTOM">CUSTOM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={newSource.url || ''}
                  onChange={(e) => setNewSource(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="Source URL"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo URL (optional)</Label>
                  <Input
                    id="logo"
                    value={newSource.logo || ''}
                    onChange={(e) => setNewSource(prev => ({ ...prev, logo: e.target.value }))}
                    placeholder="Logo URL"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Language (optional)</Label>
                  <Input
                    id="language"
                    value={newSource.language || ''}
                    onChange={(e) => setNewSource(prev => ({ ...prev, language: e.target.value }))}
                    placeholder="en, hi, tr, etc."
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categories">Categories (comma-separated)</Label>
                <Input
                  id="categories"
                  value={(newSource.categories || []).join(', ')}
                  onChange={(e) => setNewSource(prev => ({ 
                    ...prev, 
                    categories: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                  }))}
                  placeholder="movies, series, anime, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={newSource.description || ''}
                  onChange={(e) => setNewSource(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the source"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_enabled"
                  checked={newSource.is_enabled}
                  onCheckedChange={(checked) => setNewSource(prev => ({ ...prev, is_enabled: checked }))}
                />
                <Label htmlFor="is_enabled">Enabled</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelSource}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button 
                onClick={handleSaveSource}
                className="bg-moviemate-primary hover:bg-moviemate-primary/80"
                disabled={updateSourceMutation.isPending}
              >
                {updateSourceMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminCloudStream;
