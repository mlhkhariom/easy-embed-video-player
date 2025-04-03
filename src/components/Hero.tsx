
import React from 'react';
import { Movie, TvShow } from '../types';
import { getImageUrl } from '../services/tmdb';
import { PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroProps {
  featuredMovie: Movie | null;
  featuredTVShow: TvShow | null;
}

const Hero: React.FC<HeroProps> = ({ featuredMovie, featuredTVShow }) => {
  // Use featured movie by default, fallback to featured TV show
  const featured = featuredMovie || featuredTVShow;
  
  if (!featured) {
    return (
      <div className="relative h-[70vh] w-full bg-gray-900 flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to FreeCinema</h1>
          <p className="text-xl md:text-2xl mb-8">Discover amazing movies and TV shows</p>
        </div>
      </div>
    );
  }
  
  const isMovie = 'title' in featured;
  const title = isMovie ? featured.title : featured.name;
  const path = isMovie ? `/movie/${featured.id}` : `/tv/${featured.id}`;
  const backdropUrl = getImageUrl(featured.backdrop_path, 'original');
  
  return (
    <div className="relative h-[70vh] w-full">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent"></div>
      </div>
      
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-2xl">{title}</h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl line-clamp-3">
            {featured.overview}
          </p>
          <Link 
            to={path}
            className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-full flex items-center w-fit"
          >
            <PlayCircle className="mr-2" />
            Watch Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
