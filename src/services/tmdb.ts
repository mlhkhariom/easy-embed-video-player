import { MovieResponse, TvResponse, Movie, TvShow, Credits, Episode, Season } from '../types';
import { safeFetch, handleAPIError, APIError } from './error-handler';

const API_KEY = '43d89010b257341339737be36dfaac13';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const getImageUrl = (path: string | null, size: string = 'w500'): string => {
  if (!path) return '/placeholder.svg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const fetchApi = async <T>(endpoint: string, retryCount = 3): Promise<T> => {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const response = await safeFetch(url, { 
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      throw new APIError(`TMDB API Error: ${response.status}`, response.status);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError' && retryCount > 0) {
      console.log(`Request timed out, retrying... (${retryCount} attempts left)`);
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchApi(endpoint, retryCount - 1);
    }
    throw handleAPIError(error);
  }
};

// Movies
export const getTrendingMovies = (): Promise<MovieResponse> => {
  return fetchApi<MovieResponse>(`/trending/movie/day?api_key=${API_KEY}&language=en-US`);
};

export const getPopularMovies = (): Promise<MovieResponse> => {
  return fetchApi<MovieResponse>(`/movie/popular?api_key=${API_KEY}&language=en-US`);
};

export const getTopRatedMovies = (): Promise<MovieResponse> => {
  return fetchApi<MovieResponse>(`/movie/top_rated?api_key=${API_KEY}&language=en-US`);
};

export const getMovieDetails = (id: number): Promise<Movie> => {
  return fetchApi<Movie>(`/movie/${id}?api_key=${API_KEY}&language=en-US&append_to_response=videos,images,credits`);
};

export const getMovieCredits = (id: number): Promise<Credits> => {
  return fetchApi<Credits>(`/movie/${id}/credits?api_key=${API_KEY}&language=en-US`);
};

// TV Shows
export const getTrendingTvShows = (): Promise<TvResponse> => {
  return fetchApi<TvResponse>(`/trending/tv/day?api_key=${API_KEY}&language=en-US`);
};

export const getPopularTvShows = (): Promise<TvResponse> => {
  return fetchApi<TvResponse>(`/tv/popular?api_key=${API_KEY}&language=en-US`);
};

export const getTopRatedTvShows = (): Promise<TvResponse> => {
  return fetchApi<TvResponse>(`/tv/top_rated?api_key=${API_KEY}&language=en-US`);
};

export const getTvShowDetails = (id: number): Promise<TvShow> => {
  return fetchApi<TvShow>(`/tv/${id}?api_key=${API_KEY}&language=en-US&append_to_response=videos,images,credits`);
};

export const getTvShowCredits = (id: number): Promise<Credits> => {
  return fetchApi<Credits>(`/tv/${id}/credits?api_key=${API_KEY}&language=en-US`);
};

export const getSeasonDetails = (tvId: number, seasonNumber: number): Promise<Season> => {
  return fetchApi<Season>(`/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}&language=en-US`);
};

export const getEpisodeDetails = (
  tvId: number, 
  seasonNumber: number, 
  episodeNumber: number
): Promise<Episode> => {
  return fetchApi<Episode>(
    `/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${API_KEY}&language=en-US`
  );
};

// Related content
export const getRelatedMovies = (id: number, page: number = 1): Promise<MovieResponse> => {
  return fetchApi<MovieResponse>(
    `/movie/${id}/recommendations?api_key=${API_KEY}&language=en-US&page=${page}`
  );
};

export const getRelatedTvShows = (id: number, page: number = 1): Promise<TvResponse> => {
  return fetchApi<TvResponse>(
    `/tv/${id}/recommendations?api_key=${API_KEY}&language=en-US&page=${page}`
  );
};

// Search
interface MultiSearchResponse {
  page: number;
  results: (Movie | TvShow)[];
  total_pages: number;
  total_results: number;
}

export const searchMulti = (query: string, page: number = 1): Promise<MultiSearchResponse> => {
  return fetchApi<MultiSearchResponse>(
    `/search/multi?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`
  );
};

// Get Indian content
export const getIndianMovies = (): Promise<MovieResponse> => {
  return fetchApi<MovieResponse>(
    `/discover/movie?api_key=${API_KEY}&with_original_language=hi&region=IN&sort_by=popularity.desc&with_watch_providers=&watch_region=IN`
  ).then(response => {
    if (response?.results) {
      response.results = response.results.map(movie => ({
        ...movie,
        show_type: 'movie'
      }));
    }
    return response;
  });
};

