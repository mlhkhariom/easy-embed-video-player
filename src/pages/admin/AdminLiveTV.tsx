
import { useState, useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Save, 
  Trash2, 
  Radio, 
  MoveUp, 
  MoveDown,
  Check,
  X
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { fetchChannelsByCategory, Channel } from '../../services/iptv';
import { useQuery } from '@tanstack/react-query';
import { LiveTVCategory } from '../../types';

const AdminLiveTV = () => {
  const { 
    liveTVCategories, 
    updateLiveTVCategories, 
    featuredChannels, 
    updateFeaturedChannels,
    settings
  } = useAdmin();
  const { toast } = useToast();
  const [categories, setCategories] = useState<LiveTVCategory[]>(liveTVCategories);
  const [newCategory, setNewCategory] = useState({ id: '', name: '', enabled: true, order: 0 });
  const [selectedChannels, setSelectedChannels] = useState<string[]>(featuredChannels);
  
  // Get all available IPTV categories
  const { data: entertainmentChannels } = useQuery({
    queryKey: ['channels', 'entertainment'],
    queryFn: () => fetchChannelsByCategory('entertainment'),
    enabled: settings.enableLiveTV
  });
  
  const { data: newsChannels } = useQuery({
    queryKey: ['channels', 'news'],
    queryFn: () => fetchChannelsByCategory('news'),
    enabled: settings.enableLiveTV
  });
  
  const { data: sportsChannels } = useQuery({
    queryKey: ['channels', 'sports'],
    queryFn: () => fetchChannelsByCategory('sports'),
    enabled: settings.enableLiveTV
  });
  
  // Combine all channels
  const allChannels = [
    ...(entertainmentChannels || []),
    ...(newsChannels || []),
    ...(sportsChannels || [])
  ].filter(channel => 
    channel.broadcast_area.includes('India') || 
    channel.country === 'IN' ||
    channel.languages.includes('hin') ||
    channel.languages.includes('tam') ||
    channel.languages.includes('tel')
  );
  
  // Initialize categories if empty
  useEffect(() => {
    if (categories.length === 0 && allChannels.length > 0) {
      // Get unique categories from channels
      const uniqueCategories = Array.from(new Set(
        allChannels.flatMap(channel => channel.categories)
      )).filter(Boolean);
      
      // Create initial categories
      const initialCategories = uniqueCategories.map((category, index) => ({
        id: category,
        name: category.charAt(0).toUpperCase() + category.slice(1),
        enabled: true,
        order: index
      }));
      
      setCategories(initialCategories);
    }
  }, [allChannels, categories.length]);
  
  const handleAddCategory = () => {
    if (!newCategory.id || !newCategory.name) {
      toast({
        title: 'Error',
        description: 'Category ID and name are required',
        variant: 'destructive',
      });
      return;
    }
    
    const categoryExists = categories.some(cat => cat.id === newCategory.id);
    if (categoryExists) {
      toast({
        title: 'Error',
        description: 'A category with this ID already exists',
        variant: 'destructive',
      });
      return;
    }
    
    const newCategories = [
      ...categories, 
      { ...newCategory, order: categories.length }
    ];
    
    setCategories(newCategories);
    setNewCategory({ id: '', name: '', enabled: true, order: 0 });
    
    toast({
      title: 'Category Added',
      description: 'The new category has been added successfully',
    });
  };
  
  const handleDeleteCategory = (id: string) => {
    const newCategories = categories.filter(cat => cat.id !== id);
    setCategories(newCategories);
    
    toast({
      title: 'Category Deleted',
      description: 'The category has been deleted successfully',
    });
  };
  
  const handleToggleCategory = (id: string, enabled: boolean) => {
    const newCategories = categories.map(cat => 
      cat.id === id ? { ...cat, enabled } : cat
    );
    setCategories(newCategories);
  };
  
  const handleMoveCategory = (id: string, direction: 'up' | 'down') => {
    const index = categories.findIndex(cat => cat.id === id);
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === categories.length - 1)) {
      return;
    }
    
    const newCategories = [...categories];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newCategories[index], newCategories[newIndex]] = 
    [newCategories[newIndex], newCategories[index]];
    
    // Update order values
    newCategories.forEach((cat, i) => {
      cat.order = i;
    });
    
    setCategories(newCategories);
  };
  
  const handleToggleChannel = (channelId: string) => {
    if (selectedChannels.includes(channelId)) {
      setSelectedChannels(selectedChannels.filter(id => id !== channelId));
    } else {
      setSelectedChannels([...selectedChannels, channelId]);
    }
  };
  
  const handleSaveChanges = () => {
    updateLiveTVCategories(categories);
    updateFeaturedChannels(selectedChannels);
    
    toast({
      title: 'Settings Saved',
      description: 'Your Live TV settings have been saved successfully',
    });
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Live TV Management</h1>
          <Button 
            onClick={handleSaveChanges}
            className="bg-moviemate-primary hover:bg-moviemate-primary/90"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="bg-moviemate-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Categories</CardTitle>
              <CardDescription>
                Manage the categories shown in the Live TV section
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="categoryId">Category ID</Label>
                    <Input
                      id="categoryId"
                      value={newCategory.id}
                      onChange={(e) => setNewCategory({ ...newCategory, id: e.target.value })}
                      placeholder="news"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="categoryName">Display Name</Label>
                    <Input
                      id="categoryName"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="News"
                    />
                  </div>
                  <div className="mt-8">
                    <Button onClick={handleAddCategory}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Enabled</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          No categories yet. Add one above.
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>
                            <Switch
                              checked={category.enabled}
                              onCheckedChange={(checked) => handleToggleCategory(category.id, checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveCategory(category.id, 'up')}
                              >
                                <MoveUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveCategory(category.id, 'down')}
                              >
                                <MoveDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteCategory(category.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-moviemate-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Featured Channels</CardTitle>
              <CardDescription>
                Select channels to be featured on the Live TV homepage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label>Select channels to feature:</Label>
                
                <div className="max-h-[400px] overflow-y-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Channel</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Featured</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allChannels.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center">
                            Loading channels...
                          </TableCell>
                        </TableRow>
                      ) : (
                        allChannels.map((channel) => (
                          <TableRow key={channel.id}>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {channel.logo ? (
                                  <img 
                                    src={channel.logo} 
                                    alt={channel.name} 
                                    className="h-8 w-8 rounded bg-black object-contain p-1" 
                                  />
                                ) : (
                                  <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-800">
                                    <Radio className="h-4 w-4 text-gray-500" />
                                  </div>
                                )}
                                <span className="font-medium">{channel.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {channel.categories.slice(0, 2).join(', ')}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={selectedChannels.includes(channel.id) 
                                  ? "text-green-500 hover:text-green-700" 
                                  : "text-gray-500 hover:text-gray-700"}
                                onClick={() => handleToggleChannel(channel.id)}
                              >
                                {selectedChannels.includes(channel.id) ? (
                                  <Check className="h-5 w-5" />
                                ) : (
                                  <X className="h-5 w-5" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="text-sm text-gray-500">
                  <p>Selected {selectedChannels.length} channel(s) to feature</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminLiveTV;
