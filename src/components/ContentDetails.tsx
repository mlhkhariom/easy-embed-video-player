
import { useState } from 'react';
import { Movie, TvShow, Season } from '../types';
import { getImageUrl } from '../services/tmdb';
import VideoPlayer from './VideoPlayer';

interface ContentDetailsProps {
  content: Movie | TvShow;
  type: 'movie' | 'tv';
}

const ContentDetails = ({ content, type }: ContentDetailsProps) => {
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [showPlayer, setShowPlayer] = useState(true);
  
  const isMovie = type === 'movie';
  const title = isMovie ? (content as Movie).title : (content as TvShow).name;
  const releaseDate = isMovie
    ? (content as Movie).release_date
    : (content as TvShow).first_air_date;
    
  const formattedDate = releaseDate
    ? new Date(releaseDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';
    
  const runtime = isMovie 
    ? (content as Movie).runtime 
    : null;
    
  const formattedRuntime = runtime
    ? `${Math.floor(runtime / 60)}h ${runtime % 60}m`
    : '';
    
  const seasons = !isMovie ? (content as TvShow).seasons : null;
  
  // Format the rating to display only one decimal place
  const rating = content.vote_average?.toFixed(1) || '0.0';
  
  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeason(Number(e.target.value));
    setSelectedEpisode(1); // Reset episode selection when season changes
  };
  
  const handleEpisodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEpisode(Number(e.target.value));
  };
  
  return (
    <div className="mx-auto max-w-7xl px-4 pt-16 lg:pt-24">
      {/* Hero Section with Backdrop */}
      <div className="relative mb-8 overflow-hidden rounded-xl">
        <div className="absolute inset-0">
          <img 
            src={getImageUrl(content.backdrop_path, 'original')}
            alt={title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-moviemate-background via-moviemate-background/90 to-transparent"></div>
        </div>
        
        <div className="relative z-10 flex flex-col gap-8 px-4 py-12 md:flex-row lg:px-8 lg:py-16">
          {/* Poster */}
          <div className="flex-shrink-0">
            <div className="relative aspect-[2/3] w-48 overflow-hidden rounded-xl bg-moviemate-card shadow-lg md:w-64 lg:w-72">
              <img 
                src={getImageUrl(content.poster_path, 'w500')}
                alt={title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          
          {/* Content Details */}
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">{title}</h1>
            
            <div className="flex flex-wrap items-center gap-3">
              {formattedDate && (
                <span className="rounded-full bg-moviemate-card px-3 py-1 text-sm text-gray-300">
                  {formattedDate}
                </span>
              )}
              
              {formattedRuntime && (
                <span className="rounded-full bg-moviemate-card px-3 py-1 text-sm text-gray-300">
                  {formattedRuntime}
                </span>
              )}
              
              {!isMovie && (
                <span className="rounded-full bg-moviemate-card px-3 py-1 text-sm text-gray-300">
                  {(content as TvShow).number_of_seasons} Seasons
                </span>
              )}
              
              <div className="flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-sm font-bold text-black">
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
                  className="rounded-full bg-moviemate-primary/30 px-3 py-1 text-xs font-medium text-white"
                >
                  {genre.name}
                </span>
              ))}
            </div>
            
            <p className="max-w-3xl text-gray-300">{content.overview}</p>
            
            {!isMovie && seasons && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="season" className="mb-1 block text-sm font-medium text-gray-300">
                    Season
                  </label>
                  <select
                    id="season"
                    value={selectedSeason}
                    onChange={handleSeasonChange}
                    className="w-full rounded-lg border border-gray-700 bg-moviemate-card px-4 py-2 text-white"
                  >
                    {seasons.filter(season => season.season_number > 0).map((season) => (
                      <option key={season.id} value={season.season_number}>
                        {season.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="episode" className="mb-1 block text-sm font-medium text-gray-300">
                    Episode
                  </label>
                  <select
                    id="episode"
                    value={selectedEpisode}
                    onChange={handleEpisodeChange}
                    className="w-full rounded-lg border border-gray-700 bg-moviemate-card px-4 py-2 text-white"
                  >
                    {Array.from({ length: getCurrentSeasonEpisodeCount(seasons, selectedSeason) }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Episode {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            <div className="mt-4 flex flex-wrap gap-4">
              <button
                onClick={() => setShowPlayer(true)}
                className="rounded-full bg-moviemate-primary px-6 py-3 text-sm font-medium text-white transition-all hover:bg-opacity-90"
              >
                Watch Now
              </button>
              
              <button
                onClick={() => setShowPlayer(false)}
                className="rounded-full border border-gray-700 bg-moviemate-card px-6 py-3 text-sm font-medium text-white transition-all hover:bg-gray-800"
              >
                Add to Watchlist
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Video Player */}
      {showPlayer && (
        <div className="mb-12 animate-scale-in">
          <h2 className="mb-4 text-2xl font-bold text-white">
            {isMovie ? 'Movie Player' : `Season ${selectedSeason}, Episode ${selectedEpisode}`}
          </h2>
          <VideoPlayer
            tmdbId={content.id}
            imdbId={content.imdb_id}
            type={type}
            season={!isMovie ? selectedSeason : undefined}
            episode={!isMovie ? selectedEpisode : undefined}
          />
        </div>
      )}
    </div>
  );
};

// Helper function to get episode count for the current season
const getCurrentSeasonEpisodeCount = (seasons: Season[] | null, seasonNumber: number): number => {
  if (!seasons) return 0;
  
  const currentSeason = seasons.find((s) => s.season_number === seasonNumber);
  return currentSeason?.episode_count || 0;
};

export default ContentDetails;
