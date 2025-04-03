
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  SkipBack, SkipForward, Settings, Film, Award, 
  RefreshCw, Shield
} from 'lucide-react';
import { fetchSettings, getBestPlayerAPI, generatePlayerUrl } from '@/services/settings';
import { useToast } from "@/components/ui/use-toast";

interface VideoPlayerProps {
  tmdbId?: number;
  imdbId?: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  onError?: (message: string) => void;
}

const VideoPlayer = ({ 
  tmdbId, 
  imdbId, 
  type, 
  season, 
  episode,
  onError 
}: VideoPlayerProps) => {
  const [playerUrl, setPlayerUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentApiIndex, setCurrentApiIndex] = useState(0);
  const [availableApis, setAvailableApis] = useState<any[]>([]);
  const [volume, setVolume] = useState(0.8);
  const [showApiSelector, setShowApiSelector] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Control visibility timeout
  const handleMouseMove = () => {
    setShowControls(true);
    
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Load player settings
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await fetchSettings();
      setIsMuted(settings.playerSettings.muted);
      setVolume(settings.playerSettings.defaultVolume);
      
      // Get active APIs
      setAvailableApis(settings.playerAPIs.filter(api => api.isActive));
    };
    
    loadSettings();
  }, []);

  // Load player URL when component mounts or props change
  useEffect(() => {
    const loadPlayerUrl = async () => {
      // Reset states when props change
      setIsLoading(true);
      setLoadError(null);
      setShowApiSelector(false);
      
      try {
        // Get available APIs
        const settings = await fetchSettings();
        const activeApis = settings.playerAPIs.filter(api => api.isActive);
        setAvailableApis(activeApis);
        
        if (activeApis.length === 0) {
          throw new Error('No active player APIs configured');
        }
        
        // Use first API by default
        const api = activeApis[currentApiIndex];
        
        // Generate player URL based on content ID type
        let id = '';
        if (imdbId) {
          id = imdbId;
        } else if (tmdbId) {
          id = tmdbId.toString();
        } else {
          throw new Error('No valid content ID available');
        }
        
        const url = generatePlayerUrl(api, type, id, season, episode);
        setPlayerUrl(url);
        
      } catch (error) {
        console.error('Error setting up player:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load video player';
        setLoadError(errorMessage);
        if (onError) {
          onError(errorMessage);
        }
      }
      
      // Simulate loading delay
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    };
    
    loadPlayerUrl();
  }, [tmdbId, imdbId, type, season, episode, currentApiIndex, onError]);

  // Switch to next available API source
  const switchToNextApi = () => {
    if (availableApis.length <= 1) {
      toast({
        title: "No alternative sources",
        description: "No other player sources are available.",
        variant: "destructive"
      });
      return;
    }
    
    const nextIndex = (currentApiIndex + 1) % availableApis.length;
    setCurrentApiIndex(nextIndex);
    setIsLoading(true);
    
    toast({
      title: "Switching source",
      description: `Trying ${availableApis[nextIndex].name}...`,
    });
  };

  const handleIframeError = () => {
    setLoadError('Failed to load video content');
    if (onError) {
      onError('Failed to load video content');
    }
  };

  // Toggle player controls
  const handlePlay = () => setIsPlaying(!isPlaying);
  const handleMute = () => setIsMuted(!isMuted);
  const toggleApiSelector = () => setShowApiSelector(!showApiSelector);

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.div 
      ref={playerRef}
      className="relative aspect-video w-full overflow-hidden rounded-xl bg-moviemate-card shadow-xl"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-black/90 to-moviemate-card/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <motion.div 
              className="h-16 w-16 rounded-full border-4 border-moviemate-primary border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <div className="flex items-center gap-2">
              <Film className="text-moviemate-primary" size={20} />
              <p className="text-sm font-medium text-white">FreeCinema</p>
            </div>
            <p className="text-sm text-gray-300">Loading your content...</p>
          </div>
        </div>
      )}
      
      {playerUrl && !loadError && (
        <div className="relative h-full w-full">
          <motion.div 
            className="h-full w-full transform-gpu"
            initial={{ rotateX: 0, rotateY: 0 }}
            whileHover={{ 
              rotateX: [-0.5, 0.5, -0.5], 
              rotateY: [-0.5, 0.5, -0.5],
              transition: { 
                rotateX: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                rotateY: { repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.5 }
              }
            }}
            style={{ perspective: 1000 }}
          >
            <iframe
              ref={iframeRef}
              src={playerUrl}
              className="h-full w-full border-0"
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture"
              loading="lazy"
              onLoad={() => {
                setIsLoading(false);
                setIsPlaying(true);
              }}
              onError={handleIframeError}
            ></iframe>
          </motion.div>
          
          <AnimatePresence>
            {showControls && (
              <motion.div 
                className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-transparent to-black/60 flex flex-col justify-between p-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Top Controls - Title & Source Selector */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="text-moviemate-primary" size={18} />
                    <span className="text-white font-medium text-sm">
                      {type === 'movie' ? 'Movie' : `S${season} E${episode}`}
                    </span>
                    {availableApis.length > 0 && currentApiIndex < availableApis.length && (
                      <div className="relative ml-4">
                        <button
                          onClick={toggleApiSelector}
                          className="flex items-center gap-1 rounded-full bg-black/40 px-3 py-1 text-xs text-white hover:bg-black/60 transition-colors"
                        >
                          <Shield size={12} className="text-moviemate-primary" />
                          {availableApis[currentApiIndex]?.name || 'Source'}
                        </button>
                        
                        {showApiSelector && (
                          <motion.div 
                            className="absolute top-full left-0 mt-2 bg-black/80 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg z-50"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            <div className="py-1">
                              {availableApis.map((api, index) => (
                                <button
                                  key={api.id}
                                  className={`w-full text-left px-4 py-2 text-xs ${currentApiIndex === index ? 'bg-moviemate-primary/20 text-moviemate-primary' : 'text-white hover:bg-black/40'}`}
                                  onClick={() => {
                                    setCurrentApiIndex(index);
                                    setShowApiSelector(false);
                                  }}
                                >
                                  {api.name}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={switchToNextApi}
                      className="rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60 transition-colors"
                      title="Try alternative source"
                    >
                      <RefreshCw size={14} />
                    </button>
                    <span className="text-white/90 text-xs bg-black/40 px-3 py-1 rounded-full">
                      FreeCinema
                    </span>
                  </div>
                </div>
                
                {/* Center Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.button
                    className="rounded-full bg-moviemate-primary/80 p-4 backdrop-blur-sm hover:bg-moviemate-primary transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePlay}
                  >
                    {isPlaying ? (
                      <Pause size={28} className="text-white" />
                    ) : (
                      <Play size={28} className="text-white ml-1" />
                    )}
                  </motion.button>
                </div>
                
                {/* Bottom Controls - Progress */}
                <div className="flex flex-col gap-3">
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden cursor-pointer">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-moviemate-primary to-purple-500"
                      initial={{ width: "0%" }}
                      animate={{ width: "30%" }}
                    />
                  </div>
                  
                  {/* Control buttons */}
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handlePlay}
                        className="text-white hover:text-moviemate-primary transition-colors"
                      >
                        {isPlaying ? (
                          <Pause size={20} />
                        ) : (
                          <Play size={20} />
                        )}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-white hover:text-moviemate-primary transition-colors"
                      >
                        <SkipBack size={20} />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-white hover:text-moviemate-primary transition-colors"
                      >
                        <SkipForward size={20} />
                      </motion.button>
                      
                      <div className="group relative">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleMute}
                          className="text-white hover:text-moviemate-primary transition-colors"
                        >
                          {isMuted ? (
                            <VolumeX size={20} />
                          ) : (
                            <Volume2 size={20} />
                          )}
                        </motion.button>
                        
                        <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 bg-black/80 rounded-md p-2 w-32">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-full cursor-pointer accent-moviemate-primary"
                          />
                        </div>
                      </div>
                      
                      <span className="text-white/80 text-xs hidden sm:inline">
                        00:30 / 01:55:42
                      </span>
                    </div>
                    
                    <div className="flex space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-white hover:text-moviemate-primary transition-colors"
                      >
                        <Settings size={20} />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleFullscreen}
                        className="text-white hover:text-moviemate-primary transition-colors"
                      >
                        {isFullscreen ? (
                          <Minimize size={20} />
                        ) : (
                          <Maximize size={20} />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      
      {loadError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-moviemate-background to-moviemate-card">
          <div className="flex flex-col items-center gap-4 max-w-md text-center px-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-red-500"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3 className="text-lg font-medium text-white">Unable to load video content</h3>
            <p className="text-sm text-gray-300 mb-4">
              {loadError || 'There was a problem loading the video. This could be due to network issues or the content may not be available.'}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={switchToNextApi}
                className="px-4 py-2 bg-moviemate-primary text-white rounded-lg hover:bg-moviemate-primary/90 transition-colors"
              >
                Try Another Source
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 3D effect - bottom reflection */}
      <div className="absolute -bottom-12 left-0 right-0 h-12 bg-gradient-to-t from-transparent to-moviemate-primary/10 blur-md"></div>
    </motion.div>
  );
};

export default VideoPlayer;
