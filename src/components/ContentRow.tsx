
import React from 'react';
import { Movie, TvShow } from '../types';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../services/tmdb';
import { PlayCircle } from 'lucide-react';

interface ContentRowProps {
  title: string;
  content: (Movie | TvShow)[];
  type: 'movie' | 'tv';
  isLoading?: boolean;
  error?: unknown;
}

const ContentRow: React.FC<ContentRowProps> = ({ 
  title, 
  content, 
  type,
  isLoading,
  error 
}) => {
  if (isLoading) {
    return (
      <div className="my-8">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="min-w-[180px] w-[180px] rounded-lg bg-gray-800 animate-pulse">
              <div className="h-[270px] rounded-lg bg-gray-700"></div>
              <div className="h-4 bg-gray-700 rounded mt-2 w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="bg-red-900/20 text-red-200 p-4 rounded-lg">
          Failed to load content
        </div>
      </div>
    );
  }

  if (!content || content.length === 0) {
    return null;
  }

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {content.map((item) => {
          const itemTitle = 'title' in item ? item.title : item.name;
          const posterPath = item.poster_path;
          const id = item.id;
          const itemPath = `/${type}/${id}`;
          
          return (
            <div 
              key={id} 
              className="min-w-[180px] w-[180px] group relative"
            >
              <Link to={itemPath} className="block">
                <div className="rounded-lg overflow-hidden relative">
                  <img 
                    src={getImageUrl(posterPath)} 
                    alt={itemTitle}
                    className="w-full h-[270px] object-cover transition-all duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <PlayCircle className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h3 className="mt-2 text-center text-sm font-medium line-clamp-1">{itemTitle}</h3>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContentRow;
