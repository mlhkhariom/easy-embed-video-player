import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Settings } from '@/types';
import { Movie, TvShow } from '@/types';
import { fetchSettings, updateSettings as updateSettingsAPI } from '@/services/settings';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAdmin } from '@/contexts/AdminContext';
import { Search } from 'lucide-react';
import { fetchTrendingMovies, fetchTrendingTVShows } from '@/services/tmdb';
import MovieCard from '@/components/MovieCard';

const AdminContent = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { settings, setSettings } = useAdmin();

  // State variables
  const [siteName, setSiteName] = useState(settings?.siteName || '');
  const [enableTrending, setEnableTrending] = useState(settings?.enableTrending || false);
  const [enableCloudStream, setEnableCloudStream] = useState(settings?.enableCloudStream || false);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingTVShows, setTrendingTVShows] = useState<TvShow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResultsMovies, setSearchResultsMovies] = useState<Movie[]>([]);
  const [searchResultsTVShows, setSearchResultsTVShows] = useState<TvShow[]>([]);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(settings.featuredMovie);
  const [featuredTVShow, setFeaturedTVShow] = useState<TvShow | null>(settings.featuredTVShow);

  // Fetch settings
  const { isLoading: isLoadingSettings, error: errorSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    onSuccess: (data) => {
      setSiteName(data?.siteName || '');
      setEnableTrending(data?.enableTrending || false);
      setEnableCloudStream(data?.enableCloudStream || false);
      setSettings(data);
      setFeaturedMovie(data?.featuredMovie || null);
      setFeaturedTVShow(data?.featuredTVShow || null);
    }
  });

  // Update settings mutation
  const { mutate: updateSettings, isLoading: isUpdatingSettings } = useMutation({
    mutationFn: (updates: Partial<Settings>) => updateSettingsAPI(updates),
    onSuccess: () => {
      toast({
        title: "Settings updated successfully.",
      });
      queryClient.invalidateQueries(['settings']);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update settings.",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  // Fetch trending content
  useEffect(() => {
    const fetchTrendingContent = async () => {
      try {
        const movies = await fetchTrendingMovies();
        const tvShows = await fetchTrendingTVShows();
        setTrendingMovies(movies);
        setTrendingTVShows(tvShows);
      } catch (error) {
        console.error("Error fetching trending content:", error);
        toast({
          title: "Error fetching trending content",
          description: "Failed to load trending movies and TV shows.",
          variant: "destructive",
        });
      }
    };

    if (enableTrending) {
      fetchTrendingContent();
    } else {
      setTrendingMovies([]);
      setTrendingTVShows([]);
    }
  }, [enableTrending, toast]);

  // Handle site name change
  const handleSiteNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSiteName(e.target.value);
  };

  // Handle enable trending change
  const handleEnableTrendingChange = (checked: boolean) => {
    setEnableTrending(checked);
  };

  // Handle enable cloudstream change
  const handleEnableCloudStreamChange = (checked: boolean) => {
    setEnableCloudStream(checked);
  };

  // Handle save settings
  const handleSaveSettings = () => {
    updateSettings({
      siteName: siteName,
      enableTrending: enableTrending,
      enableCloudStream: enableCloudStream
    });
  };

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    try {
      // Basic search simulation (replace with actual API calls)
      const movies = trendingMovies.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const tvShows = trendingTVShows.filter(show =>
        show.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setSearchResultsMovies(movies);
      setSearchResultsTVShows(tvShows);
    } catch (error) {
      console.error("Error searching content:", error);
      toast({
        title: "Error searching content",
        description: "Failed to perform search.",
        variant: "destructive",
      });
    }
  };

  // Handle feature movie
  const handleFeatureMovie = (movie: any) => {
    // Convert to proper Movie type with as unknown first
    const movieData = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.posterPath,
      backdrop_path: movie.backdropPath,
      // Add other required Movie properties with default values
      overview: '',
      release_date: '',
      vote_average: 0,
      vote_count: 0,
      genre_ids: []
    } as Movie;
    
    updateSettings({
      ...settings,
      featuredMovie: movieData
    });
  };

  // Handle feature TV show
  const handleFeatureTVShow = (show: any) => {
    // Convert to proper TvShow type with as unknown first
    const showData = {
      id: show.id,
      name: show.name,
      poster_path: show.posterPath,
      backdrop_path: show.backdropPath,
      // Add other required TvShow properties with default values
      overview: '',
      first_air_date: '',
      vote_average: 0,
      vote_count: 0,
      genre_ids: []
    } as TvShow;
    
    updateSettings({
      ...settings,
      featuredTVShow: showData
    });
  };

  // Clear featured content
  const clearFeaturedMovie = () => {
    updateSettings({
      ...settings,
      featuredMovie: null
    });
  };

  const clearFeaturedTVShow = () => {
    updateSettings({
      ...settings,
      featuredTVShow: null
    });
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Content Settings</h1>

      {/* General Settings */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Manage general content settings for the website.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={siteName}
              onChange={handleSiteNameChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="enableTrending">Enable Trending Content</Label>
            <Switch
              id="enableTrending"
              checked={enableTrending}
              onCheckedChange={handleEnableTrendingChange}
            />
          </div>
           <div className="flex items-center justify-between">
            <Label htmlFor="enableCloudStream">Enable CloudStream Content</Label>
            <Switch
              id="enableCloudStream"
              checked={enableCloudStream}
              onCheckedChange={handleEnableCloudStreamChange}
            />
          </div>
          <Button onClick={handleSaveSettings} disabled={isUpdatingSettings}>
            {isUpdatingSettings ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Featured Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Featured Content</CardTitle>
          <CardDescription>Select featured movies and TV shows to showcase on the homepage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                type="search"
                placeholder="Search for movies or TV shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button type="submit" disabled={isLoadingSettings}>Search</Button>
          </form>

          {searchQuery && (
            <>
              {/* Search Results - Movies */}
              {searchResultsMovies.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Movie Results</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {searchResultsMovies.map((movie) => (
                      <div key={movie.id} className="relative">
                        <MovieCard item={movie} type="movie" />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute bottom-2 right-2"
                          onClick={() => handleFeatureMovie(movie)}
                        >
                          Feature Movie
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results - TV Shows */}
              {searchResultsTVShows.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">TV Show Results</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {searchResultsTVShows.map((show) => (
                      <div key={show.id} className="relative">
                        <MovieCard item={show} type="tv" />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute bottom-2 right-2"
                          onClick={() => handleFeatureTVShow(show)}
                        >
                          Feature TV Show
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {searchResultsMovies.length === 0 && searchResultsTVShows.length === 0 && (
                <p>No results found for "{searchQuery}".</p>
              )}
            </>
          )}

          {/* Current Featured Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredMovie && (
              <Card>
                <CardHeader>
                  <CardTitle>Featured Movie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <MovieCard item={featuredMovie} type="movie" />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute bottom-2 right-2"
                      onClick={clearFeaturedMovie}
                    >
                      Clear Movie
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {featuredTVShow && (
              <Card>
                <CardHeader>
                  <CardTitle>Featured TV Show</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <MovieCard item={featuredTVShow} type="tv" />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute bottom-2 right-2"
                      onClick={clearFeaturedTVShow}
                    >
                      Clear TV Show
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminContent;
