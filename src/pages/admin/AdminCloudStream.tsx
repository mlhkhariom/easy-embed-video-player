import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addPlugin,
  addRepository,
  fetchAllPlugins,
  fetchAllRepositories,
  fetchAllSources,
  CloudStreamPlugin,
  CloudStreamRepo,
  syncSourcesToSupabase,
  syncContent
} from '@/services/cloudstream';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Cloud, Loader2, RefreshCw, Plus, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin } from '@/contexts/AdminContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const AdminCloudStream = () => {
  const [repositories, setRepositories] = useState<CloudStreamRepo[]>([]);
  const [plugins, setPlugins] = useState<CloudStreamPlugin[]>([]);
  const [newRepo, setNewRepo] = useState({ name: '', url: '', description: '' });
  const [newPlugin, setNewPlugin] = useState({
    name: "",
    url: "",
    repository: "",
    description: "",
    language: "hi",
    categories: ["indian"],
    version: "1.0.0"
  });
  const [addRepoDialogOpen, setAddRepoDialogOpen] = useState(false);
  const [addPluginDialogOpen, setAddPluginDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [addingRepo, setAddingRepo] = useState(false);
  const [addingPlugin, setAddingPlugin] = useState(false);
  const [isRefreshingSources, setIsRefreshingSources] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { settings } = useAdmin();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Fetch repositories
  const {
    data: reposData,
    isLoading: isLoadingRepos,
    error: reposError,
    refetch: refetchRepos
  } = useQuery({
    queryKey: ['cloudstream-repositories'],
    queryFn: fetchAllRepositories,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Fetch plugins
  const {
    data: pluginsData,
    isLoading: isLoadingPlugins,
    error: pluginsError,
    refetch: refetchPlugins
  } = useQuery({
    queryKey: ['cloudstream-plugins'],
    queryFn: fetchAllPlugins,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Fetch sources
  const {
    isLoading: isLoadingSources,
    error: sourcesError,
    refetch: refetchSources
  } = useQuery({
    queryKey: ['cloudstream-sources'],
    queryFn: fetchAllSources,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  useEffect(() => {
    if (reposData) {
      setRepositories(reposData);
    }
  }, [reposData]);

  useEffect(() => {
    if (pluginsData) {
      setPlugins(pluginsData);
    }
  }, [pluginsData]);

  // Function to handle repository addition
  const handleAddRepository = async () => {
    if (!newRepo.name || !newRepo.url) {
      toast({
        title: "Error",
        description: "Please fill in all required fields for the repository",
        variant: "destructive"
      });
      return;
    }

    setAddingRepo(true);

    try {
      const result = await addRepository(newRepo);
      if (result) {
        toast({
          title: "Success",
          description: `Repository "${newRepo.name}" added successfully`,
        });
        setNewRepo({ name: '', url: '', description: '' });
        setAddRepoDialogOpen(false);
        await refetchRepos();
      } else {
        toast({
          title: "Error",
          description: "Failed to add repository",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error adding repository:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setAddingRepo(false);
    }
  };

  // Function to handle plugin addition
  const handleAddPlugin = async () => {
    if (!newPlugin.name || !newPlugin.url || !newPlugin.repository) {
      toast({
        title: "Error",
        description: "Please fill in all required fields for the plugin",
        variant: "destructive"
      });
      return;
    }

    setAddingPlugin(true);

    try {
      // Add author to the plugin object
      const pluginToAdd = {
        ...newPlugin,
        author: "User Added" // Adding the required author field
      };

      const result = await addPlugin(pluginToAdd);
    
      if (result) {
        toast({
          title: "Success",
          description: `Plugin "${newPlugin.name}" added successfully`,
        });
        setNewPlugin({
          name: "",
          url: "",
          repository: "",
          description: "",
          language: "hi",
          categories: ["indian"],
          version: "1.0.0"
        });
        setAddPluginDialogOpen(false);
        await refetchPlugins();
      } else {
        toast({
          title: "Error",
          description: "Failed to add plugin",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error adding plugin:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setAddingPlugin(false);
    }
  };

  // Function to handle syncing content
  const handleSyncContent = async () => {
    setIsSyncing(true);
    try {
      const result = await syncContent();
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error syncing content:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while syncing content",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Function to handle toggling repository status
  const handleToggleRepository = async (repoId: string, isEnabled: boolean) => {
    // Optimistically update the UI
    const previousRepos = queryClient.getQueryData(['cloudstream-repositories']);
    queryClient.setQueryData(['cloudstream-repositories'], (old: CloudStreamRepo[] | undefined) =>
      old?.map(repo => (repo.id === repoId ? { ...repo, isEnabled: isEnabled } : repo))
    );

    try {
      // Call the Supabase function to toggle the repository status
      const response = await fetch('/api/cloudstream/toggle-repository', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoId, isEnabled }),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle repository: ${response.status}`);
      }

      toast({
        title: "Success",
        description: `Repository ${isEnabled ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error: any) {
      console.error("Error toggling repository:", error);
      toast({
        title: "Error",
        description: `Failed to toggle repository: ${error.message}`,
        variant: "destructive"
      });
      // Revert the UI to the previous state in case of an error
      queryClient.setQueryData(['cloudstream-repositories'], previousRepos);
    } finally {
      // Invalidate the query to refetch the repositories
      queryClient.invalidateQueries(['cloudstream-repositories']);
    }
  };

  // Function to handle toggling plugin status
  const handleTogglePlugin = async (pluginId: string, isEnabled: boolean) => {
    // Optimistically update the UI
    const previousPlugins = queryClient.getQueryData(['cloudstream-plugins']);
    queryClient.setQueryData(['cloudstream-plugins'], (old: CloudStreamPlugin[] | undefined) =>
      old?.map(plugin => (plugin.id === pluginId ? { ...plugin, isEnabled: isEnabled } : plugin))
    );

    try {
      // Call the Supabase function to toggle the plugin status
      const response = await fetch('/api/cloudstream/toggle-plugin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pluginId, isEnabled }),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle plugin: ${response.status}`);
      }

      toast({
        title: "Success",
        description: `Plugin ${isEnabled ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error: any) {
      console.error("Error toggling plugin:", error);
      toast({
        title: "Error",
        description: `Failed to toggle plugin: ${error.message}`,
        variant: "destructive"
      });
      // Revert the UI to the previous state in case of an error
      queryClient.setQueryData(['cloudstream-plugins'], previousPlugins);
    } finally {
      // Invalidate the query to refetch the plugins
      queryClient.invalidateQueries(['cloudstream-plugins']);
    }
  };

  // Function to handle installing/uninstalling a plugin
  const handleInstallPlugin = async (pluginId: string, isInstalled: boolean) => {
    // Optimistically update the UI
    const previousPlugins = queryClient.getQueryData(['cloudstream-plugins']);
    queryClient.setQueryData(['cloudstream-plugins'], (old: CloudStreamPlugin[] | undefined) =>
      old?.map(plugin => (plugin.id === pluginId ? { ...plugin, isInstalled: isInstalled } : plugin))
    );

    try {
      // Call the Supabase function to install/uninstall the plugin
      const response = await fetch('/api/cloudstream/install-plugin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pluginId, isInstalled }),
      });

      if (!response.ok) {
        throw new Error(`Failed to install/uninstall plugin: ${response.status}`);
      }

      toast({
        title: "Success",
        description: `Plugin ${isInstalled ? 'installed' : 'uninstalled'} successfully`,
      });
    } catch (error: any) {
      console.error("Error installing/uninstalling plugin:", error);
      toast({
        title: "Error",
        description: `Failed to install/uninstall plugin: ${error.message}`,
        variant: "destructive"
      });
      // Revert the UI to the previous state in case of an error
      queryClient.setQueryData(['cloudstream-plugins'], previousPlugins);
    } finally {
      // Invalidate the query to refetch the plugins
      queryClient.invalidateQueries(['cloudstream-plugins']);
    }
  };

  // Function to handle refreshing sources
  const handleRefreshSources = async () => {
    setIsRefreshingSources(true);
    try {
      const result = await syncSourcesToSupabase();
      if (result) {
        toast({
          title: "Success",
          description: "CloudStream sources refreshed successfully",
        });
        await refetchSources();
      } else {
        toast({
          title: "Error",
          description: "Failed to refresh CloudStream sources",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error refreshing CloudStream sources:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while refreshing CloudStream sources",
        variant: "destructive"
      });
    } finally {
      setIsRefreshingSources(false);
    }
  };

  if (!settings.enableCloudStream) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold">CloudStream Management</h1>
        <p className="mt-4 text-gray-400">
          The administrator has disabled this feature. Please contact the site administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-4 text-3xl font-bold text-center text-white flex items-center justify-center gap-2">
        <Cloud className="h-8 w-8 text-moviemate-primary" />
        CloudStream Management
      </h1>

      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Repositories</h2>
        <div className="flex gap-2">
          <Button onClick={handleSyncContent} disabled={isSyncing}>
            {isSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Cloud className="mr-2 h-4 w-4" />
                Sync Content
              </>
            )}
          </Button>
          <Button onClick={handleRefreshSources} disabled={isRefreshingSources}>
            {isRefreshingSources ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Sources
              </>
            )}
          </Button>
          <Dialog open={addRepoDialogOpen} onOpenChange={setAddRepoDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Repository
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Repository</DialogTitle>
                <DialogDescription>
                  Add a new CloudStream repository to fetch plugins and sources from.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input id="name" value={newRepo.name} onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="url" className="text-right">
                    URL
                  </Label>
                  <Input id="url" type="url" value={newRepo.url} onChange={(e) => setNewRepo({ ...newRepo, url: e.target.value })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea id="description" value={newRepo.description} onChange={(e) => setNewRepo({ ...newRepo, description: e.target.value })} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setAddRepoDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" onClick={handleAddRepository} disabled={addingRepo}>
                  {addingRepo ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Repository"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoadingRepos ? (
        <div className="flex items-center justify-center">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          Loading repositories...
        </div>
      ) : reposError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load repositories. Please try again later.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <Table>
            <TableCaption>A list of your CloudStream repositories.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repositories.map((repo) => (
                <TableRow key={repo.id}>
                  <TableCell className="font-medium">{repo.name}</TableCell>
                  <TableCell>
                    <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-moviemate-primary hover:underline">
                      {repo.url}
                    </a>
                  </TableCell>
                  <TableCell>{repo.description}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={repo.isEnabled ? "success" : "outline"}>
                      {repo.isEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={repo.isEnabled}
                      onCheckedChange={(checked) => handleToggleRepository(repo.id, checked)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Separator className="my-8" />

      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Plugins</h2>
        <Dialog open={addPluginDialogOpen} onOpenChange={setAddPluginDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Plugin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Plugin</DialogTitle>
              <DialogDescription>
                Add a new CloudStream plugin to enhance content sources.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" value={newPlugin.name} onChange={(e) => setNewPlugin({ ...newPlugin, name: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="url" className="text-right">
                  URL
                </Label>
                <Input id="url" type="url" value={newPlugin.url} onChange={(e) => setNewPlugin({ ...newPlugin, url: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="repository" className="text-right">
                  Repository
                </Label>
                <Input id="repository" value={newPlugin.repository} onChange={(e) => setNewPlugin({ ...newPlugin, repository: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea id="description" value={newPlugin.description} onChange={(e) => setNewPlugin({ ...newPlugin, description: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="language" className="text-right">
                  Language
                </Label>
                <Select onValueChange={(value) => setNewPlugin({ ...newPlugin, language: value })} defaultValue={newPlugin.language}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ta">Tamil</SelectItem>
                    {/* Add more languages as needed */}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="categories" className="text-right">
                  Categories
                </Label>
                <Select onValueChange={(value) => setNewPlugin({ ...newPlugin, categories: [value] })} defaultValue={newPlugin.categories[0]}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indian">Indian</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                    {/* Add more categories as needed */}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="version" className="text-right">
                  Version
                </Label>
                <Input id="version" value={newPlugin.version} onChange={(e) => setNewPlugin({ ...newPlugin, version: e.target.value })} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setAddPluginDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleAddPlugin} disabled={addingPlugin}>
                {addingPlugin ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Plugin"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingPlugins ? (
        <div className="flex items-center justify-center">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          Loading plugins...
        </div>
      ) : pluginsError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load plugins. Please try again later.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <Table>
            <TableCaption>A list of your CloudStream plugins.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Repository</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Installed</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plugins.map((plugin) => (
                <TableRow key={plugin.id}>
                  <TableCell className="font-medium">{plugin.name}</TableCell>
                  <TableCell>
                    <a href={plugin.url} target="_blank" rel="noopener noreferrer" className="text-moviemate-primary hover:underline">
                      {plugin.url}
                    </a>
                  </TableCell>
                  <TableCell>{plugin.repository}</TableCell>
                  <TableCell>{plugin.description}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={plugin.isEnabled ? "success" : "outline"}>
                      {plugin.isEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={plugin.isInstalled ? "default" : "outline"}>
                      {plugin.isInstalled ? "Installed" : "Not Installed"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={plugin.isEnabled}
                      onCheckedChange={(checked) => handleTogglePlugin(plugin.id, checked)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminCloudStream;
