
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

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
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };
  
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
          <motion.div 
            className="animate-fade-in"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <TrendingSlider items={trendingContent} title="Featured Content" />
          </motion.div>
        )}
        
        {/* Quick Navigation */}
        <motion.div 
          className="my-10 grid grid-cols-2 gap-4 md:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Link to="/trending">
              <div className="group flex flex-col items-center gap-3 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-900/20 p-6 text-center backdrop-blur transition hover:from-purple-600/30 hover:to-purple-900/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/30 group-hover:bg-purple-600/50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                </div>
                <span className="text-lg font-semibold text-white">Trending</span>
              </div>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link to="/explore">
              <div className="group flex flex-col items-center gap-3 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-900/20 p-6 text-center backdrop-blur transition hover:from-blue-600/30 hover:to-blue-900/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/30 group-hover:bg-blue-600/50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                </div>
                <span className="text-lg font-semibold text-white">Explore</span>
              </div>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link to="/genres">
              <div className="group flex flex-col items-center gap-3 rounded-xl bg-gradient-to-br from-teal-600/20 to-teal-900/20 p-6 text-center backdrop-blur transition hover:from-teal-600/30 hover:to-teal-900/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-600/30 group-hover:bg-teal-600/50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <span className="text-lg font-semibold text-white">Genres</span>
              </div>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link to="/search">
              <div className="group flex flex-col items-center gap-3 rounded-xl bg-gradient-to-br from-pink-600/20 to-pink-900/20 p-6 text-center backdrop-blur transition hover:from-pink-600/30 hover:to-pink-900/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-600/30 group-hover:bg-pink-600/50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <span className="text-lg font-semibold text-white">Search</span>
              </div>
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Content Sections */}
        <div className="mt-12 space-y-12">
          {/* Popular Movies */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Popular Movies</h2>
              <Link to="/explore" className="flex items-center gap-1 text-sm font-medium text-moviemate-primary hover:underline">
                View All
                <ArrowRight size={16} />
              </Link>
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
              <motion.div 
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {popularMovies.slice(0, 6).map((movie, index) => (
                  <motion.div key={movie.id} variants={itemVariants} custom={index}>
                    <MovieCard item={movie} type="movie" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>
          
          {/* Top Rated Movies */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Top Rated Movies</h2>
              <Link to="/explore" className="flex items-center gap-1 text-sm font-medium text-moviemate-primary hover:underline">
                View All
                <ArrowRight size={16} />
              </Link>
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
              <motion.div 
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {topRatedMovies.slice(0, 6).map((movie, index) => (
                  <motion.div key={movie.id} variants={itemVariants} custom={index}>
                    <MovieCard item={movie} type="movie" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>
          
          {/* Popular TV Shows */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Popular TV Shows</h2>
              <Link to="/explore" className="flex items-center gap-1 text-sm font-medium text-moviemate-primary hover:underline">
                View All
                <ArrowRight size={16} />
              </Link>
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
              <motion.div 
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {popularTvShows.slice(0, 6).map((show, index) => (
                  <motion.div key={show.id} variants={itemVariants} custom={index}>
                    <MovieCard item={show} type="tv" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>
        </div>
        
        {/* CTA Section */}
        <motion.div 
          className="my-16 overflow-hidden rounded-xl bg-gradient-to-r from-moviemate-primary/20 to-purple-900/20 p-8 lg:p-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
            <div className="max-w-2xl">
              <h2 className="mb-3 text-2xl font-bold text-white lg:text-3xl">Discover, Watch, and Enjoy Your Favorite Content</h2>
              <p className="text-gray-300">Access thousands of movies and TV shows with our easy-to-use streaming platform. Start watching now!</p>
            </div>
            <Button className="bg-moviemate-primary px-6 py-6 text-base hover:bg-moviemate-primary/90">Start Watching</Button>
          </div>
        </motion.div>
        
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
