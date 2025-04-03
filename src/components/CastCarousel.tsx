
import React from 'react';
import { Cast } from '../types';
import { getImageUrl } from '../services/tmdb';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CastCarouselProps {
  cast: Cast[];
  title: string;
}

const CastCarousel: React.FC<CastCarouselProps> = ({ cast, title }) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (!cast || cast.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 relative">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      
      <div className="relative group">
        <button 
          onClick={handleScrollLeft} 
          className="absolute left-0 top-1/2 z-10 transform -translate-y-1/2 h-10 w-10 
                    bg-black/50 rounded-full flex items-center justify-center 
                    opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft className="text-white" />
        </button>
        
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto pb-4 pt-2 hide-scrollbar snap-x gap-4"
          style={{ scrollbarWidth: 'none' }}
        >
          {cast.map(person => (
            <div 
              key={person.id} 
              className="flex-shrink-0 w-32 snap-start"
            >
              <div className="relative w-32 h-40 overflow-hidden rounded-lg mb-2">
                <img 
                  src={getImageUrl(person.profile_path, 'w185')} 
                  alt={person.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              <h3 className="font-medium text-sm truncate">{person.name}</h3>
              <p className="text-gray-400 text-xs truncate">{person.character}</p>
            </div>
          ))}
        </div>
        
        <button 
          onClick={handleScrollRight} 
          className="absolute right-0 top-1/2 z-10 transform -translate-y-1/2 h-10 w-10 
                    bg-black/50 rounded-full flex items-center justify-center 
                    opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default CastCarousel;
