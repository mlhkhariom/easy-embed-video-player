
import { useState, useEffect, useRef } from 'react';
import { Movie, TvShow } from '../types';
import ContentHeader from './content/ContentHeader';
import SeasonEpisodeSelector from './content/SeasonEpisodeSelector';
import PlayerSection from './content/PlayerSection';
import { Button } from '@/components/ui/button';
import { Play, Info } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { useAdmin } from '../contexts/AdminContext';

interface ContentDetailsProps {
  content: Movie | TvShow;
  type: 'movie' | 'tv';
}

const ContentDetails = ({ content, type }: ContentDetailsProps) => {
  const { settings } = useAdmin();
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showWatchButton, setShowWatchButton] = useState(true);
  const [autoPlayTimer, setAutoPlayTimer] = useState<number>(3);
  const firstRender = useRef(true);
  const controls = useAnimation();
  
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
  
  // Auto-play countdown timer - only on first render
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    
    // Only start the countdown if it's the first render and auto-play is enabled
    if (firstRender.current && settings.enableAutoPlay && !showPlayer && autoPlayTimer > 0) {
      firstRender.current = false;
      
      countdownInterval = setInterval(() => {
        setAutoPlayTimer(prev => {
          if (prev <= 1) {
            startWatching();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [settings.enableAutoPlay]);
  
  // 3D mouse follow effect for the watch now button
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!settings.enable3DEffects) return;
      
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      controls.start({
        rotateX: (y - 0.5) * 10,
        rotateY: (x - 0.5) * -10,
        transition: { type: 'spring', stiffness: 150, damping: 15 }
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [controls, settings.enable3DEffects]);
  
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
          style={{ perspective: 1000 }}
          animate={controls}
        >
          <Button 
            onClick={startWatching}
            className="group relative flex items-center gap-2 bg-moviemate-primary px-8 py-6 text-lg font-medium text-white hover:bg-moviemate-primary/90"
            style={{ 
              background: `linear-gradient(135deg, ${settings.primaryColor}, rgba(139, 92, 246, 0.7))` 
            }}
          >
            {settings.enable3DEffects && (
              <div className="absolute inset-0 -z-10 rounded-md bg-black/20 blur-xl"></div>
            )}
            <motion.div
              className="absolute inset-0 -z-10 rounded-md opacity-50"
              animate={{ 
                boxShadow: ['0 0 10px rgba(139, 92, 246, 0.5)', '0 0 20px rgba(139, 92, 246, 0.7)', '0 0 10px rgba(139, 92, 246, 0.5)'] 
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            <Play className="transition-transform group-hover:-translate-x-1" size={24} />
            Watch Now {settings.enableAutoPlay && `(${autoPlayTimer}s)`}
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
