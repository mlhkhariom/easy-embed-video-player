
import { useState, useEffect } from 'react';
import { MovieResponse, TvResponse, Movie, TvShow } from '../types';
import { 
  getTrendingMovies, 
  getPopularMovies, 
  getTopRatedMovies,
  getTrendingTvShows,
  getPopularTvShows
} from '../services/tmdb';
import Navbar from '../components/Navbar';
import TrendingSlider from '../components/TrendingSlider';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';

const Index = () => {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [trendingTvShows, setTrendingTvShows] = useState<TvShow[]>([]);
  const [popularTvShows, setPopularTvShows] = useState<TvShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all data in parallel
        const [
          trendingMoviesRes,
          popularMoviesRes,
          topRatedMoviesRes,
          trendingTvShowsRes,
          popularTvShowsRes
        ] = await Promise.all([
          getTrendingMovies(),
          getPopularMovies(),
          getTopRatedMovies(),
          getTrendingTvShows(),
          getPopularTvShows()
        ]);
        
        setTrendingMovies(trendingMoviesRes.results);
        setPopularMovies(popularMoviesRes.results);
        setTopRatedMovies(topRatedMoviesRes.results);
        setTrendingTvShows(trendingTvShowsRes.results);
        setPopularTvShows(popularTvShowsRes.results);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Combine trending movies and TV shows for the main slider
  const trendingContent = [...trendingMovies.slice(0, 5), ...trendingTvShows.slice(0, 5)];
  
  return (
    <div className="min-h-screen bg-moviemate-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-16">
        {/* Hero Search Section for Mobile */}
        <div className="mb-8 flex flex-col gap-4 rounded-xl bg-moviemate-card p-6 md:hidden">
          <h1 className="text-2xl font-bold text-white">Find your favorite movies and TV shows</h1>
          <SearchBar minimal className="w-full" />
        </div>
        
        {/* Featured Content Slider */}
        {isLoading ? (
          <div className="animate-pulse rounded-xl bg-moviemate-card">
            <div className="aspect-[16/9] w-full"></div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <TrendingSlider items={trendingContent} />
          </div>
        )}
        
        {/* Content Sections */}
        <div className="mt-12 space-y-12">
          {/* Popular Movies */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Popular Movies</h2>
              <a href="/movies" className="text-sm font-medium text-moviemate-primary hover:underline">
                View All
              </a>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-lg bg-moviemate-card">
                    <div className="aspect-[2/3]"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {popularMovies.slice(0, 6).map((movie) => (
                  <MovieCard key={movie.id} item={movie} type="movie" className="animate-slide-up" />
                ))}
              </div>
            )}
          </section>
          
          {/* Top Rated Movies */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Top Rated Movies</h2>
              <a href="/movies" className="text-sm font-medium text-moviemate-primary hover:underline">
                View All
              </a>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-lg bg-moviemate-card">
                    <div className="aspect-[2/3]"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {topRatedMovies.slice(0, 6).map((movie) => (
                  <MovieCard key={movie.id} item={movie} type="movie" className="animate-slide-up" />
                ))}
              </div>
            )}
          </section>
          
          {/* Popular TV Shows */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Popular TV Shows</h2>
              <a href="/tv" className="text-sm font-medium text-moviemate-primary hover:underline">
                View All
              </a>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-lg bg-moviemate-card">
                    <div className="aspect-[2/3]"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {popularTvShows.slice(0, 6).map((show) => (
                  <MovieCard key={show.id} item={show} type="tv" className="animate-slide-up" />
                ))}
              </div>
            )}
          </section>
        </div>
        
        {/* Footer */}
        <footer className="mt-16 py-8 text-center text-sm text-gray-500">
          <p>© 2023 MovieMate. All rights reserved.</p>
          <p className="mt-2">
            Powered by{' '}
            <a 
              href="https://www.themoviedb.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-moviemate-primary hover:underline"
            >
              TMDB
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
