import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTrendingMovies, getTrendingTV } from '../services/tmdb';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from 'react-router-dom';
import { Movie, TvShow } from '../types';
import { Film, Tv, Loader } from 'lucide-react';
import { motion } from "framer-motion";

const Trending = () => {
  const [activeTab, setActiveTab] = useState('movies');
  const [isLoading, setIsLoading] = useState(true);

  const { data: trendingMovies, error: trendingMoviesError } = useQuery({
    queryKey: ['trending-movies'],
    queryFn: getTrendingMovies,
  });

  const { data: trendingTV, error: trendingTVError } = useQuery({
    queryKey: ['trending-tv'],
    queryFn: getTrendingTV,
  });

  useEffect(() => {
    if (trendingMovies && trendingTV) {
      setIsLoading(false);
    }
  }, [trendingMovies, trendingTV]);

  const hasError = trendingMoviesError || trendingTVError;

  const movies = trendingMovies?.results as Movie[];
  const tvShows = trendingTV?.results as TvShow[];

  return (
    <div className="min-h-screen bg-moviemate-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 pt-24">
        <h1 className="mb-8 text-3xl font-bold text-white">Trending</h1>

        {hasError && (
          <div className="rounded-lg bg-red-500/10 p-4 text-center">
            <p className="text-red-300">Error fetching trending content</p>
          </div>
        )}

        <Tabs defaultValue="movies" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="movies">
              <Film className="mr-1 h-4 w-4" />
              Movies ({trendingMovies?.results?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="tv">
              <Tv className="mr-1 h-4 w-4" />
              TV Shows ({trendingTV?.results?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="movies" className="mt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader className="h-8 w-8 animate-spin text-moviemate-primary" />
              </div>
            ) : movies?.length ? (
              <motion.div
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.05 }}
              >
                {movies.map((movie) => (
                  <MovieCard key={movie.id} item={movie} type="movie" />
                ))}
              </motion.div>
            ) : (
              <div className="rounded-lg bg-moviemate-card p-8 text-center">
                <p className="text-xl text-gray-400">No trending movies found</p>
                <Link to="/movies" className="mt-4 text-moviemate-primary hover:underline">
                  Browse Movies
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tv" className="mt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader className="h-8 w-8 animate-spin text-moviemate-primary" />
              </div>
            ) : tvShows?.length ? (
              <motion.div
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.05 }}
              >
                {tvShows.map((tvShow) => (
                  <MovieCard key={tvShow.id} item={tvShow} type="tv" />
                ))}
              </motion.div>
            ) : (
              <div className="rounded-lg bg-moviemate-card p-8 text-center">
                <p className="text-xl text-gray-400">No trending TV shows found</p>
                <Link to="/tv-serials" className="mt-4 text-moviemate-primary hover:underline">
                  Browse TV Shows
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Trending;
