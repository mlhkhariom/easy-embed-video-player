
import { MovieResponse, TvResponse, Movie, TvShow, Credits, Episode, Season } from '../types';

const API_KEY = '43d89010b257341339737be36dfaac13';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const getImageUrl = (path: string | null, size: string = 'w500'): string => {
  if (!path) return '/placeholder.svg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const fetchApi = async <T>(endpoint: string): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json() as Promise<T>;
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

// Search
interface MultiSearchResponse {
  page: number;
  results: (Movie | TvShow)[];
  total_pages: number;
  total_results: number;
}

export const searchMulti = (query: string): Promise<MultiSearchResponse> => {
  return fetchApi<MultiSearchResponse>(
    `/search/multi?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`
  );
};

// Get external IDs (for IMDB ID)
export const getMovieExternalIds = async (id: number): Promise<{ imdb_id: string }> => {
  return fetchApi<{ imdb_id: string }>(`/movie/${id}/external_ids?api_key=${API_KEY}`);
};

export const getTvExternalIds = async (id: number): Promise<{ imdb_id: string }> => {
  return fetchApi<{ imdb_id: string }>(`/tv/${id}/external_ids?api_key=${API_KEY}`);
};
