
import { useState, useEffect } from 'react';
import { getTrendingMovies, getTrendingTvShows } from '../services/tmdb';
import { Movie, TvShow } from '../types';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Trending = () => {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingTvShows, setTrendingTvShows] = useState<TvShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch trending data in parallel
        const [trendingMoviesRes, trendingTvShowsRes] = await Promise.all([
          getTrendingMovies(),
          getTrendingTvShows()
        ]);
        
        setTrendingMovies(trendingMoviesRes.results);
        setTrendingTvShows(trendingTvShowsRes.results);
        
        toast({
          title: "Content loaded",
          description: "Trending content has been updated",
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load trending content",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Combine and sort all content by popularity (vote_count * vote_average)
  const allContent = [...trendingMovies, ...trendingTvShows].sort((a, b) => 
    (b.vote_count * b.vote_average) - (a.vote_count * a.vote_average)
  );
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  const getDisplayContent = () => {
    switch (activeTab) {
      case 'movies':
        return trendingMovies;
      case 'tvshows':
        return trendingTvShows;
      default:
        return allContent;
    }
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 50 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-moviemate-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-white md:text-4xl">Trending Now</h1>
          <p className="text-gray-400">Discover what's popular across movies and TV shows</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-3 bg-moviemate-card">
            <TabsTrigger value="all" className="text-base">All</TabsTrigger>
            <TabsTrigger value="movies" className="text-base">Movies</TabsTrigger>
            <TabsTrigger value="tvshows" className="text-base">TV Shows</TabsTrigger>
          </TabsList>
          
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-lg bg-moviemate-card">
                    <div className="aspect-[2/3]"></div>
                  </div>
                ))}
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                variants={container}
                initial="hidden"
                animate="show"
                key={activeTab}
              >
                {getDisplayContent().map((item, index) => (
                  <motion.div key={item.id} variants={item} custom={index}>
                    <MovieCard 
                      item={item} 
                      type={'title' in item ? 'movie' : 'tv'} 
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
      </main>
    </div>
  );
};

export default Trending;
