
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Movie, TvShow } from '../types';
import { getImageUrl } from '../services/tmdb';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface MovieCardProps {
  item?: Movie | TvShow;
  type?: 'movie' | 'tv';
  movieId?: number;
  title?: string;
  posterPath?: string | null;
  rating?: number;
  mediaType?: 'movie' | 'tv';
  className?: string;
}

const MovieCard = ({ 
  item, 
  type, 
  movieId, 
  title: propTitle, 
  posterPath: propPosterPath, 
  rating: propRating,
  mediaType,
  className = '' 
}: MovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();
  
  // Determine if we're using props or item object
  const isUsingProps = !!movieId;
  
  // If using item prop, extract values from it
  const isMovie = item ? 'title' in item : mediaType === 'movie';
  const title = propTitle || (isMovie && item ? (item as Movie).title : item ? (item as TvShow).name : '');
  const posterPath = propPosterPath || (item ? item.poster_path : null);
  const rating = propRating || (item ? item.vote_average : 0);
  const releaseDate = item ? (isMovie ? (item as Movie).release_date : (item as TvShow).first_air_date) : '';
  
  // Format the release date to year only
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  
  // Create a link path based on the type or mediaType
  const linkPath = isUsingProps 
    ? `/${mediaType}/${movieId}`
    : `/${type}/${item?.id}`;

  return (
    <motion.div 
      className={`movie-card relative overflow-hidden rounded-xl ${className}`}
      whileHover={{ 
        scale: isMobile ? 1.02 : 1.05,
        transition: { duration: 0.3 }
      }}
      whileTap={isMobile ? { scale: 0.98 } : undefined}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link to={linkPath}>
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-moviemate-card shadow-lg">
          <motion.div 
            className={`absolute inset-0 ${imageLoaded ? 'image-loaded' : 'image-loading'}`}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: isHovered ? 5 : 0 }}
            transition={{ duration: 0.5 }}
            style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
          >
            <img
              src={getImageUrl(posterPath, 'w500')}
              alt={title}
              className="h-full w-full object-cover rounded-xl"
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
          </motion.div>
          
          {/* Enhanced 3D lighting effect */}
          {isHovered && (
            <motion.div 
              className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
          
          {/* Improved glass effect card info */}
          <motion.div 
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 sm:p-4 pt-6 sm:pt-12 backdrop-blur-sm rounded-b-xl"
            animate={{ 
              y: isHovered ? 0 : 10,
              opacity: isHovered ? 1 : 0.8
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-1 sm:space-y-2">
              <h3 className="line-clamp-1 text-xs sm:text-sm font-medium text-white">{title}</h3>
              {year && (
                <p className="text-[10px] sm:text-xs text-gray-300">{year}</p>
              )}
              <div className="flex items-center">
                <div className="flex items-center gap-1 bg-yellow-500/20 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                  <span className="text-[10px] sm:text-xs font-medium text-yellow-400">{rating?.toFixed(1)}</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="10" 
                    height="10" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                    className="text-yellow-400"
                  >
                    <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z"/>
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Enhanced 3D shadow effect */}
        <motion.div 
          className="absolute -bottom-2 left-0 right-0 h-6 blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.6 : 0 }}
          style={{
            background: 'linear-gradient(to bottom, rgba(139, 92, 246, 0.4), transparent)',
            transformOrigin: 'center bottom',
            borderRadius: '50%'
          }}
        />
      </Link>
    </motion.div>
  );
};

export default MovieCard;
