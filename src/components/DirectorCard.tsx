
import React from 'react';
import { Crew } from '../types';
import { getImageUrl } from '../services/tmdb';

interface DirectorCardProps {
  director: Crew;
}

const DirectorCard: React.FC<DirectorCardProps> = ({ director }) => {
  if (!director) return null;
  
  return (
    <div className="flex flex-col items-center mt-8">
      <h2 className="text-2xl font-bold mb-4">Director</h2>
      <div className="relative w-48 h-48 overflow-hidden rounded-full mb-4">
        <img 
          src={getImageUrl(director.profile_path, 'w185')} 
          alt={director.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
      </div>
      <h3 className="text-xl font-medium">{director.name}</h3>
      <p className="text-gray-400">{director.job}</p>
    </div>
  );
};

export default DirectorCard;
