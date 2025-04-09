
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { fetchSettings, getBestPlayerAPI, generatePlayerUrl } from '@/services/settings';

interface VideoPlayerProps {
  tmdbId: number;
  imdbId?: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  onError?: (error: string) => void;
}

const VideoPlayer = ({ tmdbId, imdbId, type, season, episode, onError }: VideoPlayerProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Set up player with the available API sources
  useEffect(() => {
    if (tmdbId) {
      loadPlayerUrl();
    }
    
    return () => {
      // Clean up JW Player on unmount if it exists
      if (window.jwplayer && playerRef.current) {
        try {
          const playerInstance = window.jwplayer(playerRef.current.id);
          if (playerInstance && typeof playerInstance.remove === 'function') {
            playerInstance.remove();
          }
        } catch (err) {
          console.error("Error cleaning up JW Player:", err);
        }
      }
    };
  }, [tmdbId, imdbId, type, season, episode]);
  
  // Apply player settings like volume and autoplay
  useEffect(() => {
    loadSettings();
  }, [playerUrl]);
  
  const loadSettings = async () => {
    try {
      if (!window.jwplayer || !playerRef.current) return;
      
      const playerInstance = window.jwplayer(playerRef.current.id);
      if (!playerInstance) return;
      
      const settings = await fetchSettings();
      
      // Check if settings and playerSettings exist before accessing properties
      if (settings && settings.playerSettings) {
        const { muted, defaultVolume } = settings.playerSettings;
        
        // Only apply settings if the player is in a valid state
        if (playerInstance && typeof playerInstance.setMute === 'function') {
          if (typeof muted === 'boolean') {
            playerInstance.setMute(muted);
          }
          
          if (typeof defaultVolume === 'number') {
            playerInstance.setVolume(Math.round(defaultVolume * 100));
          }
        }
      }
    } catch (error) {
      console.error("Error applying player settings:", error);
    }
  };
  
  const loadPlayerUrl = async () => {
    try {
      setIsLoading(true);
      
      // Get the best available player API
      const bestAPI = await getBestPlayerAPI();
      
      if (!bestAPI) {
        const errorMsg = "No player APIs available. Please configure player sources in admin settings.";
        console.error(errorMsg);
        onError?.(errorMsg);
        return;
      }
      
      // Generate the player URL based on type and IDs
      let url;
      if (imdbId && bestAPI.url.includes('{id}')) {
        // Use IMDB ID if we have it and the API supports it
        url = generatePlayerUrl(bestAPI, type, imdbId, season, episode);
      } else {
        // Fall back to TMDB ID
        url = generatePlayerUrl(bestAPI, type, tmdbId.toString(), season, episode);
      }
      
      setPlayerUrl(url);
      setIsLoading(false);
    } catch (error) {
      console.error("Error setting up player:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown player error";
      onError?.(errorMessage);
    }
  };

  if (!playerUrl) {
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        <div className="text-white text-center p-4">
          <p>Loading player...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <iframe
        id="player-iframe"
        ref={playerRef as any}
        src={playerUrl}
        className="w-full h-full"
        allowFullScreen
        allow="encrypted-media"
        style={{ border: 'none' }}
      ></iframe>
    </div>
  );
};

export default VideoPlayer;
