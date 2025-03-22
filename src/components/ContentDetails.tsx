
import { useState, useEffect } from 'react';
import { Movie, TvShow } from '../types';
import ContentHeader from './content/ContentHeader';
import SeasonEpisodeSelector from './content/SeasonEpisodeSelector';
import PlayerSection from './content/PlayerSection';
import { Button } from '@/components/ui/button';
import { Play, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContentDetailsProps {
  content: Movie | TvShow;
  type: 'movie' | 'tv';
}

const ContentDetails = ({ content, type }: ContentDetailsProps) => {
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showWatchButton, setShowWatchButton] = useState(true);
  
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

  // Auto-scroll to player when it becomes visible
  useEffect(() => {
    if (showPlayer) {
      // Use a timeout to wait for the player to render
      const timer = setTimeout(() => {
        window.scrollTo({
          top: window.innerHeight * 0.5,
          behavior: 'smooth'
        });
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [showPlayer]);
  
  // Auto-play content after 3 seconds on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!showPlayer) {
        startWatching();
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const startWatching = () => {
    setShowPlayer(true);
    setShowWatchButton(false);
  };
  
  return (
    <div className="mx-auto max-w-7xl px-4 pt-16 lg:pt-24">
      {/* Watch Now Floating Button (shows only when player is hidden) */}
      {showWatchButton && (
        <motion.div 
          className="fixed bottom-6 left-0 right-0 z-30 mx-auto w-fit shadow-2xl"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
        >
          <Button 
            onClick={startWatching}
            className="group flex items-center gap-2 bg-moviemate-primary px-8 py-6 text-lg font-medium text-white hover:bg-moviemate-primary/90"
          >
            <Play className="transition-transform group-hover:-translate-x-1" size={24} />
            Watch Now
          </Button>
        </motion.div>
      )}
      
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
      
      {/* Video Player (auto-shows if watch button was clicked) */}
      {showPlayer && (
        <PlayerSection
          showPlayer={showPlayer}
          isMovie={isMovie}
          contentId={content.id}
          imdbId={content.imdb_id}
          selectedSeason={selectedSeason}
          selectedEpisode={selectedEpisode}
          title={title}
        />
      )}
      
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
    </div>
  );
};

export default ContentDetails;
