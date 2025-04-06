import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { fetchSettings, updateSettings } from '@/services/settings';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Movie, TvShow } from '@/types';

const AdminContent = () => {
  const { updateSettings: updateAdminSettings } = useAdmin();
  const { toast } = useToast();
  
  // State for form fields
  const [siteName, setSiteName] = useState('');
  const [enableTrending, setEnableTrending] = useState(false);
  const [enableCloudStream, setEnableCloudStream] = useState(false);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [featuredTVShow, setFeaturedTVShow] = useState<TvShow | null>(null);

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
              title: "Movie Title", // This would come from API
              poster_path: "/placeholder.jpg", // This would come from API
              backdrop_path: "/placeholder.jpg", // This would come from API
              release_date: "",
              overview: "",
              vote_average: 0,
              vote_count: 0,
              popularity: 0,
              adult: false
            });
          }
          
          if (data?.featuredContent?.tvShow) {
            // Similar to movie, we'd fetch TV show details in a real app
            setFeaturedTVShow({
              id: data.featuredContent.tvShow,
              name: "TV Show Name", // This would come from API
              poster_path: "/placeholder.jpg", // This would come from API
              backdrop_path: "/placeholder.jpg", // This would come from API
              first_air_date: "",
              overview: "",
              vote_average: 0,
              vote_count: 0,
              popularity: 0,
              number_of_seasons: 0,
              number_of_episodes: 0
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
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Content Settings</h1>
        
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>General Content Settings</CardTitle>
              <CardDescription>
                Configure various content features on your site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
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
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label htmlFor="enableTrending" className="text-sm font-medium">
                      Enable Trending
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Enable CloudStream integration for additional content
                    </p>
                  </div>
                  <Switch
                    id="enableCloudStream"
                    checked={enableCloudStream}
                    onCheckedChange={setEnableCloudStream}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">
                Save Settings
              </Button>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Featured Movie</CardTitle>
                <CardDescription>
                  The movie that will be featured on the homepage
                </CardDescription>
              </CardHeader>
              <CardContent>
                {featuredMovie ? (
                  <div className="space-y-4">
                    <img 
                      src={`https://image.tmdb.org/t/p/w400${featuredMovie.poster_path}`} 
                      alt={featuredMovie.title}
                      className="rounded-lg shadow-md max-w-full h-auto"
                    />
                    <div>
                      <h3 className="font-bold">{featuredMovie.title}</h3>
                      <p className="text-sm opacity-70">ID: {featuredMovie.id}</p>
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={() => setFeaturedMovie(null)}
                      type="button"
                    >
                      Remove Featured Movie
                    </Button>
                  </div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No featured movie selected</p>
                    <p className="mt-2 text-sm">Use the search function to set a featured movie</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Featured TV Show</CardTitle>
                <CardDescription>
                  The TV show that will be featured on the homepage
                </CardDescription>
              </CardHeader>
              <CardContent>
                {featuredTVShow ? (
                  <div className="space-y-4">
                    <img 
                      src={`https://image.tmdb.org/t/p/w400${featuredTVShow.poster_path}`} 
                      alt={featuredTVShow.name}
                      className="rounded-lg shadow-md max-w-full h-auto"
                    />
                    <div>
                      <h3 className="font-bold">{featuredTVShow.name}</h3>
                      <p className="text-sm opacity-70">ID: {featuredTVShow.id}</p>
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={() => setFeaturedTVShow(null)}
                      type="button"
                    >
                      Remove Featured TV Show
                    </Button>
                  </div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No featured TV show selected</p>
                    <p className="mt-2 text-sm">Use the search function to set a featured TV show</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminContent;
