
import { useState, useEffect } from 'react';

interface VideoPlayerProps {
  tmdbId?: number;
  imdbId?: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
}

const VideoPlayer = ({ tmdbId, imdbId, type, season, episode }: VideoPlayerProps) => {
  const [playerUrl, setPlayerUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset states when props change
    setIsLoading(true);
    
    // Construct the player URL based on available IDs
    if (tmdbId) {
      if (type === 'movie') {
        setPlayerUrl(`https://vidsrc.dev/embed/movie/${tmdbId}`);
      } else if (type === 'tv' && season && episode) {
        setPlayerUrl(`https://vidsrc.dev/embed/tv/${tmdbId}/${season}/${episode}`);
      }
    } else if (imdbId) {
      if (type === 'movie') {
        setPlayerUrl(`https://vidsrc.dev/embed/movie/${imdbId}`);
      } else if (type === 'tv' && season && episode) {
        setPlayerUrl(`https://vidsrc.dev/embed/tv/${imdbId}/${season}/${episode}`);
      }
    }
    
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [tmdbId, imdbId, type, season, episode]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-moviemate-card shadow-xl">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-moviemate-card">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-moviemate-primary border-t-transparent"></div>
            <p className="text-sm text-gray-300">Loading player...</p>
          </div>
        </div>
      )}
      
      {playerUrl && (
        <iframe
          src={playerUrl}
          className="h-full w-full border-0"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          loading="lazy"
          onLoad={() => setIsLoading(false)}
        ></iframe>
      )}
    </div>
  );
};

export default VideoPlayer;
