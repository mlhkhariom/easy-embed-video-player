
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { fetchSettings, updateSettings } from '@/services/settings';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Search, Film, Tv, Trash2, Edit, Plus } from 'lucide-react';
import { Movie, TvShow } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Mock function to search for content
const searchContent = async (query: string, type: 'movie' | 'tvShow'): Promise<any[]> => {
  // In a real app, this would make an API request to TMDB
  return new Promise((resolve) => {
    setTimeout(() => {
      if (type === 'movie') {
        resolve([
          { id: 1, title: 'Inception', poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', release_date: '2010-07-16', overview: 'A thief who steals corporate secrets...' },
          { id: 2, title: 'The Matrix', poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', release_date: '1999-03-31', overview: 'A computer hacker learns...' },
          { id: 3, title: 'Interstellar', poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', release_date: '2014-11-05', overview: 'Explorers travel through a wormhole...' }
        ]);
      } else {
        resolve([
          { id: 1, name: 'Breaking Bad', poster_path: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', first_air_date: '2008-01-20', overview: 'A high school chemistry teacher...' },
          { id: 2, name: 'Game of Thrones', poster_path: '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg', first_air_date: '2011-04-17', overview: 'Seven noble families...' },
          { id: 3, name: 'Stranger Things', poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', first_air_date: '2016-07-15', overview: 'When a young boy disappears...' }
        ]);
      }
    }, 500);
  });
};

const ContentSearchDialog = ({ 
  type, 
  onSelect 
}: { 
  type: 'movie' | 'tvShow'; 
  onSelect: (content: any) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const searchResults = await searchContent(searchQuery, type);
      setResults(searchResults);
    } catch (error) {
      console.error('Error searching content:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Search {type === 'movie' ? 'Movies' : 'TV Shows'}</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`Search for ${type === 'movie' ? 'movies' : 'TV shows'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
        
        {results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {results.map((item) => (
              <Card key={item.id} className="overflow-hidden cursor-pointer hover:border-primary" onClick={() => onSelect(item)}>
                <div className="aspect-[2/3] relative">
                  <img 
                    src={`https://image.tmdb.org/t/p/w300${item.poster_path}`} 
                    alt={item.title || item.name}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium truncate">{item.title || item.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {item.release_date || item.first_air_date}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {results.length === 0 && searchQuery && !isSearching && (
          <div className="text-center p-4">
            <p>No results found. Try a different search term.</p>
          </div>
        )}
        
        {isSearching && (
          <div className="text-center p-4">
            <p>Searching...</p>
          </div>
        )}
      </div>
    </DialogContent>
  );
};

const AdminContent = () => {
  const { settings, updateSettings: updateAdminSettings } = useAdmin();
  const { toast } = useToast();
  
  // State for form fields
  const [siteName, setSiteName] = useState('');
  const [enableTrending, setEnableTrending] = useState(false);
  const [enableCloudStream, setEnableCloudStream] = useState(false);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [featuredTVShow, setFeaturedTVShow] = useState<TvShow | null>(null);
  const [activeTab, setActiveTab] = useState('general');

  // Fetch settings
  const { isLoading: isLoadingSettings, error: errorSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  });

  // Effect to update form values when settings are fetched
  useEffect(() => {
    const fetchAndUpdateSettings = async () => {
      try {
        const data = await fetchSettings();
        if (data) {
          setSiteName(data?.siteName || '');
          setEnableTrending(data?.enableTrending || false);
          setEnableCloudStream(data?.enableCloudStream || false);
          updateAdminSettings(data);
          
          // If we have movie ID, we'd need to fetch the full movie data from an API
          if (data?.featuredContent?.movie) {
            // Here we're just setting the ID, in a real application 
            // you would fetch the full movie details
            setFeaturedMovie({
              id: data.featuredContent.movie,
              title: "Featured Movie", // This would come from API
              poster_path: "/placeholder.jpg", // This would come from API
              backdrop_path: "/placeholder.jpg", // This would come from API
              release_date: "2023-01-01",
              overview: "This is a sample movie overview.",
              vote_average: 8.5,
              vote_count: 1000,
              popularity: 100,
              adult: false
            });
          }
          
          if (data?.featuredContent?.tvShow) {
            // Similar to movie, we'd fetch TV show details in a real app
            setFeaturedTVShow({
              id: data.featuredContent.tvShow,
              name: "Featured TV Show", // This would come from API
              poster_path: "/placeholder.jpg", // This would come from API
              backdrop_path: "/placeholder.jpg", // This would come from API
              first_air_date: "2023-01-01",
              overview: "This is a sample TV show overview.",
              vote_average: 8.5,
              vote_count: 1000,
              popularity: 100,
              number_of_seasons: 3,
              number_of_episodes: 24
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };

    fetchAndUpdateSettings();
  }, [updateAdminSettings]);

  // Handle settings update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In the actual API, we just store the IDs
      const featuredContent = {
        movie: featuredMovie ? featuredMovie.id : null,
        tvShow: featuredTVShow ? featuredTVShow.id : null
      };

      // Update settings
      const updatedSettings = await updateSettings({
        siteName,
        enableTrending,
        enableCloudStream,
        featuredContent
      });

      // Update context
      updateAdminSettings(updatedSettings);

      toast({
        title: "Settings updated",
        description: "Content settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
      console.error(error);
    }
  };
  
  const handleMovieSelect = (movie: Movie) => {
    setFeaturedMovie(movie);
    toast({
      title: "Movie selected",
      description: `${movie.title} has been selected as the featured movie.`,
    });
  };
  
  const handleTVShowSelect = (tvShow: TvShow) => {
    setFeaturedTVShow(tvShow);
    toast({
      title: "TV Show selected",
      description: `${tvShow.name} has been selected as the featured TV show.`,
    });
  };

  if (isLoadingSettings) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Content Settings</h1>
          <p>Loading settings...</p>
        </div>
      </AdminLayout>
    );
  }

  if (errorSettings) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Content Settings</h1>
          <p className="text-red-500">Error loading settings. Please try again.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Content Management</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="featured">Featured Content</TabsTrigger>
            <TabsTrigger value="libraries">Libraries</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>General Content Settings</CardTitle>
                  <CardDescription>
                    Configure site name and content features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="siteName" className="text-sm font-medium">
                      Site Name
                    </label>
                    <Input
                      id="siteName"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="Enter site name"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div className="space-y-0.5">
                      <label htmlFor="enableTrending" className="text-sm font-medium">
                        Enable Trending
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Show trending movies and shows on the homepage
                      </p>
                    </div>
                    <Switch
                      id="enableTrending"
                      checked={enableTrending}
                      onCheckedChange={setEnableTrending}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label htmlFor="enableCloudStream" className="text-sm font-medium">
                        Enable CloudStream
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Enable CloudStream integration for additional content
                      </p>
                    </div>
                    <Switch
                      id="enableCloudStream"
                      checked={enableCloudStream}
                      onCheckedChange={setEnableCloudStream}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">
                    Save Settings
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>
          
          <TabsContent value="featured">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Featured Movie Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Film size={18} />
                      Featured Movie
                    </CardTitle>
                    <CardDescription>
                      Select the movie to feature on the homepage
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus size={16} className="mr-1" /> Search
                      </Button>
                    </DialogTrigger>
                    <ContentSearchDialog type="movie" onSelect={handleMovieSelect} />
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {featuredMovie ? (
                    <div className="space-y-4">
                      <div className="aspect-[2/3] rounded-md overflow-hidden border border-border">
                        <img 
                          src={featuredMovie.poster_path.startsWith('/placeholder') ? '/placeholder.svg' : `https://image.tmdb.org/t/p/w400${featuredMovie.poster_path}`} 
                          alt={featuredMovie.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold">{featuredMovie.title}</h3>
                        <p className="text-sm text-muted-foreground">{featuredMovie.release_date}</p>
                        <p className="text-sm mt-2 line-clamp-2">{featuredMovie.overview}</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        onClick={() => setFeaturedMovie(null)}
                        className="w-full"
                        type="button"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Remove Featured Movie
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-muted rounded-lg p-6 text-center">
                      <Film className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No featured movie selected</p>
                      <p className="mt-2 text-sm text-muted-foreground">Use the search button to set a featured movie</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Featured TV Show Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Tv size={18} />
                      Featured TV Show
                    </CardTitle>
                    <CardDescription>
                      Select the TV show to feature on the homepage
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus size={16} className="mr-1" /> Search
                      </Button>
                    </DialogTrigger>
                    <ContentSearchDialog type="tvShow" onSelect={handleTVShowSelect} />
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {featuredTVShow ? (
                    <div className="space-y-4">
                      <div className="aspect-[2/3] rounded-md overflow-hidden border border-border">
                        <img 
                          src={featuredTVShow.poster_path.startsWith('/placeholder') ? '/placeholder.svg' : `https://image.tmdb.org/t/p/w400${featuredTVShow.poster_path}`} 
                          alt={featuredTVShow.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold">{featuredTVShow.name}</h3>
                        <p className="text-sm text-muted-foreground">{featuredTVShow.first_air_date}</p>
                        <p className="text-sm mt-2 line-clamp-2">{featuredTVShow.overview}</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        onClick={() => setFeaturedTVShow(null)}
                        className="w-full"
                        type="button"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Remove Featured TV Show
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-muted rounded-lg p-6 text-center">
                      <Tv className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No featured TV show selected</p>
                      <p className="mt-2 text-sm text-muted-foreground">Use the search button to set a featured TV show</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="libraries">
            <Card>
              <CardHeader>
                <CardTitle>Content Libraries</CardTitle>
                <CardDescription>
                  Manage your imported content libraries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted rounded-lg p-6 text-center">
                    <p className="text-muted-foreground">No content libraries configured yet.</p>
                    <p className="mt-2 text-sm text-muted-foreground">Configure libraries from the settings page.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminContent;
