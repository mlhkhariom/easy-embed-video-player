
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MovieResponse, TvResponse, Movie, TvShow } from '../types';
import { 
  getTrendingMovies, 
  getPopularMovies, 
  getTopRatedMovies,
  getTrendingTvShows,
  getPopularTvShows,
  getIndianMovies,
  getIndianTVShows
} from '../services/tmdb';
import Navbar from '../components/Navbar';
import TrendingSlider from '../components/TrendingSlider';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import LiveTVSlider from '../components/LiveTVSlider';
import { Button } from '@/components/ui/button';
import { ArrowRight, Film, Tv, Globe, Play, PlayCircle } from 'lucide-react';

const Index = () => {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [trendingTvShows, setTrendingTvShows] = useState<TvShow[]>([]);
  const [popularTvShows, setPopularTvShows] = useState<TvShow[]>([]);
  const [indianMovies, setIndianMovies] = useState<Movie[]>([]);
  const [indianTvShows, setIndianTvShows] = useState<TvShow[]>([]);
  const [webSeries, setWebSeries] = useState<TvShow[]>([]);
  const [tvSerials, setTvSerials] = useState<TvShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFeatured, setCurrentFeatured] = useState<(Movie | TvShow) | null>(null);
  
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
          popularTvShowsRes,
          indianMoviesRes,
          indianTvShowsRes
        ] = await Promise.all([
          getTrendingMovies(),
          getPopularMovies(),
          getTopRatedMovies(),
          getTrendingTvShows(),
          getPopularTvShows(),
          getIndianMovies(),
          getIndianTVShows()
        ]);
        
        setTrendingMovies(trendingMoviesRes.results);
        setPopularMovies(popularMoviesRes.results);
        setTopRatedMovies(topRatedMoviesRes.results);
        setTrendingTvShows(trendingTvShowsRes.results);
        setPopularTvShows(popularTvShowsRes.results);
        setIndianMovies(indianMoviesRes.results);
        setIndianTvShows(indianTvShowsRes.results);
        
        // Separate Web Series and TV Serials
        // For this example, we'll distinguish based on network and episode count
        // Networks like Netflix, Prime Video, etc. are typically for web series
        const webSeriesNetworks = [213, 1024, 2739, 2552, 2, 3]; // IDs for Netflix, Prime, Disney+, etc.
        
        // Simple heuristic: shows with many episodes are likely TV serials
        setWebSeries(popularTvShowsRes.results.filter(show => 
          webSeriesNetworks.some(id => show.networks?.some(network => network.id === id)) || 
          (show.number_of_episodes < 100 && show.number_of_seasons < 10)
        ));
        
        setTvSerials(popularTvShowsRes.results.filter(show => 
          !webSeriesNetworks.some(id => show.networks?.some(network => network.id === id)) && 
          (show.number_of_episodes >= 100 || show.number_of_seasons >= 10)
        ));
        
        // Set a random featured content
        const allTop = [
          ...trendingMoviesRes.results.slice(0, 3),
          ...trendingTvShowsRes.results.slice(0, 3)
        ];
        setCurrentFeatured(allTop[Math.floor(Math.random() * allTop.length)]);
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
        {/* Auto-play Featured Content at Top */}
        {currentFeatured && (
          <motion.div 
            className="relative mb-10 overflow-hidden rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative aspect-video overflow-hidden">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(https://image.tmdb.org/t/p/original${currentFeatured.backdrop_path})`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-moviemate-background via-black/70 to-black/30"></div>
              </div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.7 }}
                >
                  <Button 
                    className="mb-4 h-20 w-20 rounded-full bg-moviemate-primary hover:bg-moviemate-primary/90"
                    onClick={() => {
                      const contentType = 'title' in currentFeatured ? 'movie' : 'tv';
                      const contentRoute = `/${contentType}/${currentFeatured.id}`;
                      window.location.href = contentRoute;
                    }}
                  >
                    <Play size={36} />
                  </Button>
                </motion.div>
                
                <motion.h2 
                  className="mb-2 max-w-2xl text-4xl font-bold"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.7 }}
                >
                  {'title' in currentFeatured ? currentFeatured.title : currentFeatured.name}
                </motion.h2>
                
                <motion.p 
                  className="mb-6 max-w-2xl text-gray-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.7 }}
                >
                  {currentFeatured.overview.slice(0, 150)}...
                </motion.p>
                
                <motion.div
                  className="flex gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.7 }}
                >
                  <Link to={'title' in currentFeatured ? `/movie/${currentFeatured.id}` : `/tv/${currentFeatured.id}`}>
                    <Button className="bg-moviemate-primary hover:bg-moviemate-primary/90">
                      <PlayCircle className="mr-2" size={18} />
                      Watch Now
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
        
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
            <Link to="/tv">
              <div className="group flex flex-col items-center gap-3 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-900/20 p-6 text-center backdrop-blur transition hover:from-blue-600/30 hover:to-blue-900/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/30 group-hover:bg-blue-600/50">
                  <Tv className="text-white" size={20} />
                </div>
                <span className="text-lg font-semibold text-white">Web Series</span>
              </div>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link to="/live-tv">
              <div className="group flex flex-col items-center gap-3 rounded-xl bg-gradient-to-br from-teal-600/20 to-teal-900/20 p-6 text-center backdrop-blur transition hover:from-teal-600/30 hover:to-teal-900/30">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-600/30 group-hover:bg-teal-600/50">
                  <Globe className="text-white" size={20} />
                </div>
                <span className="text-lg font-semibold text-white">Live TV</span>
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
          {/* Indian Movies */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Indian Movies</h2>
              <Link to="/genre/movie/hi" className="flex items-center gap-1 text-sm font-medium text-moviemate-primary hover:underline">
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
                {indianMovies.slice(0, 6).map((movie, index) => (
                  <motion.div key={movie.id} variants={itemVariants} custom={index}>
                    <MovieCard item={movie} type="movie" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>
          
          {/* Indian Web Series */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Indian Web Series</h2>
              <Link to="/genre/tv/hi" className="flex items-center gap-1 text-sm font-medium text-moviemate-primary hover:underline">
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
                {indianTvShows.slice(0, 6).map((show, index) => (
                  <motion.div key={show.id} variants={itemVariants} custom={index}>
                    <MovieCard item={show} type="tv" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>
          
          {/* Web Series (OTT) */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Web Series</h2>
              <Link to="/tv" className="flex items-center gap-1 text-sm font-medium text-moviemate-primary hover:underline">
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
                {webSeries.slice(0, 6).map((show, index) => (
                  <motion.div key={show.id} variants={itemVariants} custom={index}>
                    <MovieCard item={show} type="tv" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>
          
          {/* TV Serials */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">TV Serials</h2>
              <Link to="/tv-serials" className="flex items-center gap-1 text-sm font-medium text-moviemate-primary hover:underline">
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
                {tvSerials.slice(0, 6).map((show, index) => (
                  <motion.div key={show.id} variants={itemVariants} custom={index}>
                    <MovieCard item={show} type="tv" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>
          
          {/* Live TV Slider */}
          <LiveTVSlider />
          
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
          <p>© 2023 FreeCinema. All rights reserved.</p>
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
