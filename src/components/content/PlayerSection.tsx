
import VideoPlayer from '../VideoPlayer';

interface PlayerSectionProps {
  showPlayer: boolean;
  isMovie: boolean;
  contentId: number;
  imdbId?: string;
  selectedSeason?: number;
  selectedEpisode?: number;
}

const PlayerSection = ({
  showPlayer,
  isMovie,
  contentId,
  imdbId,
  selectedSeason,
  selectedEpisode
}: PlayerSectionProps) => {
  if (!showPlayer) return null;
  
  return (
    <div className="mb-12 animate-scale-in">
      <h2 className="mb-4 text-2xl font-bold text-white">
        {isMovie ? 'Movie Player' : `Season ${selectedSeason}, Episode ${selectedEpisode}`}
      </h2>
      <VideoPlayer
        tmdbId={contentId}
        imdbId={imdbId}
        type={isMovie ? 'movie' : 'tv'}
        season={!isMovie ? selectedSeason : undefined}
        episode={!isMovie ? selectedEpisode : undefined}
      />
    </div>
  );
};

export default PlayerSection;
