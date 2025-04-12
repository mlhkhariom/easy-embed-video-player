
import { Movie, TvShow } from '../../types';
import { getImageUrl } from '../../services/tmdb';
import { motion } from 'framer-motion';
import { Play, Plus } from 'lucide-react';

interface ContentHeaderProps {
  content: Movie | TvShow;
  type: 'movie' | 'tv';
  title: string;
  formattedDate: string;
  formattedRuntime: string;
  rating: string;
  showPlayer: boolean;
  setShowPlayer: (show: boolean) => void;
}

const ContentHeader = ({ 
  content, 
  type, 
  title, 
  formattedDate, 
  formattedRuntime, 
  rating,
  showPlayer,
  setShowPlayer
}: ContentHeaderProps) => {
  const isMovie = type === 'movie';
  
  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl">
      <div className="absolute inset-0">
        <img 
          src={getImageUrl(content.backdrop_path, 'original')}
          alt={title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-moviemate-background via-moviemate-background/90 to-transparent"></div>
      </div>
      
      <div className="relative z-10 flex flex-col gap-8 px-4 py-12 md:flex-row lg:px-8 lg:py-16">
        {/* Poster with enhanced animations */}
        <motion.div 
          className="flex-shrink-0"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative aspect-[2/3] w-48 overflow-hidden rounded-xl bg-moviemate-card shadow-2xl md:w-64 lg:w-72 border border-white/10">
            <img 
              src={getImageUrl(content.poster_path, 'w500')}
              alt={title}
              className="h-full w-full object-cover"
            />
            
            {/* Poster overlay glow effect */}
            <div className="absolute inset-0 bg-gradient-to-tl from-moviemate-primary/10 to-transparent opacity-60"></div>
            
            {/* Reflection effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-30" 
                 style={{ clipPath: 'polygon(0 0, 100% 0, 100% 20%, 0 40%)' }}></div>
          </div>
        </motion.div>
        
        {/* Content Details with enhanced animations */}
        <motion.div 
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">{title}</h1>
          
          <div className="flex flex-wrap items-center gap-3">
            {formattedDate && (
              <span className="rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm text-gray-300 border border-white/5">
                {formattedDate}
              </span>
            )}
            
            {formattedRuntime && (
              <span className="rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm text-gray-300 border border-white/5">
                {formattedRuntime}
              </span>
            )}
            
            {!isMovie && (
              <span className="rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm text-gray-300 border border-white/5">
                {(content as TvShow).number_of_seasons} Seasons
              </span>
            )}
            
            <div className="flex items-center gap-1 rounded-full bg-yellow-400 px-4 py-1.5 text-sm font-bold text-black shadow-lg shadow-yellow-400/20">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z"/>
              </svg>
              {rating}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {content.genres?.map((genre) => (
              <span 
                key={genre.id}
                className="rounded-full bg-moviemate-primary/30 border border-moviemate-primary/20 px-3 py-1.5 text-xs font-medium text-white shadow-sm shadow-moviemate-primary/20"
              >
                {genre.name}
              </span>
            ))}
          </div>
          
          <p className="max-w-3xl text-gray-300 leading-relaxed">{content.overview}</p>
          
          <div className="mt-6 flex flex-wrap gap-4">
            <motion.button
              onClick={() => setShowPlayer(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full bg-gradient-to-r from-moviemate-primary to-purple-600 px-6 py-3 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-moviemate-primary/30 flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Watch Now
            </motion.button>
            
            <motion.button
              onClick={() => setShowPlayer(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full border border-gray-700 bg-white/5 backdrop-blur-sm px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add to Watchlist
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContentHeader;
