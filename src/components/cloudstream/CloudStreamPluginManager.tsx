import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { CloudStreamPlugin, CloudStreamRepo } from '@/types';
import { 
  fetchAllPlugins, 
  addPlugin, 
  fetchAllRepositories, 
  fetchAllSources, 
  addRepository, 
  parseCloudStreamRepo, 
  syncSourcesToSupabase,
  INDIAN_LANGUAGES 
} from '@/services/cloudstream';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, AlertCircle, Download, ExternalLink, FileDown, Archive, Check, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from 'react-hook-form';
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useToast } from '../ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Checkbox } from '../ui/checkbox';
import { useAdmin } from '@/contexts/AdminContext';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Skeleton } from '../ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import ErrorHandler from '../ErrorHandler';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Plugin name must be at least 2 characters.",
  }),
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
  repository: z.string().min(2, {
    message: "Repository must be at least 2 characters.",
  }),
  description: z.string().optional(),
  language: z.string().optional(),
  categories: z.array(z.string()).optional(),
  version: z.string().optional()
})

const CloudStreamPluginManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [pluginsToInstall, setPluginsToInstall] = useState<CloudStreamPlugin[]>([]);
  const [installing, setInstalling] = useState<Record<string, boolean>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { isAuthenticated } = useAdmin();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      url: "",
      repository: "",
      description: "",
      language: "en",
      categories: [],
      version: "1.0"
    },
  });

  const { 
    data: repositories = [], 
    isLoading: isLoadingRepos,
    error: reposError
  } = useQuery({
    queryKey: ['cloudstream-repositories'],
    queryFn: fetchAllRepositories
  });

  const { 
    data: plugins = [], 
    isLoading: isLoadingPlugins,
    error: pluginsError
  } = useQuery({
    queryKey: ['cloudstream-plugins'],
    queryFn: fetchAllPlugins
  });

  const addPluginMutation = useMutation({
    mutationFn: addPlugin,
    onSuccess: () => {
      toast({
        title: "Plugin added successfully",
        description: "The plugin has been added to the database.",
      });
      form.reset();
      setOpenDialog(false);
      queryClient.invalidateQueries({ queryKey: ['cloudstream-plugins'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to add plugin",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const addRepoMutation = useMutation({
    mutationFn: (repoUrl: string) => {
      return parseCloudStreamRepo(repoUrl).then((data) => {
        if (data.plugins.length === 0) {
          throw new Error('No plugins found in repository');
        }

        const repoInfo = data.plugins[0];
        return addRepository({
          name: repoInfo.repository.split('/').pop() || 'Unknown Repo',
          url: repoUrl,
          description: `Repository for ${repoInfo.repository}`,
          author: repoInfo.author || 'Unknown',
        });
      });
    },
    onSuccess: () => {
      toast({
        title: "Repository added successfully",
        description: "The repository has been added to the database.",
      });
      queryClient.invalidateQueries({ queryKey: ['cloudstream-repositories'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to add repository",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  });

  const syncSourcesMutation = useMutation({
    mutationFn: syncSourcesToSupabase,
    onSuccess: () => {
      toast({
        title: "Sources synced successfully",
        description: "All CloudStream sources have been synchronized.",
      });
      queryClient.invalidateQueries({ queryKey: ['cloudstream-sources'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to sync sources",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  });

  const parseRepoMutation = useMutation({
    mutationFn: (repoUrl: string) => parseCloudStreamRepo(repoUrl),
    onSuccess: (data) => {
      if (data.plugins.length === 0) {
        toast({
          title: "No plugins found",
          description: "No plugins were found in the repository.",
          variant: "destructive",
        });
        return;
      }

      setPluginsToInstall(data.plugins);
      toast({
        title: "Repository parsed successfully",
        description: `Found ${data.plugins.length} plugins in the repository.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to parse repository",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  });

  const installPluginMutation = useMutation({
    mutationFn: (plugin: CloudStreamPlugin) => {
      setInstalling(prev => ({ ...prev, [plugin.name]: true }));
      return addPlugin({
        name: plugin.name,
        url: plugin.url,
        version: plugin.version || "1.0",
        description: plugin.description || `Plugin for ${plugin.name}`,
        author: plugin.author || "Unknown",
        repository: plugin.repository || selectedRepo,
        categories: plugin.categories || [],
        language: plugin.language || "en",
      });
    },
    onSuccess: (_, plugin) => {
      toast({
        title: "Plugin installed successfully",
        description: `${plugin.name} has been installed.`,
      });
      setInstalling(prev => ({ ...prev, [plugin.name]: false }));
      queryClient.invalidateQueries({ queryKey: ['cloudstream-plugins'] });
    },
    onError: (error, plugin) => {
      toast({
        title: "Failed to install plugin",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      setInstalling(prev => ({ ...prev, [plugin.name]: false }));
    }
  });

  const onSubmit = useCallback((values: z.infer<typeof formSchema>) => {
    addPluginMutation.mutate({
      name: values.name,
      url: values.url,
      version: values.version || "1.0",
      description: values.description || `Plugin for ${values.name}`,
      author: "Custom",
      repository: values.repository,
      categories: values.categories || [],
      language: values.language || "en",
    });
  }, [addPluginMutation]);

  const handleRepositorySelect = useCallback((repoUrl: string) => {
    setSelectedRepo(repoUrl);
    parseRepoMutation.mutate(repoUrl);
  }, [parseRepoMutation]);

  const handleAddRepository = useCallback((repoUrl: string) => {
    if (!repoUrl) {
      toast({
        title: "Invalid repository URL",
        description: "Please enter a valid repository URL.",
        variant: "destructive",
      });
      return;
    }
    addRepoMutation.mutate(repoUrl);
  }, [addRepoMutation, toast]);

  const filteredPlugins = plugins.filter(plugin => 
    plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (plugin.description && plugin.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (plugin.categories && plugin.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleDownloadPlugin = async (plugin: CloudStreamPlugin) => {
    try {
      toast({
        title: "Downloading plugin",
        description: `Starting download of ${plugin.name}...`,
      });

      const response = await fetch(plugin.url);
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${plugin.name}.cs3`;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download complete",
        description: `${plugin.name} has been downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const plugin = row.original;
        return (
          <div className="flex items-center space-x-2">
            {plugin.iconUrl && (
              <img 
                src={plugin.iconUrl.replace('%size%', '64')} 
                alt={plugin.name} 
                className="w-6 h-6 rounded-sm object-contain" 
                onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
              />
            )}
            <span className="font-medium">{plugin.name}</span>
            {plugin.isInstalled && (
              <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
                Installed
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.original.description || "No description available";
        return (
          <div className="max-w-md truncate" title={description}>
            {description}
          </div>
        );
      },
    },
    {
      accessorKey: "language",
      header: "Language",
      cell: ({ row }) => {
        const languageCode = row.original.language || "en";
        const language = INDIAN_LANGUAGES.find(lang => lang.code === languageCode)?.name || languageCode.toUpperCase();
        return <Badge variant="outline">{language}</Badge>;
      },
    },
    {
      accessorKey: "categories",
      header: "Categories",
      cell: ({ row }) => {
        const categories = row.original.categories || [];
        return (
          <div className="flex flex-wrap gap-1">
            {categories.slice(0, 3).map((category, index) => (
              <Badge key={index} variant="secondary" className="capitalize">
                {category.toLowerCase()}
              </Badge>
            ))}
            {categories.length > 3 && (
              <Badge variant="outline">+{categories.length - 3}</Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "version",
      header: "Version",
      cell: ({ row }) => row.original.version || "1.0",
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const plugin = row.original;
        return (
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleDownloadPlugin(plugin)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download .cs3 file</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {plugin.url && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(plugin.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Open plugin URL</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {isAuthenticated && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CopyToClipboard 
                      text={JSON.stringify(plugin, null, 2)}
                      onCopy={() => toast({ title: "Plugin details copied to clipboard" })}
                    >
                      <Button variant="outline" size="icon">
                        <Info className="h-4 w-4" />
                      </Button>
                    </CopyToClipboard>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy plugin details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      },
    },
  ];

  if (isLoadingPlugins || isLoadingRepos) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold">CloudStream Plugin Manager</h1>
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (pluginsError || reposError) {
    return (
      <div className="container mx-auto p-4">
        <ErrorHandler error={pluginsError || reposError} />
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <div className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            <h2 className="text-lg font-semibold">Error loading CloudStream data</h2>
          </div>
          <p className="mt-2">There was an error loading the plugins or repositories. Please try again later.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['cloudstream-plugins'] })}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">CloudStream Plugin Manager</h1>
        
        <div className="flex flex-col md:flex-row gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? "Hide Advanced" : "Show Advanced Options"}
          </Button>
          
          {isAuthenticated && (
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Plugin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Plugin</DialogTitle>
                  <DialogDescription>
                    Enter the details of the CloudStream plugin you want to add.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="name">Name</Label>
                          <FormControl>
                            <Input id="name" placeholder="Plugin name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="url">URL</Label>
                          <FormControl>
                            <Input id="url" placeholder="https://example.com/plugin.cs3" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="repository"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="repository">Repository</Label>
                          <FormControl>
                            <Input id="repository" placeholder="Repository name or URL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="description">Description (optional)</Label>
                          <FormControl>
                            <Input id="description" placeholder="Plugin description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="language">Language</Label>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {INDIAN_LANGUAGES.map((lang) => (
                                <SelectItem key={lang.code} value={lang.code}>
                                  {lang.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="version"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="version">Version (optional)</Label>
                          <FormControl>
                            <Input id="version" placeholder="1.0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit" disabled={addPluginMutation.isPending}>
                        {addPluginMutation.isPending ? "Adding..." : "Add Plugin"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-card rounded-lg border p-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Add Repository</h2>
            <div className="flex gap-2">
              <Input 
                placeholder="Repository URL (plugins.json)" 
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
              />
              <Button 
                variant="outline" 
                onClick={() => handleAddRepository(selectedRepo)}
                disabled={addRepoMutation.isPending}
              >
                {addRepoMutation.isPending ? "Adding..." : "Add"}
              </Button>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2">Available Repositories</h3>
              <ScrollArea className="h-40 rounded-md border">
                <div className="p-4 space-y-2">
                  {repositories.length === 0 ? (
                    <p className="text-muted-foreground">No repositories found</p>
                  ) : (
                    repositories.map((repo) => (
                      <div 
                        key={repo.id} 
                        className="flex justify-between items-center p-2 rounded-md hover:bg-accent cursor-pointer"
                        onClick={() => handleRepositorySelect(repo.url)}
                      >
                        <div>
                          <p className="font-medium">{repo.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[240px]">{repo.url}</p>
                        </div>
                        <Badge variant={repo.isEnabled ? "default" : "secondary"}>
                          {repo.pluginCount || 0} plugins
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Available Plugins from Repository</h2>
            {parseRepoMutation.isPending ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">Loading plugins...</p>
              </div>
            ) : pluginsToInstall.length > 0 ? (
              <ScrollArea className="h-60 rounded-md border">
                <div className="p-4 space-y-3">
                  {pluginsToInstall.map((plugin) => (
                    <div key={plugin.internalName || plugin.name} className="flex justify-between items-center p-2 rounded-md border">
                      <div className="flex items-center gap-2">
                        {plugin.iconUrl && (
                          <img 
                            src={plugin.iconUrl.replace('%size%', '64')} 
                            alt={plugin.name} 
                            className="w-8 h-8 rounded-sm object-contain" 
                            onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                          />
                        )}
                        <div>
                          <p className="font-medium">{plugin.name}</p>
                          <p className="text-xs text-muted-foreground">{plugin.description || `Plugin for ${plugin.language}`}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadPlugin(plugin)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => installPluginMutation.mutate(plugin)}
                          disabled={installing[plugin.name]}
                        >
                          {installing[plugin.name] ? (
                            <>Installing...</>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Install
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 border rounded-md p-4">
                <p className="text-muted-foreground mb-2">No plugins loaded</p>
                <p className="text-sm text-center text-muted-foreground">
                  Select a repository from the list or add a new one to see available plugins.
                </p>
              </div>
            )}
            
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => syncSourcesMutation.mutate()}
                disabled={syncSourcesMutation.isPending}
              >
                {syncSourcesMutation.isPending ? "Syncing..." : "Sync All Sources"}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plugins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <DataTable 
          columns={columns} 
          data={filteredPlugins}
        />
      </div>
    </div>
  );
};

export default CloudStreamPluginManager;
