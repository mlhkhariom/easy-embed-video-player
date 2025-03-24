
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Channel } from '../services/iptv';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Settings, 
  Radio, Globe, Info, ArrowLeft, Layers, RefreshCw
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Script } from '@/components/ui/script';

interface LiveTVPlayerProps {
  channel: Channel;
  streamUrl: string | null;
  onBackClick?: () => void;
  isLoading?: boolean;
}

const LiveTVPlayer = ({ 
  channel, 
  streamUrl, 
  onBackClick,
  isLoading = false
}: LiveTVPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [qualityOptions] = useState(['Auto', '1080p', '720p', '480p']);
  const [selectedQuality, setSelectedQuality] = useState('Auto');
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [jwPlayerReady, setJwPlayerReady] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const jwPlayerRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Load JW Player script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jwplayer.com/libraries/IDzF9Zmk.js';
    script.async = true;
    script.onload = () => {
      setJwPlayerReady(true);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initialize JW Player when ready and stream URL is available
  useEffect(() => {
    if (jwPlayerReady && streamUrl && playerContainerRef.current && !isLoading) {
      try {
        // @ts-ignore
        jwPlayerRef.current = jwplayer(playerContainerRef.current.id).setup({
          file: streamUrl,
          image: channel.logo || undefined,
          width: '100%',
          aspectratio: '16:9',
          mute: isMuted,
          volume: volume * 100,
          autostart: true,
          primary: 'html5',
          hlshtml: true,
          cast: {},
          playbackRateControls: true,
          stretching: 'uniform',
        });

        jwPlayerRef.current.on('ready', () => {
          setIsPlaying(true);
          setPlayerError(null);
        });

        jwPlayerRef.current.on('error', () => {
          setPlayerError('Unable to load the stream. Please try another source or check your connection.');
        });

        jwPlayerRef.current.on('play', () => {
          setIsPlaying(true);
        });

        jwPlayerRef.current.on('pause', () => {
          setIsPlaying(false);
        });

        return () => {
          if (jwPlayerRef.current) {
            jwPlayerRef.current.remove();
          }
        };
      } catch (error) {
        console.error('JW Player initialization error:', error);
        setPlayerError('Failed to initialize player. Please try again later.');
      }
    }
  }, [jwPlayerReady, streamUrl, isLoading, channel.logo, isMuted, volume]);

  // Show controls on mouse move and hide after inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showInfo && !showSettings) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (jwPlayerRef.current) {
      if (isPlaying) {
        jwPlayerRef.current.pause();
      } else {
        jwPlayerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (jwPlayerRef.current) {
      jwPlayerRef.current.setMute(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (jwPlayerRef.current) {
      jwPlayerRef.current.setVolume(newVolume * 100);
      jwPlayerRef.current.setMute(newVolume === 0);
      setIsMuted(newVolume === 0);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (jwPlayerRef.current) {
      jwPlayerRef.current.setFullscreen(!isFullscreen);
    }
  };

  // Toggle information overlay
  const toggleInfo = () => {
    setShowInfo(!showInfo);
    setShowSettings(false);
    setShowControls(true);
  };

  // Toggle settings overlay
  const toggleSettings = () => {
    setShowSettings(!showSettings);
    setShowInfo(false);
    setShowControls(true);
  };

  // Handle quality change
  const changeQuality = (quality: string) => {
    setSelectedQuality(quality);
    
    if (jwPlayerRef.current) {
      const levels = jwPlayerRef.current.getQualityLevels();
      
      if (quality === 'Auto') {
        jwPlayerRef.current.setCurrentQuality(-1);
      } else {
        const qualityLevel = levels.findIndex((level: any) => 
          level.label.includes(quality.replace('p', ''))
        );
        
        if (qualityLevel !== -1) {
          jwPlayerRef.current.setCurrentQuality(qualityLevel);
        }
      }
    }
    
    toast({
      title: "Quality Changed",
      description: `Streaming quality set to ${quality}`,
    });
    
    setShowSettings(false);
  };

  // Reset player error
  const handleRetry = () => {
    setPlayerError(null);
    
    if (jwPlayerRef.current) {
      jwPlayerRef.current.load();
      jwPlayerRef.current.play();
    }
    
    toast({
      title: "Retrying Stream",
      description: "Attempting to reconnect to the channel...",
    });
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.div 
      ref={playerRef}
      className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && !showInfo && !showSettings && setShowControls(false)}
    >
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-moviemate-primary/20 backdrop-blur-sm">
                <Radio size={30} className="animate-pulse text-moviemate-primary" />
              </div>
              <p className="text-lg font-medium text-white">
                Loading {channel.name}...
              </p>
              <p className="mt-1 text-sm text-gray-400">
                FreeCinema Live TV
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Overlay */}
      <AnimatePresence>
        {playerError && (
          <motion.div 
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="max-w-md p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                <Radio size={30} className="text-red-500" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">Stream Unavailable</h3>
              <p className="mb-4 text-gray-300">{playerError}</p>
              <button 
                onClick={handleRetry}
                className="inline-flex items-center gap-2 rounded-md bg-moviemate-primary px-4 py-2 font-medium text-white transition-colors hover:bg-moviemate-primary/90"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* JW Player Container */}
      <div 
        id="livetv-player-container" 
        ref={playerContainerRef} 
        className="h-full w-full"
      />

      {/* Information Overlay */}
      <AnimatePresence>
        {showInfo && (
          <motion.div 
            className="absolute inset-0 z-20 flex flex-col justify-between bg-black/70 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="mb-1 text-2xl font-bold text-white">{channel.name}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  {channel.categories.map((category, index) => (
                    <span key={index} className="rounded-full bg-moviemate-card px-2 py-0.5 text-xs text-gray-300">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
              <button 
                onClick={toggleInfo}
                className="rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <ArrowLeft size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white">Channel Information</h3>
                <div className="space-y-1 text-sm text-gray-300">
                  {channel.languages.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-moviemate-primary" />
                      <span>Languages: {channel.languages.join(', ')}</span>
                    </div>
                  )}
                  {channel.broadcast_area.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Radio size={16} className="text-moviemate-primary" />
                      <span>Broadcast Area: {channel.broadcast_area.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="mb-2 text-lg font-medium text-white">Stream Quality</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">Current: {selectedQuality}</span>
                  <div className="ml-2">
                    <button 
                      onClick={toggleSettings}
                      className="inline-flex items-center gap-1 rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-white/20"
                    >
                      <Settings size={12} />
                      Change
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-full max-w-xs rounded-xl bg-moviemate-card p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Stream Settings</h3>
                <button 
                  onClick={toggleSettings}
                  className="rounded-full bg-white/10 p-1.5 text-white transition-colors hover:bg-white/20"
                >
                  <ArrowLeft size={16} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-white">Quality</h4>
                  <div className="space-y-1">
                    {qualityOptions.map((quality) => (
                      <button
                        key={quality}
                        onClick={() => changeQuality(quality)}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors
                          ${selectedQuality === quality ? 'bg-moviemate-primary text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                      >
                        <span className="flex items-center gap-2">
                          <Layers size={16} />
                          {quality}
                        </span>
                        {selectedQuality === quality && (
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Controls */}
      <AnimatePresence>
        {showControls && !showInfo && !showSettings && (
          <motion.div 
            className="absolute inset-0 z-10 flex flex-col justify-between bg-gradient-to-t from-black/70 via-transparent to-black/60 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {onBackClick && (
                  <button 
                    onClick={onBackClick}
                    className="rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-moviemate-primary">
                    <Radio size={14} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">{channel.name}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleInfo}
                  className="rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <Info size={18} />
                </button>
              </div>
            </div>
            
            {/* Center Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              {!isPlaying && (
                <motion.button
                  onClick={togglePlay}
                  className="rounded-full bg-moviemate-primary/80 p-4 transition-all hover:bg-moviemate-primary"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play size={32} className="text-white" />
                </motion.button>
              )}
            </div>
            
            {/* Bottom Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={togglePlay}
                  className="rounded-full bg-white/10 p-2 backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  {isPlaying ? 
                    <Pause size={18} className="text-white" /> : 
                    <Play size={18} className="text-white" />
                  }
                </button>
                
                <div className="group relative flex items-center">
                  <button 
                    onClick={toggleMute}
                    className="rounded-full bg-white/10 p-2 backdrop-blur-sm transition-colors hover:bg-white/20"
                  >
                    {isMuted || volume === 0 ? 
                      <VolumeX size={18} className="text-white" /> : 
                      <Volume2 size={18} className="text-white" />
                    }
                  </button>
                  
                  <div className="ml-2 hidden w-24 items-center group-hover:flex">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="h-1 w-full appearance-none rounded-full bg-white/30 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    />
                  </div>
                </div>
                
                <div className="hidden sm:block">
                  <span className="text-xs text-white">
                    Live
                    <span className="ml-1 inline-flex h-2 w-2 animate-pulse rounded-full bg-red-500"></span>
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleSettings}
                  className="rounded-full bg-white/10 p-2 backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <Settings size={18} className="text-white" />
                </button>
                
                <button 
                  onClick={toggleFullscreen}
                  className="rounded-full bg-white/10 p-2 backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <Maximize size={18} className="text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LiveTVPlayer;
