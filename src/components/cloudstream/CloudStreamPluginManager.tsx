
import { useState } from 'react';
import { PlusCircle, FileCode, Github, Download, CloudOff, RefreshCw, Trash2, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';

interface CloudStreamPlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  repository: string;
  language?: string;
  categories?: string[];
  lastUpdated: string;
  status: 'installed' | 'available' | 'update-available';
}

interface CloudStreamRepository {
  id: string;
  name: string;
  url: string;
  description?: string;
  author?: string;
  pluginCount: number;
  isEnabled: boolean;
  lastSynced?: string;
}

const DEMO_PLUGINS: CloudStreamPlugin[] = [
  {
    id: 'plugin1',
    name: 'Hotstar Plugin',
    description: 'Access Hotstar content including sports, movies and TV shows',
    version: '1.2.0',
    author: 'CSIndian',
    repository: 'Indian Plugins',
    language: 'hi',
    categories: ['movies', 'tv', 'sports'],
    lastUpdated: '2023-12-15',
    status: 'installed'
  },
  {
    id: 'plugin2',
    name: 'SonyLIV',
    description: 'Access SonyLIV content with regional language support',
    version: '0.9.5',
    author: 'StreamIndia',
    repository: 'Indian Plugins',
    language: 'hi',
    categories: ['movies', 'tv'],
    lastUpdated: '2023-11-20',
    status: 'update-available'
  },
  {
    id: 'plugin3',
    name: 'Zee5',
    description: 'Stream content from Zee5',
    version: '1.0.0',
    author: 'DesiStream',
    repository: 'Indian Plugins',
    language: 'hi',
    categories: ['movies', 'tv'],
    lastUpdated: '2024-01-10',
    status: 'installed'
  },
  {
    id: 'plugin4',
    name: 'MXPlayer',
    description: 'Access MX Player Originals and other content',
    version: '0.8.1',
    author: 'RegionalStreams',
    repository: 'Regional Content',
    language: 'multi',
    categories: ['movies', 'tv'],
    lastUpdated: '2023-10-05',
    status: 'available'
  },
  {
    id: 'plugin5',
    name: 'Voot',
    description: 'Stream Voot content with premium access',
    version: '1.1.0',
    author: 'StreamIndia',
    repository: 'Indian Plugins',
    language: 'hi',
    categories: ['movies', 'tv', 'kids'],
    lastUpdated: '2024-02-01',
    status: 'available'
  }
];

const DEMO_REPOS: CloudStreamRepository[] = [
  {
    id: 'repo1',
    name: 'Indian Plugins',
    url: 'https://github.com/user/cloudstream-indian-plugins',
    description: 'Collection of plugins for Indian streaming services',
    author: 'IndiaStreamTeam',
    pluginCount: 15,
    isEnabled: true,
    lastSynced: '2024-03-01'
  },
  {
    id: 'repo2',
    name: 'Regional Content',
    url: 'https://github.com/user/regional-plugins',
    description: 'Plugins for regional language content across India',
    author: 'RegionalDevs',
    pluginCount: 8,
    isEnabled: true,
    lastSynced: '2024-02-15'
  },
  {
    id: 'repo3',
    name: 'CloudStream Core',
    url: 'https://github.com/recloudstream/cloudstream-extensions',
    description: 'Official CloudStream extensions repository',
    author: 'CloudStream Team',
    pluginCount: 25,
    isEnabled: false,
    lastSynced: '2024-01-20'
  }
];

