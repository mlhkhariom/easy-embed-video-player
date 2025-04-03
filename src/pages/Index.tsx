
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getTrendingMovies,
  getTrendingTvShows,
  getIndianMovies,
  getIndianTVShows,
  getPopularMovies,
  getPopularTvShows
} from '../services/tmdb';
import Navbar from '../components/Navbar';
import TrendingSlider from '../components/TrendingSlider';
import MovieCard from '../components/MovieCard';
import { useAdmin } from '../contexts/AdminContext';
import { TvShow, Movie } from '../types';
import { Link } from 'react-router-dom';

const Index = () => {
  const { settings } = useAdmin();
  const [trendingItems, setTrendingItems] = useState<(Movie | TvShow)[]>([]);
  
  // Fetch trending movies and TV shows
  const { data: trendingMovies } = useQuery({
    queryKey: ['trending-movies'],
    queryFn: () => getTrendingMovies(),
    enabled: settings.enableTrending,
  });
  
  const { data: trendingTvShows } = useQuery({
    queryKey: ['trending-tv-shows'],
    queryFn: () => getTrendingTvShows(),
    enabled: settings.enableTrending,
  });
  
  // Fetch country-specific content
  const { data: indianMovies } = useQuery({
    queryKey: ['indian-movies'],
    queryFn: () => getIndianMovies(),
  });
  
  const { data: indianTvShows } = useQuery({
    queryKey: ['indian-tv-shows'],
    queryFn: () => getIndianTVShows(),
  });
  
  // Global popular content
  const { data: popularMovies } = useQuery({
    queryKey: ['popular-movies'],
    queryFn: () => getPopularMovies(),
  });
  
  const { data: popularTvShows } = useQuery({
    queryKey: ['popular-tv-shows'],
    queryFn: () => getPopularTvShows(),
  });
  
  // Combine trending movies and TV shows for slider
  useEffect(() => {
    if (settings.enableTrending && trendingMovies && trendingTvShows) {
      const movies = trendingMovies.results.slice(0, 4);
      const tvShows = trendingTvShows.results.slice(0, 4);
      
      // Combine and shuffle items
      const combined = [...movies, ...tvShows]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
      
      setTrendingItems(combined);
    }
  }, [trendingMovies, trendingTvShows, settings.enableTrending]);
  
  return (
    <div className="min-h-screen bg-moviemate-background text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 pt-24">
        {/* Trending slider */}
        {settings.enableTrending && trendingItems.length > 0 && (
          <div className="mb-12">
            <TrendingSlider items={trendingItems} title="Trending This Week" />
          </div>
        )}
        
        {/* Indian content section - adjust based on selectedCountry */}
        {settings.selectedCountry === 'in' && (
          <section className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Popular in India</h2>
              <Link to="/explore?region=in" className="text-moviemate-primary hover:underline">View All</Link>
            </div>
            
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {indianMovies?.results.slice(0, 6).map((movie) => (
                <MovieCard key={movie.id} item={movie} type="movie" />
              ))}
            </div>
            
            <div className="mt-8 mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Indian TV Shows</h2>
              <Link to="/explore?type=tv&region=in" className="text-moviemate-primary hover:underline">View All</Link>
            </div>
            
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {indianTvShows?.results.slice(0, 6).map((show) => (
                <MovieCard key={show.id} item={show} type="tv" />
              ))}
            </div>
          </section>
        )}
        
        {/* US content */}
        {settings.selectedCountry === 'us' && (
          <section className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Popular in US</h2>
              <Link to="/explore?region=us" className="text-moviemate-primary hover:underline">View All</Link>
            </div>
            
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {popularMovies?.results.slice(0, 6).map((movie) => (
                <MovieCard key={movie.id} item={movie} type="movie" />
              ))}
            </div>
          </section>
        )}
        
        {/* UK content */}
        {settings.selectedCountry === 'uk' && (
          <section className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Popular in UK</h2>
              <Link to="/explore?region=uk" className="text-moviemate-primary hover:underline">View All</Link>
            </div>
            
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {popularMovies?.results.slice(0, 6).map((movie) => (
                <MovieCard key={movie.id} item={movie} type="movie" />
              ))}
            </div>
          </section>
        )}
        
        {/* Global content for global selection */}
        {settings.selectedCountry === 'global' && (
          <>
            <section className="mb-12">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Popular Movies</h2>
                <Link to="/movies" className="text-moviemate-primary hover:underline">View All</Link>
              </div>
              
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {popularMovies?.results.slice(0, 6).map((movie) => (
                  <MovieCard key={movie.id} item={movie} type="movie" />
                ))}
              </div>
            </section>
            
            <section className="mb-12">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Popular TV Shows</h2>
                <Link to="/tv-serials" className="text-moviemate-primary hover:underline">View All</Link>
              </div>
              
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {popularTvShows?.results.slice(0, 6).map((show) => (
                  <MovieCard key={show.id} item={show} type="tv" />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
