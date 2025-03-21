
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Movie, TvShow } from '../types';
import { getImageUrl } from '../services/tmdb';

interface MovieCardProps {
  item: Movie | TvShow;
  type: 'movie' | 'tv';
  className?: string;
}

const MovieCard = ({ item, type, className = '' }: MovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Determine if it's a movie or TV show based on the presence of 'title' property
  const isMovie = 'title' in item;
  const title = isMovie ? (item as Movie).title : (item as TvShow).name;
  const releaseDate = isMovie 
    ? (item as Movie).release_date 
    : (item as TvShow).first_air_date;
  
  // Format the release date to year only
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  
  // Create a link path based on the type
  const linkPath = `/${type}/${item.id}`;

  return (
    <Link 
      to={linkPath}
      className={`movie-card relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 ${className}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-moviemate-card">
        <div 
          className={`absolute inset-0 ${imageLoaded ? 'image-loaded' : 'image-loading'}`}
        >
          <img
            src={getImageUrl(item.poster_path, 'w500')}
            alt={title}
            className="h-full w-full object-cover"
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        </div>
        
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
          <div className="space-y-1">
            <h3 className="line-clamp-1 text-sm font-medium text-white">{title}</h3>
            {year && (
              <p className="text-xs text-gray-300">{year}</p>
            )}
            <div className="flex items-center">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-yellow-400">{item.vote_average.toFixed(1)}</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  className="text-yellow-400"
                >
                  <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
