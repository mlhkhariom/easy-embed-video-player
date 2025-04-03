import { Movie, TvShow, SupportedCountry, ExternalIDs, CreditsResponse, TMDBResponse, Episode, Genre } from '@/types';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = process.env.REACT_APP_TMDB_API_URL || 'https://api.themoviedb.org/3';

// Helper function to get image URL
export const getImageUrl = (path: string | null, size: string = 'original'): string => {
  if (!path) return '/placeholder.svg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

// Indian Movies and TV Shows
export const getIndianMovies = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&page=${page}&with_original_language=hi`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getIndianTVShows = async (page = 1): Promise<TMDBResponse<TvShow>> => {
  const response = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&page=${page}&with_original_language=hi`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

// Search Multi (for searching movies, TV shows, and people)
export const searchMulti = async (query: string, page = 1): Promise<TMDBResponse<Movie | TvShow>> => {
  const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

// Generic fetch API function
export const fetchApi = async (endpoint: string, params: Record<string, string> = {}): Promise<any> => {
  const queryParams = new URLSearchParams({
    api_key: API_KEY,
    language: 'en-US',
    ...params,
  }).toString();

  const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

// Web Series functions
export const getWebSeries = async (page = 1): Promise<TMDBResponse<TvShow>> => {
  const response = await fetch(
    `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&page=${page}&with_genres=10759,10765&without_genres=16,10762`
  );
  
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  
  return response.json();
};

export const isWebSeries = (genre_ids: number[]): boolean => {
  // Web series typically have action/adventure (10759) or sci-fi/fantasy (10765) genres
  // and exclude animation (16) and kids (10762)
  return (
    (genre_ids.includes(10759) || genre_ids.includes(10765)) && 
    !genre_ids.includes(16) && 
    !genre_ids.includes(10762)
  );
};

export const getTrendingMovies = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const response = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getPopularMovies = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getTopRatedMovies = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const response = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getUpcomingMovies = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const response = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getMovieDetails = async (movieId: number): Promise<Movie> => {
  const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getMovieExternalIds = async (movieId: number): Promise<ExternalIDs> => {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/external_ids?api_key=${API_KEY}`);
     if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }
    return response.json();
};

export const getRelatedMovies = async (movieId: number, page: number = 1): Promise<TMDBResponse<Movie>> => {
  const response = await fetch(`${BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}&language=en-US&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getTrendingTvShows = async (page = 1): Promise<TMDBResponse<TvShow>> => {
  const response = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getPopularTvShows = async (page = 1): Promise<TMDBResponse<TvShow>> => {
  const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getTopRatedTvShows = async (page = 1): Promise<TMDBResponse<TvShow>> => {
  const response = await fetch(`${BASE_URL}/tv/top_rated?api_key=${API_KEY}&language=en-US&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getTvShowDetails = async (tvId: number): Promise<TvShow> => {
  const response = await fetch(`${BASE_URL}/tv/${tvId}?api_key=${API_KEY}&language=en-US`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getTvShowCredits = async (tvId: number): Promise<CreditsResponse> => {
  const response = await fetch(`${BASE_URL}/tv/${tvId}/credits?api_key=${API_KEY}&language=en-US`);
   if (!response.ok) {
       throw new Error(`API request failed with status ${response.status}`);
   }
   return response.json();
};

export const getTvExternalIds = async (tvId: number): Promise<ExternalIDs> => {
    const response = await fetch(`${BASE_URL}/tv/${tvId}/external_ids?api_key=${API_KEY}`);
     if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }
    return response.json();
};

export const getSeasonDetails = async (tvId: number, seasonNumber: number): Promise<{ id: number; episodes: Episode[] }> => {
  const response = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}&language=en-US`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getRelatedTvShows = async (tvId: number, page: number = 1): Promise<TMDBResponse<TvShow>> => {
  const response = await fetch(`${BASE_URL}/tv/${tvId}/recommendations?api_key=${API_KEY}&language=en-US&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const searchMovies = async (query: string, page: number = 1): Promise<TMDBResponse<Movie>> => {
  const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${query}&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const searchTvShows = async (query: string, page: number = 1): Promise<TMDBResponse<TvShow>> => {
  const response = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&language=en-US&query=${query}&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getGenres = async (): Promise<{ genres: Genre[] }> => {
  const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getMoviesByGenre = async (genreId: number, page: number = 1): Promise<TMDBResponse<Movie>> => {
  const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&with_genres=${genreId}&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getTvShowsByGenre = async (genreId: number, page: number = 1): Promise<TMDBResponse<TvShow>> => {
  const response = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&with_genres=${genreId}&page=${page}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getContentByCountry = async (
  country: string = 'global', 
  type: 'movie' | 'tv' = 'movie', 
  page: number = 1
): Promise<TMDBResponse<any>> => {
  let url = '';
  const region = country === 'global' ? '' : `&region=${country.toUpperCase()}`;
  
  if (type === 'movie') {
    url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&page=${page}${region}&with_original_language=${getLanguageByCountry(country)}`;
  } else {
    url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&page=${page}${region}&with_original_language=${getLanguageByCountry(country)}`;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  
  return response.json();
};

// Helper function to get language code by country
function getLanguageByCountry(country: string): string {
  switch (country) {
    case 'in':
      return 'hi';
    case 'uk':
      return 'en';
    case 'us':
      return 'en';
    default:
      return 'en';
  }
}
