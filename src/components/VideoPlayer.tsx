
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { findBestAvailableAPI } from '@/services/settings';

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
  const [playerApi, setPlayerApi] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();
  
  // Set up player with the available API sources
  useEffect(() => {
    if (tmdbId) {
      loadPlayerUrl();
    }
    
    return () => {
      // Clean up any resources
    };
  }, [tmdbId, imdbId, type, season, episode]);
  
  // Add script to block ads
  useEffect(() => {
    if (iframeRef.current && playerUrl) {
      try {
        // We can't directly modify the iframe content due to same-origin policy,
        // but we can use messaging to communicate with the iframe if needed
        console.log('Player loaded:', playerApi);
      } catch (error) {
        console.error("Error setting up ad blocker:", error);
      }
    }
  }, [playerUrl, playerApi]);
  
  const loadPlayerUrl = async () => {
    try {
      setIsLoading(true);
      
      // Find the best available player API
      const result = await findBestAvailableAPI(
        tmdbId, 
        imdbId, 
        type
      );
      
      if (!result) {
        const errorMsg = "No compatible player APIs available. Please configure player sources in admin settings.";
        console.error(errorMsg);
        onError?.(errorMsg);
        toast({
          variant: "destructive",
          title: "Player Error",
          description: errorMsg,
        });
        setIsLoading(false);
        return;
      }
      
      // Generate the final URL with season/episode for TV shows
      let finalUrl = result.url;
      if (type === 'tv' && season && episode) {
        finalUrl = finalUrl.replace('{season}', season.toString())
                          .replace('{episode}', episode.toString());
      }
      
      setPlayerUrl(finalUrl);
      setPlayerApi(result.api.name);
      setIsLoading(false);
      
      toast({
        title: "Player Loaded",
        description: `Using ${result.api.name} player`,
        duration: 3000
      });
      
    } catch (error) {
      console.error("Error setting up player:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown player error";
      onError?.(errorMessage);
      toast({
        variant: "destructive",
        title: "Player Error",
        description: errorMessage,
      });
      setIsLoading(false);
    }
  };

  // Function to add download button to the iframe
  const addDownloadButton = () => {
    if (!iframeRef.current) return;
    
    try {
      // This is a placeholder. Actual implementation would require cooperation from the iframe content,
      // which is not possible due to cross-origin restrictions in most cases
      console.log('Download functionality would be added here if possible');
    } catch (error) {
      console.error("Error adding download button:", error);
    }
  };

  if (!playerUrl) {
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        <div className="text-white text-center p-4">
          {isLoading ? (
            <>
              <div className="loading-spinner mb-4"></div>
              <p>Loading player...</p>
            </>
          ) : (
            <>
              <p className="text-xl mb-2">Player Configuration Error</p>
              <p className="text-sm opacity-80">Please configure player sources in admin settings</p>
              <a 
                href="/admin/player"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 rounded text-white text-sm hover:bg-blue-700 transition-colors"
              >
                Configure Player
              </a>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <iframe
        id="player-iframe"
        ref={iframeRef}
        src={playerUrl}
        className="w-full h-full"
        allowFullScreen
        allow="encrypted-media"
        style={{ border: 'none' }}
        onLoad={addDownloadButton}
      ></iframe>
    </div>
  );
};

export default VideoPlayer;
