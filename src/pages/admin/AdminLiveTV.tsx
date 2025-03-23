
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Channel, getChannelsByCategory, fetchChannels } from '../../services/iptv';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { PlusCircle, Search, Edit, Trash2, Play, Radio, Eye, EyeOff, CheckCircle2, RefreshCw, ExternalLink, Filter } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAdmin } from '../../contexts/AdminContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import LiveTVPlayer from '../../components/LiveTVPlayer';

const DataTableSearch = ({ data, onFilter }: { data: Channel[], onFilter: (filtered: Channel[]) => void }) => {
    const [input, setInput] = useState("");
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    // Get unique categories from all channels
    const allCategories = Array.from(new Set(data.flatMap(channel => channel.categories))).sort();

    useEffect(() => {
        const filtered = data.filter((channel) => {
            const matchesSearch = channel.name.toLowerCase().includes(input.toLowerCase());
            const matchesCategories = selectedCategories.length === 0 || 
                channel.categories.some(cat => selectedCategories.includes(cat));
            
            return matchesSearch && matchesCategories;
        });
        
        onFilter(filtered);
    }, [input, selectedCategories, data, onFilter]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                        className="pl-8"
                        placeholder="Search channels..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter className="mr-2 h-4 w-4" />
                    {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
            </div>

            {showFilters && (
                <div className="rounded-md border border-border bg-card p-4">
                    <h4 className="mb-2 text-sm font-medium">Filter by Category</h4>
                    <div className="flex flex-wrap gap-2">
                        {allCategories.map(category => (
                            <div key={category} className="flex items-center space-x-2">
                                <Checkbox 
                                    id={`category-${category}`} 
                                    checked={selectedCategories.includes(category)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setSelectedCategories(prev => [...prev, category]);
                                        } else {
                                            setSelectedCategories(prev => prev.filter(c => c !== category));
                                        }
                                    }}
                                />
                                <Label htmlFor={`category-${category}`}>{category}</Label>
                            </div>
                        ))}
                    </div>
                    {selectedCategories.length > 0 && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => setSelectedCategories([])}
                        >
                            Clear Filters
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

const ChannelPreviewDialog = ({ channel }: { channel: Channel }) => {
    const [streamUrl, setStreamUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    // Load the stream when the dialog opens
    useEffect(() => {
        const loadStream = async () => {
            try {
                setIsLoading(true);
                const { getStreamForChannel } = await import('../../services/iptv');
                const stream = await getStreamForChannel(channel.id);
                if (stream) {
                    setStreamUrl(stream.url);
                } else {
                    toast({
                        title: "Stream Unavailable",
                        description: "No stream found for this channel",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                console.error("Error loading stream:", error);
                toast({
                    title: "Error",
                    description: "Failed to load the stream. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadStream();
    }, [channel.id, toast]);

    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Previewing: {channel.name}</DialogTitle>
                <DialogDescription>
                    Check the stream quality and availability
                </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4">
                <LiveTVPlayer
                    channel={channel}
                    streamUrl={streamUrl}
                    isLoading={isLoading}
                />
            </div>
            
            <div className="mt-4 rounded-md bg-secondary/50 p-3">
                <h3 className="mb-2 text-sm font-medium">Channel Details</h3>
                <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    <div>
                        <span className="font-medium">Categories:</span>{' '}
                        {channel.categories.join(', ')}
                    </div>
                    <div>
                        <span className="font-medium">Languages:</span>{' '}
                        {channel.languages.length ? channel.languages.join(', ') : 'N/A'}
                    </div>
                    <div>
                        <span className="font-medium">Broadcast Area:</span>{' '}
                        {channel.broadcast_area.length ? channel.broadcast_area.join(', ') : 'N/A'}
                    </div>
                    {channel.website && (
                        <div>
                            <span className="font-medium">Website:</span>{' '}
                            <a 
                                href={channel.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary underline"
                            >
                                Visit Website
                            </a>
                        </div>
                    )}
                </div>
            </div>
            
            <DialogFooter>
                <Button variant="outline" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in Live TV
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

const AdminLiveTV = () => {
    const [allChannels, setAllChannels] = useState<Channel[]>([]);
    const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
    const [category, setCategory] = useState<string>('all');
    const [loading, setLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const { toast } = useToast();
    const { liveTVCategories, featuredChannels, updateFeaturedChannels } = useAdmin();

    const fetchAllChannels = async () => {
        setLoading(true);
        try {
            const channelsData = await fetchChannels();
            setAllChannels(channelsData);
            setFilteredChannels(channelsData);
        } catch (error) {
            console.error("Failed to fetch channels:", error);
            toast({
                title: "Error",
                description: "Failed to fetch channels. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllChannels();
    }, [toast]);

    const handleCategoryChange = async (selectedCategory: string) => {
        setCategory(selectedCategory);
        setLoading(true);
        
        try {
            let channelsData;
            if (selectedCategory === 'all') {
                channelsData = await fetchChannels();
            } else {
                channelsData = await getChannelsByCategory(selectedCategory);
            }
            
            setAllChannels(channelsData);
            setFilteredChannels(channelsData);
        } catch (error) {
            console.error("Failed to fetch channels:", error);
            toast({
                title: "Error",
                description: "Failed to fetch channels. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshChannels = async () => {
        setRefreshing(true);
        try {
            await fetchAllChannels();
            toast({
                title: "Success",
                description: "Channel list refreshed successfully",
            });
        } catch (error) {
            console.error("Failed to refresh channels:", error);
            toast({
                title: "Error",
                description: "Failed to refresh channels. Please try again.",
                variant: "destructive",
            });
        } finally {
            setRefreshing(false);
        }
    };

    const toggleFeaturedChannel = (channelId: string) => {
        const isFeatured = featuredChannels.includes(channelId);
        let updatedFeatured;
        
        if (isFeatured) {
            updatedFeatured = featuredChannels.filter(id => id !== channelId);
        } else {
            updatedFeatured = [...featuredChannels, channelId];
        }
        
        updateFeaturedChannels(updatedFeatured);
        
        toast({
            title: isFeatured ? "Removed from Featured" : "Added to Featured",
            description: `Channel has been ${isFeatured ? 'removed from' : 'added to'} featured list`,
        });
    };

    const handleFilteredChannels = (filtered: Channel[]) => {
        setFilteredChannels(filtered);
    };

    return (
        <AdminLayout>
            <div className="container mx-auto py-10">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <CardTitle>Live TV Channels</CardTitle>
                                <CardDescription>Manage and view live TV channels by category.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={handleRefreshChannels}
                                    disabled={refreshing}
                                >
                                    <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" /> 
                                    Add Custom Channel
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <Tabs defaultValue="browse" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                                    <TabsTrigger value="browse">Browse Channels</TabsTrigger>
                                    <TabsTrigger value="featured">Featured Channels</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="browse" className="mt-4">
                                    <div className="grid gap-4">
                                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                            <Select value={category} onValueChange={handleCategoryChange}>
                                                <SelectTrigger className="w-[200px]">
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Categories</SelectItem>
                                                    <SelectItem value="movies">Movies</SelectItem>
                                                    <SelectItem value="news">News</SelectItem>
                                                    <SelectItem value="sports">Sports</SelectItem>
                                                    <SelectItem value="entertainment">Entertainment</SelectItem>
                                                    <SelectItem value="music">Music</SelectItem>
                                                    <SelectItem value="documentary">Documentary</SelectItem>
                                                    <SelectItem value="kids">Kids</SelectItem>
                                                    <SelectItem value="general">General</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        <DataTableSearch data={allChannels} onFilter={handleFilteredChannels} />
                                        
                                        {loading ? (
                                            <div className="space-y-2">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <div key={i} className="flex items-center gap-4 rounded-md border p-4">
                                                        <Skeleton className="h-12 w-12 rounded-md" />
                                                        <div className="space-y-2">
                                                            <Skeleton className="h-4 w-32" />
                                                            <Skeleton className="h-3 w-24" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="rounded-md border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-[80px]">Logo</TableHead>
                                                            <TableHead>Name</TableHead>
                                                            <TableHead className="hidden md:table-cell">Category</TableHead>
                                                            <TableHead className="hidden lg:table-cell">Languages</TableHead>
                                                            <TableHead className="w-[100px] text-center">Featured</TableHead>
                                                            <TableHead className="text-right">Actions</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {filteredChannels.length === 0 ? (
                                                            <TableRow>
                                                                <TableCell colSpan={6} className="h-24 text-center">
                                                                    No channels found
                                                                </TableCell>
                                                            </TableRow>
                                                        ) : (
                                                            filteredChannels.map((channel) => (
                                                                <TableRow key={channel.id}>
                                                                    <TableCell>
                                                                        {channel.logo ? (
                                                                            <img src={channel.logo} alt={channel.name} className="h-10 w-auto max-w-[40px] object-contain" />
                                                                        ) : (
                                                                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/20">
                                                                                <Radio size={20} className="text-primary" />
                                                                            </div>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="font-medium">
                                                                        {channel.name}
                                                                    </TableCell>
                                                                    <TableCell className="hidden md:table-cell">
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {channel.categories.slice(0, 2).map((cat) => (
                                                                                <Badge key={cat} variant="secondary" className="whitespace-nowrap">
                                                                                    {cat}
                                                                                </Badge>
                                                                            ))}
                                                                            {channel.categories.length > 2 && (
                                                                                <Badge variant="outline">+{channel.categories.length - 2}</Badge>
                                                                            )}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="hidden lg:table-cell">
                                                                        {channel.languages.length > 0 ? 
                                                                            channel.languages.slice(0, 2).join(', ') : 'N/A'}
                                                                    </TableCell>
                                                                    <TableCell className="text-center">
                                                                        <Switch 
                                                                            checked={featuredChannels.includes(channel.id)}
                                                                            onCheckedChange={() => toggleFeaturedChannel(channel.id)}
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <div className="flex justify-end gap-2">
                                                                            <Dialog>
                                                                                <DialogTrigger asChild>
                                                                                    <Button variant="ghost" size="icon">
                                                                                        <Play className="h-4 w-4" />
                                                                                    </Button>
                                                                                </DialogTrigger>
                                                                                <ChannelPreviewDialog channel={channel} />
                                                                            </Dialog>
                                                                            
                                                                            <Button variant="ghost" size="icon">
                                                                                <Edit className="h-4 w-4" />
                                                                            </Button>
                                                                            
                                                                            <Button variant="ghost" size="icon">
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
                                        )}
                                    </div>
                                </TabsContent>
                                
                                <TabsContent value="featured" className="mt-4">
                                    <div className="grid gap-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-medium">Featured Channels</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {featuredChannels.length} channels featured
                                            </p>
                                        </div>
                                        
                                        {loading ? (
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                                {Array.from({ length: 8 }).map((_, i) => (
                                                    <Skeleton key={i} className="aspect-video w-full rounded-md" />
                                                ))}
                                            </div>
                                        ) : featuredChannels.length === 0 ? (
                                            <div className="rounded-md border border-dashed p-8 text-center">
                                                <Radio size={40} className="mx-auto mb-2 text-muted-foreground" />
                                                <h3 className="mb-1 text-lg font-medium">No Featured Channels</h3>
                                                <p className="mb-4 text-sm text-muted-foreground">
                                                    Add channels to your featured list to display them prominently on the Live TV page.
                                                </p>
                                                <Button 
                                                    variant="outline" 
                                                    onClick={() => document.querySelector('[data-value="browse"]')?.click()}
                                                >
                                                    Browse Channels
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                                {allChannels
                                                    .filter(channel => featuredChannels.includes(channel.id))
                                                    .map(channel => (
                                                        <div 
                                                            key={channel.id} 
                                                            className="group relative overflow-hidden rounded-md border bg-card"
                                                        >
                                                            <div className="relative aspect-video bg-gradient-to-b from-transparent to-black/50 p-4">
                                                                {channel.logo ? (
                                                                    <img 
                                                                        src={channel.logo} 
                                                                        alt={channel.name}
                                                                        className="h-full w-full object-contain"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center">
                                                                        <Radio size={40} className="text-primary" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            <div className="p-3">
                                                                <h4 className="font-medium">{channel.name}</h4>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {channel.categories.slice(0, 2).join(', ')}
                                                                </p>
                                                            </div>
                                                            
                                                            <div className="absolute right-2 top-2 flex gap-1">
                                                                <Button 
                                                                    variant="destructive" 
                                                                    size="icon" 
                                                                    className="h-7 w-7"
                                                                    onClick={() => toggleFeaturedChannel(channel.id)}
                                                                >
                                                                    <EyeOff className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t p-4">
                        <p className="text-sm text-muted-foreground">
                            Showing {filteredChannels.length} of {allChannels.length} channels
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminLiveTV;