const CloudStreamPluginManager = () => {
  const [activeTab, setActiveTab] = useState('plugins');
  const [plugins, setPlugins] = useState<CloudStreamPlugin[]>(DEMO_PLUGINS);
  const [repositories, setRepositories] = useState<CloudStreamRepository[]>(DEMO_REPOS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingRepo, setIsAddingRepo] = useState(false);
  const [newRepo, setNewRepo] = useState({ name: '', url: '', description: '' });
  const [isImportingPlugin, setIsImportingPlugin] = useState(false);
  const [pluginUrl, setPluginUrl] = useState('');
  const { toast } = useToast();

  // Filter plugins by search query
  const filteredPlugins = plugins.filter(plugin => 
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter repositories by search query
  const filteredRepos = repositories.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (repo.author && repo.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Install or update plugin
  const handleInstallPlugin = (pluginId: string) => {
    setPlugins(prevPlugins => 
      prevPlugins.map(plugin => 
        plugin.id === pluginId 
          ? { ...plugin, status: 'installed' } 
          : plugin
      )
    );
    
    toast({
      title: "Plugin Installed",
      description: "The plugin has been successfully installed",
    });
  };

  // Uninstall plugin
  const handleUninstallPlugin = (pluginId: string) => {
    setPlugins(prevPlugins => 
      prevPlugins.map(plugin => 
        plugin.id === pluginId 
          ? { ...plugin, status: 'available' } 
          : plugin
      )
    );
    
    toast({
      title: "Plugin Uninstalled",
      description: "The plugin has been removed from your system",
    });
  };

  // Toggle repository enabled state
  const handleToggleRepo = (repoId: string) => {
    setRepositories(prevRepos => 
      prevRepos.map(repo => 
        repo.id === repoId 
          ? { ...repo, isEnabled: !repo.isEnabled } 
          : repo
      )
    );
    
    toast({
      title: "Repository Updated",
      description: "Repository status has been updated",
    });
  };

  // Add new repository
  const handleAddRepository = () => {
    if (!newRepo.name || !newRepo.url) {
      toast({
        title: "Validation Error",
        description: "Please provide both name and URL for the repository",
        variant: "destructive"
      });
      return;
    }
    
    const newRepoObj: CloudStreamRepository = {
      id: `repo${repositories.length + 1}`,
      name: newRepo.name,
      url: newRepo.url,
      description: newRepo.description,
      pluginCount: 0,
      isEnabled: true,
      lastSynced: new Date().toISOString().split('T')[0]
    };
    
    setRepositories(prev => [...prev, newRepoObj]);
    setNewRepo({ name: '', url: '', description: '' });
    setIsAddingRepo(false);
    
    toast({
      title: "Repository Added",
      description: "New repository has been added and synced",
    });
  };

  // Import plugin from URL
  const handleImportPlugin = () => {
    if (!pluginUrl) {
      toast({
        title: "Validation Error",
        description: "Please provide a valid plugin URL",
        variant: "destructive"
      });
      return;
    }
    
    // Mock plugin import
    const newPlugin: CloudStreamPlugin = {
      id: `plugin${plugins.length + 1}`,
      name: `Imported Plugin ${plugins.length + 1}`,
      description: 'Custom imported plugin',
      version: '1.0.0',
      author: 'Custom',
      repository: 'Custom Imports',
      lastUpdated: new Date().toISOString().split('T')[0],
      status: 'installed'
    };
    
    setPlugins(prev => [...prev, newPlugin]);
    setPluginUrl('');
    setIsImportingPlugin(false);
    
    toast({
      title: "Plugin Imported",
      description: "Custom plugin has been imported and installed",
    });
  };

  // Sync all repositories
  const handleSyncAll = () => {
    toast({
      title: "Syncing Repositories",
      description: "Updating all repositories and checking for new plugins",
    });
    
    // Mock sync process
    setTimeout(() => {
      setRepositories(prev => 
        prev.map(repo => ({
          ...repo,
          lastSynced: new Date().toISOString().split('T')[0]
        }))
      );
      
      toast({
        title: "Sync Complete",
        description: "All repositories have been updated",
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">CloudStream Plugin Manager</h2>
          <p className="text-gray-400">Manage extensions and repositories for CloudStream</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Dialog open={isImportingPlugin} onOpenChange={setIsImportingPlugin}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileCode className="h-4 w-4" />
                Import Plugin
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-moviemate-card/90 backdrop-blur-md">
              <DialogHeader>
                <DialogTitle>Import Plugin</DialogTitle>
                <DialogDescription>
                  Import a CloudStream plugin by providing its URL
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="plugin-url">Plugin URL</Label>
                  <Input
                    id="plugin-url"
                    placeholder="https://github.com/user/repo/plugin.zip"
                    value={pluginUrl}
                    onChange={(e) => setPluginUrl(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportingPlugin(false)}>
                  Cancel
                </Button>
                <Button onClick={handleImportPlugin}>Import</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddingRepo} onOpenChange={setIsAddingRepo}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Github className="h-4 w-4" />
                Add Repository
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-moviemate-card/90 backdrop-blur-md">
              <DialogHeader>
                <DialogTitle>Add Repository</DialogTitle>
                <DialogDescription>
                  Add a new CloudStream repository to find more plugins
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="repo-name">Repository Name</Label>
                  <Input
                    id="repo-name"
                    placeholder="Indian Plugins"
                    value={newRepo.name}
                    onChange={(e) => setNewRepo(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repo-url">Repository URL</Label>
                  <Input
                    id="repo-url"
                    placeholder="https://github.com/user/cloudstream-extensions"
                    value={newRepo.url}
                    onChange={(e) => setNewRepo(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repo-description">Description (Optional)</Label>
                  <Input
                    id="repo-description"
                    placeholder="Collection of Indian streaming service plugins"
                    value={newRepo.description}
                    onChange={(e) => setNewRepo(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingRepo(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRepository}>Add Repository</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button onClick={handleSyncAll} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync All
          </Button>
        </div>
      </div>
      
      <div className="relative">
        <Input
          placeholder="Search plugins or repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-moviemate-card/50"
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plugins">Plugins</TabsTrigger>
          <TabsTrigger value="repositories">Repositories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plugins" className="mt-6">
          {filteredPlugins.length === 0 ? (
            <Card className="bg-moviemate-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>No Plugins Found</CardTitle>
                <CardDescription>
                  Try adding repositories or importing plugins directly
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => setIsImportingPlugin(true)}>
                  <FileCode className="mr-2 h-4 w-4" />
                  Import Plugin
                </Button>
                <Button variant="outline" onClick={() => setIsAddingRepo(true)}>
                  <Github className="mr-2 h-4 w-4" />
                  Add Repository
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPlugins.map(plugin => (
                <Card key={plugin.id} className="bg-moviemate-card/50 backdrop-blur-sm overflow-hidden">
                  <div className={`h-1 w-full ${
                    plugin.status === 'installed' 
                      ? 'bg-green-500' 
                      : plugin.status === 'update-available' 
                        ? 'bg-amber-500' 
                        : 'bg-gray-500'
                  }`}></div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {plugin.name}
                          {plugin.status === 'update-available' && (
                            <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-500">
                              Update
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {plugin.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-xs text-muted-foreground grid grid-cols-2 gap-1">
                      <div>Version: {plugin.version}</div>
                      <div>Author: {plugin.author}</div>
                      <div>Repository: {plugin.repository}</div>
                      <div>Updated: {plugin.lastUpdated}</div>
                    </div>
                    {plugin.categories && plugin.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {plugin.categories.map(category => (
                          <span 
                            key={category} 
                            className="text-xs px-2 py-1 rounded-full bg-moviemate-primary/20 text-moviemate-primary"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    {plugin.status === 'installed' ? (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="w-full gap-2"
                        onClick={() => handleUninstallPlugin(plugin.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Uninstall
                      </Button>
                    ) : plugin.status === 'update-available' ? (
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="w-full gap-2"
                        onClick={() => handleInstallPlugin(plugin.id)}
                      >
                        <Download className="h-4 w-4" />
                        Update
                      </Button>
                    ) : (
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="w-full gap-2" 
                        onClick={() => handleInstallPlugin(plugin.id)}
                      >
                        <Download className="h-4 w-4" />
                        Install
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="repositories" className="mt-6">
          {filteredRepos.length === 0 ? (
            <Card className="bg-moviemate-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>No Repositories Found</CardTitle>
                <CardDescription>
                  Add a new repository to find plugins
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center">
                <Button onClick={() => setIsAddingRepo(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Repository
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredRepos.map(repo => (
                <Card key={repo.id} className="bg-moviemate-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {repo.name}
                          {!repo.isEnabled && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-400">
                              Disabled
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {repo.description || 'No description available'}
                        </CardDescription>
                      </div>
                      <Switch
                        checked={repo.isEnabled}
                        onCheckedChange={() => handleToggleRepo(repo.id)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>URL: {repo.url}</div>
                      {repo.author && <div>Author: {repo.author}</div>}
                      <div>Plugins: {repo.pluginCount}</div>
                      {repo.lastSynced && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last synced: {repo.lastSynced}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleRepo(repo.id)}
                    >
                      {repo.isEnabled ? (
                        <>
                          <CloudOff className="mr-2 h-4 w-4" />
                          Disable
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Enable
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Syncing Repository",
                          description: `Updating ${repo.name}...`,
                        });
                        
                        setTimeout(() => {
                          setRepositories(prev => 
                            prev.map(r => 
                              r.id === repo.id 
                                ? { ...r, lastSynced: new Date().toISOString().split('T')[0] } 
                                : r
                            )
                          );
                          
                          toast({
                            title: "Sync Complete",
                            description: `${repo.name} has been updated`,
                          });
                        }, 1000);
                      }}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CloudStreamPluginManager;
