
  // Fetch settings
  const { isLoading: isLoadingSettings, error: errorSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    meta: {
      onSuccess: (data: any) => {
        if (data) {
          setSiteName(data?.siteName || '');
          setEnableTrending(data?.enableTrending || false);
          setEnableCloudStream(data?.enableCloudStream || false);
          updateAdminSettings(data);
          
          // Convert featured content to Movie/TvShow format if available
          if (data?.featuredContent?.movie) {
            const movieData = data.featuredContent.movie;
            setFeaturedMovie({
              id: movieData.id,
              title: movieData.title,
              poster_path: movieData.posterPath,
              backdrop_path: movieData.backdropPath,
              release_date: '',
              overview: '',
              vote_average: 0,
              vote_count: 0,
              popularity: 0,
              adult: false
            });
          }
          
          if (data?.featuredContent?.tvShow) {
            const tvData = data.featuredContent.tvShow;
            setFeaturedTVShow({
              id: tvData.id,
              name: tvData.name,
              poster_path: tvData.posterPath,
              backdrop_path: tvData.backdropPath,
              first_air_date: '',
              overview: '',
              vote_average: 0,
              vote_count: 0,
              popularity: 0,
              number_of_seasons: 0,
              number_of_episodes: 0
            });
          }
        }
      }
    }
  });