export const getIndianTVShows = (): Promise<TvResponse> => {
  return fetchApi<TvResponse>(
    `/discover/tv?api_key=${API_KEY}&with_original_language=hi&region=IN&sort_by=popularity.desc`
  ).then(response => {
    if (response?.results) {
      response.results = response.results.map(show => {
        if (!show.show_type) {
          if ((!show.number_of_seasons || show.number_of_seasons < 5) && 
              (!show.number_of_episodes || show.number_of_episodes < 50) &&
              show.vote_average >= 6.5) {
            show.show_type = 'web_series';
          } 
          else if ((show.number_of_episodes > 50 || show.number_of_seasons >= 5)) {
            show.show_type = 'tv_serial';
          }
          else {
            show.show_type = show.vote_average >= 7.0 ? 'web_series' : 'tv_serial';
          }
        }
        
        if (!show.languages) {
          show.languages = ['hi'];
        }
        
        if (!show.original_language) {
          show.original_language = 'hi';
        }
        
        return show;
      });
    }
    return response;
  });
};

// Get external IDs (for IMDB ID)
export const getMovieExternalIds = async (id: number): Promise<{ imdb_id: string }> => {
  return fetchApi<{ imdb_id: string }>(`/movie/${id}/external_ids?api_key=${API_KEY}`);
};

export const getTvExternalIds = async (id: number): Promise<{ imdb_id: string }> => {
  return fetchApi<{ imdb_id: string }>(`/tv/${id}/external_ids?api_key=${API_KEY}`);
};

// Cache API responses
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export const getCachedApi = async <T>(endpoint: string, forceFresh = false): Promise<T> => {
  const cacheKey = endpoint;
  
  if (!forceFresh && cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey)!;
    const now = Date.now();
    
    if (now - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data as T;
    }
  }
  
  const data = await fetchApi<T>(endpoint);
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  return data;
};

// Rate limiting and error handling
let lastRequestTime = 0;
const REQUEST_INTERVAL = 100; // 100ms between requests

export const rateControlledFetch = async <T>(endpoint: string): Promise<T> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, REQUEST_INTERVAL - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
  return fetchApi<T>(endpoint);
};

// Error handling and retry logic
export const fetchWithRetry = async <T>(
  endpoint: string, 
  retries: number = 3
): Promise<T> => {
  try {
    return await fetchApi<T>(endpoint);
  } catch (error) {
    if (retries <= 0) throw error;
    
    if (error instanceof APIError && error.status === 429) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return fetchWithRetry(endpoint, retries - 1);
    } else if (error instanceof APIError && (error.status === 500 || error.status === 503)) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(endpoint, retries - 1);
    }
    
    throw error;
  }
};

// Enhanced function to get web series specifically
export const getWebSeries = async (page = 1): Promise<{
  page: number;
  results: TvShow[];
  total_pages: number;
  total_results: number;
}> => {
  try {
    const response = await fetchApi<TvResponse>(
      `/discover/tv?api_key=${API_KEY}&language=en-US&with_original_language=hi|en&sort_by=popularity.desc&vote_average.gte=7.0&with_type=4&page=${page}&with_runtime.lte=60&with_status=Ended|Canceled|Returning Series`
    );
    
    const webSeriesResults = response.results.filter(show => {
      return isWebSeries(show);
    });
    
    return {
      ...response,
      results: webSeriesResults.map(show => ({
        ...show,
        show_type: 'web_series'
      }))
    };
  } catch (error) {
    console.error('Error fetching web series:', error);
    throw handleAPIError(error);
  }
};

// Comprehensive helper function to identify web series with stronger certainty
export const isWebSeries = (show: TvShow): boolean => {
  if (show.show_type === 'web_series') return true;
  if (show.show_type === 'tv_serial') return false;
  
  const streamingPlatforms = [
    'netflix', 'prime', 'amazon', 'hotstar', 'disney+', 'hulu', 
    'hbo max', 'zee5', 'alt balaji', 'sony liv', 'voot', 'mx player',
    'apple tv', 'peacock', 'paramount+', 'discovery+', 'crunchyroll'
  ];
  
  const isStreamingPlatformMentioned = streamingPlatforms.some(platform => 
    (show.overview?.toLowerCase().includes(platform) || 
    show.name?.toLowerCase().includes(platform))
  );
  
  const hasOTTPlatform = show.networks?.some(network => 
    streamingPlatforms.some(platform => 
      network.name?.toLowerCase().includes(platform)
    )
  );
  
  const isLimitedSeries = 
    (show.number_of_seasons <= 4 && show.number_of_seasons > 0) ||
    (show.number_of_episodes > 0 && show.number_of_episodes < 60);
    
  const hasHighRating = show.vote_average >= 7.0;
    
  const isNewProduction = show.first_air_date && 
    parseInt(show.first_air_date.substring(0, 4)) >= 2013;
  
  const webSeriesKeywords = ['web series', 'streaming', 'original series', 'limited series', 'anthology'];
  const hasWebSeriesKeywords = false;
  
  let score = 0;
  
  if (isStreamingPlatformMentioned) score += 3;
  if (hasOTTPlatform) score += 3;
  if (isLimitedSeries) score += 2;
  if (hasHighRating) score += 1;
  if (isNewProduction) score += 2;
  if (hasWebSeriesKeywords) score += 3;
  
  if (show.number_of_episodes > 100) score -= 3;
  if (show.number_of_seasons > 7) score -= 3;
  
  return score >= 4;
};
