
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTrendingMovies, getTrendingTV } from '../services/tmdb';
import { Movie, TvShow } from '../types';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import { motion } from 'framer-motion';
import { Bell, Home, Play, Heart, User, Star } from 'lucide-react';
import { getImageUrl } from '../services/tmdb';
import { useAdmin } from '../contexts/AdminContext';

const Index = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const { settings } = useAdmin();
  
  // Fetch trending movies
  const { data: trendingMovies, isLoading: isLoadingMovies } = useQuery({
    queryKey: ['trendingMovies'],
    queryFn: getTrendingMovies
  });
  
  // Fetch trending TV shows
  const { data: trendingTV, isLoading: isLoadingTV } = useQuery({
    queryKey: ['trendingTV'],
    queryFn: getTrendingTV
  });
  
  // Combine trending content
  const trendingContent = [
    ...(trendingMovies?.results || []).map(movie => ({ ...movie, type: 'movie' })),
    ...(trendingTV?.results || []).map(show => ({ ...show, type: 'tv' }))
  ].sort(() => Math.random() - 0.5).slice(0, 10);
  
  // Auto-slide effect
  useEffect(() => {
    if (trendingContent.length === 0) return;
    
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % trendingContent.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [trendingContent.length]);
  
  // Animation variants
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
      transition: { duration: 0.4 }
    }
  };
  
  const getUserName = () => {
    // This would be replaced with actual user data in a real app
    return "Guest";
  };
  
  const renderStars = (rating: number) => {
    const normalizedRating = rating / 2; // Convert to 5-star scale
    return (
      <div className="flex items-center">
        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        <span className="ml-1 text-lg font-bold text-white">{rating.toFixed(1)}</span>
      </div>
    );
  };
  
  return (
    <div className="flex min-h-screen flex-col bg-[#121218]">
      {/* Content */}
      <main className="flex-1 pb-20">
        {/* Top Section with Search and Profile */}
        <div className="relative px-5 pt-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              MOVIER
            </h1>
            <button className="rounded-full bg-gray-800/50 p-2">
              <Bell className="h-5 w-5 text-gray-300" />
            </button>
          </div>
          
          <motion.div 
            className="mt-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2 
              className="text-3xl font-bold text-white"
              variants={itemVariants}
            >
              Hello <span className="text-gray-400">{getUserName()}</span>
            </motion.h2>
            <motion.p 
              className="mt-1 text-gray-400"
              variants={itemVariants}
            >
              Let's Find Your Favorite Movie
            </motion.p>
            
            <motion.div 
              className="mt-6"
              variants={itemVariants}
            >
              <SearchBar minimal className="search-gradient rounded-full py-3 text-lg" />
            </motion.div>
          </motion.div>
        </div>
        
        {/* Trending Section */}
        <div className="mt-8 px-5">
          <h3 className="mb-5 text-2xl font-bold text-white">Trending Movies</h3>
          
          {isLoadingMovies || isLoadingTV ? (
            <div className="flex overflow-x-auto gap-4 pb-4">
              {[1, 2, 3].map((_, index) => (
                <div 
                  key={index} 
                  className="flex-shrink-0 h-72 w-56 rounded-3xl bg-gray-800/60 animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <div className="relative h-96 overflow-hidden">
              {trendingContent.map((item, index) => {
                const isMovie = 'title' in item;
                const title = isMovie ? (item as Movie).title : (item as TvShow).name;
                const posterPath = item.poster_path;
                const itemType = item.type || 'movie';
                const itemId = item.id;
                const subtitle = isMovie 
                  ? (item as Movie).release_date?.split('-')[0] || ''
                  : (item as TvShow).first_air_date?.split('-')[0] || '';
                  
                return (
                  <motion.div 
                    key={`${itemType}-${itemId}`}
                    className={`absolute inset-0 transition-opacity duration-500 ${activeSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    initial={false}
                    animate={{ 
                      opacity: activeSlide === index ? 1 : 0,
                      scale: activeSlide === index ? 1 : 0.9
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <Link to={`/${itemType}/${itemId}`}>
                      <div className="relative h-80 w-60 mx-auto overflow-hidden rounded-[32px] shadow-lg">
                        <img 
                          src={getImageUrl(posterPath, 'w500')}
                          alt={title}
                          className="h-full w-full object-cover"
                        />
                        
                        {/* Rating Badge */}
                        <div className="absolute top-4 right-4 flex items-center justify-center rounded-full bg-black/50 p-2 backdrop-blur">
                          {renderStars(item.vote_average || 0)}
                        </div>
                        
                        {/* Title Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4 pt-12">
                          <h4 className="text-xl font-bold text-white">{title}</h4>
                          <p className="text-gray-300">{subtitle}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
              
              {/* Slide Indicators */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1.5 pb-2">
                {trendingContent.map((_, index) => (
                  <button
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      activeSlide === index ? 'w-6 bg-white' : 'w-1.5 bg-gray-500'
                    }`}
                    onClick={() => setActiveSlide(index)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bottom-nav flex items-center justify-around p-3 z-50">
        <Link to="/" className="flex flex-col items-center text-white">
          <div className="rounded-full bg-white/10 p-2">
            <Home className="h-5 w-5" />
          </div>
          <span className="mt-1 text-xs">Home</span>
        </Link>
        
        <Link to="/trending" className="flex flex-col items-center text-gray-500 hover:text-white">
          <div className="rounded-full p-2">
            <Play className="h-5 w-5" />
          </div>
          <span className="mt-1 text-xs">Watch</span>
        </Link>
        
        <Link to="/watchlist" className="flex flex-col items-center text-gray-500 hover:text-white">
          <div className="rounded-full p-2">
            <Heart className="h-5 w-5" />
          </div>
          <span className="mt-1 text-xs">Saved</span>
        </Link>
        
        <Link to="/history" className="flex flex-col items-center text-gray-500 hover:text-white">
          <div className="rounded-full p-2">
            <User className="h-5 w-5" />
          </div>
          <span className="mt-1 text-xs">Profile</span>
        </Link>
      </nav>
    </div>
  );
};

export default Index;
