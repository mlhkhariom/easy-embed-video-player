import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  Film, 
  PlayCircle, 
  AlertTriangle, 
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Loader,
  Info,
  SkipForward,
  SkipBack
} from "lucide-react";
import VideoPlayer from '../VideoPlayer';

interface PlayerSectionProps {
  showPlayer: boolean;
  isMovie: boolean;
  contentId: number;
  imdbId?: string;
  selectedSeason?: number;
  selectedEpisode?: number;
  title?: string;
  episodeTitle?: string;
}

const PlayerSection = ({
  showPlayer,
  isMovie,
  contentId,
  imdbId,
  selectedSeason,
  selectedEpisode,
  title,
  episodeTitle
}: PlayerSectionProps) => {
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const playerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (showControls) {
      timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [showControls]);
  
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [contentId, selectedSeason, selectedEpisode]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPlaying(true);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  if (!showPlayer) return null;
  
  const handlePlayerError = (error: string) => {
    setPlayerError(error);
    setIsLoading(false);
  };
  
  const resetError = () => {
    setPlayerError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };
  
  const handleMouseMove = () => {
    setShowControls(true);
  };
  
  return (
    <motion.div 
      className="mb-12 animate-scale-in"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-moviemate-primary">
              <Film size={16} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {isMovie ? 'Now Playing' : (
                episodeTitle ? 
                  `${episodeTitle} (S${selectedSeason}:E${selectedEpisode})` : 
                  `Season ${selectedSeason}, Episode ${selectedEpisode}`
              )}
            </h2>
          </div>
          
          {playerError && (
            <motion.button 
              onClick={resetError}
              className="flex items-center gap-1 rounded-full bg-moviemate-primary px-4 py-1 text-xs font-medium text-white transition-colors hover:bg-opacity-90"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlayCircle size={14} />
              Try Again
            </motion.button>
          )}
        </div>
        
        <div className="mt-2 flex items-center">
          <div className="h-0.5 w-16 rounded-full bg-gradient-to-r from-moviemate-primary to-transparent"></div>
          <p className="ml-2 text-xs text-gray-400">
            {title && `${title} | `}
            FreeCinema Premium
          </p>
        </div>
      </div>
      
      {playerError ? (
        <motion.div 
          className="relative overflow-hidden rounded-xl border border-red-500/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Alert variant="destructive" className="border-0 bg-red-500/10">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-medium text-white">Player Error</AlertTitle>
            <AlertDescription className="text-gray-300">
              {playerError}. Please try again or check back later.
            </AlertDescription>
          </Alert>
          
          <div className="absolute -bottom-8 -left-8 h-16 w-64 rounded-full bg-red-500/10 blur-xl"></div>
          <div className="absolute -top-8 -right-8 h-16 w-64 rounded-full bg-red-500/5 blur-xl"></div>
        </motion.div>
      ) : (
        <div 
          ref={playerRef}
          className="relative overflow-hidden rounded-xl shadow-2xl"
          onMouseMove={handleMouseMove}
        >
          <div className="freecinema-player relative aspect-video w-full bg-black">
            <VideoPlayer
              tmdbId={contentId}
              imdbId={imdbId}
              type={isMovie ? 'movie' : 'tv'}
              season={!isMovie ? selectedSeason : undefined}
              episode={!isMovie ? selectedEpisode : undefined}
              onError={handlePlayerError}
            />
            
            <AnimatePresence>
              {isLoading && (
                <motion.div 
                  className="absolute inset-0 z-10 flex items-center justify-center bg-black/70"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-moviemate-primary/20 backdrop-blur-sm">
                      <Loader size={30} className="animate-spin text-moviemate-primary" />
                    </div>
                    <p className="text-lg font-medium text-white">
                      Loading {isMovie ? 'Movie' : (
                        episodeTitle ? `"${episodeTitle}"` : `Episode ${selectedEpisode}`
                      )}...
                    </p>
                    <p className="mt-1 text-sm text-gray-400">FreeCinema Premium Stream</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {!isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 z-10 flex items-center justify-center"
                  onClick={togglePlay}
                >
                  {!isPlaying && (
                    <motion.div 
                      className="rounded-full bg-moviemate-primary/80 p-5 backdrop-blur-sm"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Play size={40} className="text-white" />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {showControls && !isLoading && (
                <motion.div 
                  className="freecinema-player-controls absolute inset-0 z-20 flex flex-col justify-between bg-gradient-to-t from-black/70 to-transparent p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-moviemate-primary">
                        <Film size={12} className="text-white" />
                      </div>
                      <span className="text-sm font-medium text-white">FreeCinema</span>
                    </div>
                    
                    <div>
                      <button 
                        className="freecinema-glass-button"
                        onClick={() => {}}
                      >
                        <Info size={16} className="text-white" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="freecinema-progress" onClick={() => setProgress(Math.random() * 100)}>
                      <div className="freecinema-progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button 
                          className="freecinema-glass-button"
                          onClick={togglePlay}
                        >
                          {isPlaying ? 
                            <Pause size={18} className="text-white" /> : 
                            <Play size={18} className="text-white" />
                          }
                        </button>
                        
                        <button className="freecinema-glass-button">
                          <SkipBack size={18} className="text-white" />
                        </button>
                        
                        <button className="freecinema-glass-button">
                          <SkipForward size={18} className="text-white" />
                        </button>
                        
                        <div className="group relative flex items-center">
                          <button 
                            className="freecinema-glass-button"
                            onClick={toggleMute}
                          >
                            {isMuted || volume === 0 ? 
                              <VolumeX size={18} className="text-white" /> : 
                              <Volume2 size={18} className="text-white" />
                            }
                          </button>
                          
                          <div className="ml-2 hidden items-center group-hover:flex">
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={volume}
                              onChange={handleVolumeChange}
                              className="freecinema-volume-slider"
                            />
                          </div>
                        </div>
                        
                        <span className="ml-2 text-xs text-white">
                          {Math.floor(progress / 100 * 120)} / 120 min
                        </span>
                      </div>
                      
                      <div>
                        <button 
                          className="freecinema-glass-button"
                          onClick={toggleFullscreen}
                        >
                          <Maximize size={18} className="text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-moviemate-primary/10 blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-purple-700/10 blur-3xl"></div>
        </div>
      )}
      
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-400">
        <span className="rounded-full bg-moviemate-card px-3 py-1">HD 1080p</span>
        <span className="rounded-full bg-moviemate-card px-3 py-1">Premium Quality</span>
        <span className="rounded-full bg-moviemate-card px-3 py-1">Ad Free</span>
        {isMovie ? (
          <span className="rounded-full bg-moviemate-card px-3 py-1">Movie</span>
        ) : (
          <span className="rounded-full bg-moviemate-card px-3 py-1">TV Show</span>
        )}
      </div>
    </motion.div>
  );
};

export default PlayerSection;
