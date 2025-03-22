
import React from 'react';
import { Badge } from './ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { Star, Calendar, Clock, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContentDetailsProps {
  title: string;
  overview: string;
  releaseDate?: string;
  runtime?: number;
  rating?: number;
  genres?: string[];
  type: 'movie' | 'tv';
}

const ContentDetails = ({
  title,
  overview,
  releaseDate,
  runtime,
  rating,
  genres,
  type
}: ContentDetailsProps) => {
  // Format release date
  const formattedDate = releaseDate 
    ? new Date(releaseDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A';

  // Format runtime
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <motion.div 
      className="content-details space-y-4 p-4 md:p-6 bg-card rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1 
        className="text-2xl md:text-3xl font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {title} <span className="text-muted-foreground font-normal text-lg">({type === 'movie' ? 'Movie' : 'TV Show'})</span>
      </motion.h1>
      
      <motion.div 
        className="flex flex-wrap gap-3 items-center text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {releaseDate && (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
        )}
        
        {runtime && runtime > 0 && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatRuntime(runtime)}</span>
          </div>
        )}
        
        {rating && rating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>{rating.toFixed(1)}/10</span>
          </div>
        )}
      </motion.div>
      
      {genres && genres.length > 0 && (
        <motion.div 
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Tag className="h-4 w-4" />
          {genres.map((genre, index) => (
            <HoverCard key={index}>
              <HoverCardTrigger>
                <Badge variant="outline" className="cursor-pointer transform transition-transform hover:scale-105">
                  {genre}
                </Badge>
              </HoverCardTrigger>
              <HoverCardContent className="w-48">
                <p className="text-sm">More {genre} content</p>
              </HoverCardContent>
            </HoverCard>
          ))}
        </motion.div>
      )}
      
      <motion.p 
        className="text-muted-foreground text-sm md:text-base leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {overview || 'No overview available.'}
      </motion.p>
    </motion.div>
  );
};

export default ContentDetails;
