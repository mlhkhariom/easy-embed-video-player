
import { useState } from 'react';
import { Movie, TvShow } from '../types';
import ContentHeader from './content/ContentHeader';
import SeasonEpisodeSelector from './content/SeasonEpisodeSelector';
import PlayerSection from './content/PlayerSection';

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
      <ContentHeader
        content={content}
        type={type}
        title={title}
        formattedDate={formattedDate}
        formattedRuntime={formattedRuntime}
        rating={rating}
        showPlayer={showPlayer}
        setShowPlayer={setShowPlayer}
      />
      
      {/* Season & Episode Selector (for TV shows) */}
      {!isMovie && seasons && (
        <SeasonEpisodeSelector
          seasons={seasons}
          selectedSeason={selectedSeason}
          selectedEpisode={selectedEpisode}
          onSeasonChange={handleSeasonChange}
          onEpisodeChange={handleEpisodeChange}
        />
      )}
      
      {/* Video Player */}
      <PlayerSection
        showPlayer={showPlayer}
        isMovie={isMovie}
        contentId={content.id}
        imdbId={content.imdb_id}
        selectedSeason={selectedSeason}
        selectedEpisode={selectedEpisode}
      />
    </div>
  );
};

export default ContentDetails;
