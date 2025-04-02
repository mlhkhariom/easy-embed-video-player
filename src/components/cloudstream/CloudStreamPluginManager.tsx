import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { CloudStreamPlugin, CloudStreamRepo } from '@/types';
import { fetchAllPlugins, addPlugin, fetchAllRepositories, fetchAllSources, addRepository, parseCloudStreamRepo, syncSourcesToSupabase } from '@/services/cloudstream';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, AlertCircle } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlugins, setFilteredPlugins] = useState<CloudStreamPlugin[]>([]);
  const [addPluginDialogOpen, setAddPluginDialogOpen] = useState(false);
  const [addingPlugin, setAddingPlugin] = useState(false);
  const [newPlugin, setNewPlugin] = useState({
    name: "",
    url: "",
    repository: "",
    description: "",
    language: "hi",
    categories: ["indian"],
    version: "1.0.0"
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isParsingRepo, setIsParsingRepo] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [parsedPlugins, setParsedPlugins] = useState<any[]>([]);
  const [parsedSources, setParsedSources] = useState<any[]>([]);
  const [isAddingRepo, setIsAddingRepo] = useState(false);
  const [newRepo, setNewRepo] = useState({
    name: "",
    url: "",
    description: "",
    author: ""
  });
  const [addRepoDialogOpen, setAddRepoDialogOpen] = useState(false);
  const [isSyncingSources, setIsSyncingSources] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { settings } = useAdmin();

  // Fetch plugins from Supabase
  const { 
    data: plugins, 
    isLoading: isLoadingPlugins, 
    error: pluginsError,
    refetch: refetchPlugins 
  } = useQuery({
    queryKey: ['cloudstream-plugins'],
    queryFn: fetchAllPlugins
  });

  // Fetch repositories from Supabase
  const { 
    data: repositories, 
    isLoading: isLoadingRepositories, 
    error: repositoriesError,
    refetch: refetchRepositories 
  } = useQuery({
    queryKey: ['cloudstream-repositories'],
    queryFn: fetchAllRepositories
  });

  // Fetch sources from Supabase
  const { 
    data: sources, 
    isLoading: isLoadingSources, 
    error: sourcesError,
    refetch: refetchSources 
  } = useQuery({
    queryKey: ['cloudstream-sources'],
    queryFn: fetchAllSources
  });

  // Function to toggle plugin status
  const handleTogglePlugin = async (pluginId: string, isEnabled: boolean) => {
    // Optimistically update the cache
    queryClient.setQueryData<CloudStreamPlugin[]>(['cloudstream-plugins'], (old) =>
      old?.map((plugin) =>
        plugin.id === pluginId ? { ...plugin, isEnabled: isEnabled } : plugin
      ) || []
    );

    // Make the API call
    const response = await fetch(`/api/admin/cloudstream/plugins/${pluginId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isEnabled }),
    });

    if (!response.ok) {
      toast({
        title: "Error",
        description: "Failed to update plugin status",
        variant: "destructive"
      });
      // If the API call fails, revert the cache to the previous state
      await queryClient.cancelQueries({ queryKey: ['cloudstream-plugins'] });
      queryClient.setQueryData<CloudStreamPlugin[]>(['cloudstream-plugins'], plugins || []);
    } else {
      toast({
        title: "Success",
        description: "Plugin status updated successfully",
      });
    }

    // Invalidate the cache to trigger a refetch
    queryClient.invalidateQueries({ queryKey: ['cloudstream-plugins'] });
  };

  // Function to toggle repository status
  const handleToggleRepository = async (repoId: string, isEnabled: boolean) => {
    // Optimistically update the cache
    queryClient.setQueryData<CloudStreamRepo[]>(['cloudstream-repositories'], (old) =>
      old?.map((repo) =>
        repo.id === repoId ? { ...repo, isEnabled: isEnabled } : repo
      ) || []
    );

    // Make the API call
    const response = await fetch(`/api/admin/cloudstream/repositories/${repoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isEnabled }),
    });

    if (!response.ok) {
      toast({
        title: "Error",
        description: "Failed to update repository status",
        variant: "destructive"
      });
      // If the API call fails, revert the cache to the previous state
      await queryClient.cancelQueries({ queryKey: ['cloudstream-repositories'] });
      queryClient.setQueryData<CloudStreamRepo[]>(['cloudstream-repositories'], repositories || []);
    } else {
      toast({
        title: "Success",
        description: "Repository status updated successfully",
      });
    }

    // Invalidate the cache to trigger a refetch
    queryClient.invalidateQueries({ queryKey: ['cloudstream-repositories'] });
  };

  // Function to install/uninstall plugin
  const handleInstallPlugin = async (pluginId: string, isInstalled: boolean) => {
    // Optimistically update the cache
    queryClient.setQueryData<CloudStreamPlugin[]>(['cloudstream-plugins'], (old) =>
      old?.map((plugin) =>
        plugin.id === pluginId ? { ...plugin, isInstalled: isInstalled } : plugin
      ) || []
    );

    // Make the API call
    const response = await fetch(`/api/admin/cloudstream/plugins/${pluginId}/install`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isInstalled }),
    });

    if (!response.ok) {
      toast({
        title: "Error",
        description: "Failed to install/uninstall plugin",
        variant: "destructive"
      });
      // If the API call fails, revert the cache to the previous state
      await queryClient.cancelQueries({ queryKey: ['cloudstream-plugins'] });
      queryClient.setQueryData<CloudStreamPlugin[]>(['cloudstream-plugins'], plugins || []);
    } else {
      toast({
        title: "Success",
        description: "Plugin installed/uninstalled successfully",
      });
    }

    // Invalidate the cache to trigger a refetch
    queryClient.invalidateQueries({ queryKey: ['cloudstream-plugins'] });
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle category filter change
  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Handle clear category filters
  const handleClearCategories = () => {
    setSelectedCategories([]);
  };

  // Handle add plugin form submission
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      url: "",
      repository: "",
      description: "",
      language: "hi",
      categories: ["indian"],
      version: "1.0.0"
    },
    mode: "onChange"
  })

  const handleAddPlugin = async (values: z.infer<typeof formSchema>) => {
    setAddingPlugin(true);

    try {
      const result = await addPlugin({
        name: values.name,
        url: values.url,
        version: values.version || "1.0.0",
        description: values.description || `Plugin for ${values.name}`,
        author: "User Added",
        repository: values.repository,
        categories: values.categories || ["indian"],
        language: values.language || "hi"
      });
      
      if (result) {
        toast({
          title: "Success",
          description: `Plugin "${values.name}" added successfully`,
        });
        form.reset();
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

  // Handle add repository form submission
  const handleAddRepository = async () => {
    setIsAddingRepo(true);

    try {
      const result = await addRepository(newRepo);
      
      if (result) {
        toast({
          title: "Success",
          description: `Repository "${newRepo.name}" added successfully`,
        });
        setNewRepo({
          name: "",
          url: "",
          description: "",
          author: ""
        });
        setAddRepoDialogOpen(false);
        await refetchRepositories();
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
      setIsAddingRepo(false);
    }
  };

  // Handle parse repository
  const handleParseRepo = async () => {
    setIsParsingRepo(true);
    setParsedPlugins([]);
    setParsedSources([]);

    try {
      const result = await parseCloudStreamRepo(repoUrl);
      setParsedPlugins(result.plugins);
      setParsedSources(result.sources);
      toast({
        title: "Success",
        description: `Repository "${repoUrl}" parsed successfully`,
      });
    } catch (error) {
      console.error("Error parsing repository:", error);
      toast({
        title: "Error",
        description: "Failed to parse repository",
        variant: "destructive"
      });
    } finally {
      setIsParsingRepo(false);
    }
  };

  // Handle sync sources
  const handleSyncSources = async () => {
    setIsSyncingSources(true);

    try {
      const result = await syncSourcesToSupabase();
      
      if (result) {
        toast({
          title: "Success",
          description: "Sources synced successfully",
        });
        await refetchSources();
      } else {
        toast({
          title: "Error",
          description: "Failed to sync sources",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error syncing sources:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSyncingSources(false);
    }
  };

  useEffect(() => {
    // Apply search filter
    let filtered = plugins || [];

    if (searchQuery) {
      filtered = filtered.filter(plugin =>
        plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plugin.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plugin.repository?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(plugin =>
        plugin.categories?.some(category => selectedCategories.includes(category))
      );
    }

    setFilteredPlugins(filtered);

    // Extract available categories
    if (plugins) {
      const categories = new Set<string>();
      plugins.forEach(plugin => {
        plugin.categories?.forEach(category => {
          categories.add(category);
        });
      });
      setAvailableCategories(Array.from(categories));
    }
  }, [plugins, searchQuery, selectedCategories]);

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'repository',
      header: 'Repository',
    },
    {
      accessorKey: 'version',
      header: 'Version',
    },
    {
      accessorKey: 'language',
      header: 'Language',
    },
    {
      accessorKey: 'categories',
      header: 'Categories',
      cell: ({ row }: any) => (
        <div className="flex flex-wrap gap-1">
          {row.original.categories?.map((category: string) => (
            <Badge key={category} variant="secondary">{category}</Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'author',
      header: 'Author',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Badge variant={row.original.isEnabled ? "default" : "outline"}>
            {row.original.isEnabled ? "Enabled" : "Disabled"}
          </Badge>
          <Badge variant={row.original.isInstalled ? "default" : "outline"}>
            {row.original.isInstalled ? "Installed" : "Not Installed"}
          </Badge>
        </div>
      ),
    },
  ];

  if (!settings.enableCloudStream) {
    return (
      <div className="rounded-md border p-4">
        <div className="flex items-center justify-between space-y-2 font-medium">
          <div className="text-sm">
            <AlertCircle className="mr-2 h-4 w-4" />
            CloudStream is disabled. Please enable it in the settings.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">CloudStream Plugin Manager</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleSyncSources} disabled={isSyncingSources}>
            {isSyncingSources ? (
              <>
                Syncing...
                <svg className="animate-spin h-4 w-4 ml-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 4V2m0 20v-2m8-6h2M4 12H2m1.414-5.586L2.414 5.414M20.586 18.586l-1.414 1.414M18.586 5.414l1.414 1.414M5.414 18.586l-1.414-1.414" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            ) : "Sync Sources"}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Repository
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Repository</DialogTitle>
                <DialogDescription>
                  Add a new CloudStream repository to fetch plugins and sources.
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
                  <Input id="description" value={newRepo.description} onChange={(e) => setNewRepo({ ...newRepo, description: e.target.value })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="author" className="text-right">
                    Author
                  </Label>
                  <Input id="author" value={newRepo.author} onChange={(e) => setNewRepo({ ...newRepo, author: e.target.value })} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" onClick={handleAddRepository} disabled={isAddingRepo}>
                  {isAddingRepo ? (
                    <>
                      Adding...
                      <svg className="animate-spin h-4 w-4 ml-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 4V2m0 20v-2m8-6h2M4 12H2m1.414-5.586L2.414 5.414M20.586 18.586l-1.414 1.414M18.586 5.414l1.414 1.414M5.414 18.586l-1.414-1.414" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  ) : "Add Repository"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={addPluginDialogOpen} onOpenChange={setAddPluginDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Plugin
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Plugin</DialogTitle>
                <DialogDescription>
                  Add a new CloudStream plugin to the database.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddPlugin)} className="grid gap-4 py-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="name">Name</Label>
                        <FormControl>
                          <Input id="name" placeholder="Plugin Name" {...field} />
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
                          <Input id="url" placeholder="https://example.com/plugin.js" {...field} />
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
                          <Input id="repository" placeholder="Repository Name" {...field} />
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
                        <Label htmlFor="description">Description</Label>
                        <FormControl>
                          <Input id="description" placeholder="A brief description of the plugin" {...field} />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hi">Hindi</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            {/* Add more languages as needed */}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="categories"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="categories">Categories</Label>
                        <div className="flex flex-wrap gap-2">
                          <Checkbox
                            id="indian"
                            checked={field.value?.includes("indian")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...(field.value || []), "indian"])
                              } else {
                                field.onChange(field.value?.filter((v: string) => v !== "indian"))
                              }
                            }}
                          />
                          <Label htmlFor="indian">Indian</Label>
                          {/* Add more categories as needed */}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="version">Version</Label>
                        <FormControl>
                          <Input id="version" placeholder="1.0.0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={addingPlugin}>
                      {addingPlugin ? (
                        <>
                          Adding...
                          <svg className="animate-spin h-4 w-4 ml-2" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12 4V2m0 20v-2m8-6h2M4 12H2m1.414-5.586L2.414 5.414M20.586 18.586l-1.414 1.414M18.586 5.414l1.414 1.414M5.414 18.586l-1.414-1.414" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </>
                      ) : "Add Plugin"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search plugins..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="max-w-md"
        />
      </div>

      <div className="flex items-center space-x-2">
        {availableCategories.length > 0 && (
          <div className="space-y-1">
            <Label>Filter by Category:</Label>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <Label htmlFor={`category-${category}`}>{category}</Label>
                </div>
              ))}
            </div>
            {selectedCategories.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearCategories}>
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {pluginsError && (
        <div className="rounded-md border p-4">
          <div className="flex items-center justify-between space-y-2 font-medium">
            <div className="text-sm">
              <AlertCircle className="mr-2 h-4 w-4" />
              Error fetching plugins. Please try again.
            </div>
          </div>
        </div>
      )}

      {isLoadingPlugins ? (
        <div className="rounded-md border p-4">
          <div className="flex items-center justify-between space-y-2 font-medium">
            <div className="text-sm">
              Loading plugins...
            </div>
          </div>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredPlugins} />
      )}

      <div className="mt-8">
        <h3 className="text-xl font-bold">Parse Repository</h3>
        <div className="flex items-center space-x-2 mt-2">
          <Input
            placeholder="Enter repository URL..."
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="max-w-md"
          />
          <Button onClick={handleParseRepo} disabled={isParsingRepo}>
            {isParsingRepo ? (
              <>
                Parsing...
                <svg className="animate-spin h-4 w-4 ml-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 4V2m0 20v-2m8-6h2M4 12H2m1.414-5.586L2.414 5.414M20.586 18.586l-1.414 1.414M18.586 5.414l1.414 1.414M5.414 18.586l-1.414-1.414" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            ) : "Parse"}
          </Button>
        </div>

        {parsedPlugins.length > 0 && (
          <div className="mt-4">
            <h4 className="text-lg font-semibold">Parsed Plugins</h4>
            <ScrollArea className="h-[200px] w-full rounded-md border">
              <div className="p-2">
                {parsedPlugins.map((plugin, index) => (
                  <div key={index} className="py-2 border-b last:border-b-0">
                    <p className="font-medium">{plugin.name}</p>
                    <p className="text-sm text-gray-500">{plugin.url}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {parsedSources.length > 0 && (
          <div className="mt-4">
            <h4 className="text-lg font-semibold">Parsed Sources</h4>
            <ScrollArea className="h-[200px] w-full rounded-md border">
              <div className="p-2">
                {parsedSources.map((source, index) => (
                  <div key={index} className="py-2 border-b last:border-b-0">
                    <p className="font-medium">{source.name}</p>
                    <p className="text-sm text-gray-500">{source.url}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold">Repositories</h3>
        {repositoriesError && (
          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between space-y-2 font-medium">
              <div className="text-sm">
                <AlertCircle className="mr-2 h-4 w-4" />
                Error fetching repositories. Please try again.
              </div>
            </div>
          </div>
        )}
        {isLoadingRepositories ? (
          <div className="rounded-md border p-4">
            <div className="flex items-center justify-between space-y-2 font-medium">
              <div className="text-sm">
                Loading repositories...
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {repositories?.map(repo => (
              <div key={repo.id} className="rounded-md border p-4">
                <div className="flex items-center justify-between space-y-2 font-medium">
                  <div className="text-sm">
                    {repo.name}
                    <p className="text-xs text-gray-400">{repo.description}</p>
                    <span className="text-xs text-gray-400">Author: {repo.author}</span>
                  </div>
                  <Switch
                    checked={repo.isEnabled}
                    onCheckedChange={(checked) => handleToggleRepository(repo.id, checked)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CloudStreamPluginManager;
