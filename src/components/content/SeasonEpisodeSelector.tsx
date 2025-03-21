
import { Season } from '../../types';

interface SeasonEpisodeSelectorProps {
  seasons: Season[] | null;
  selectedSeason: number;
  selectedEpisode: number;
  onSeasonChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onEpisodeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SeasonEpisodeSelector = ({
  seasons,
  selectedSeason,
  selectedEpisode,
  onSeasonChange,
  onEpisodeChange
}: SeasonEpisodeSelectorProps) => {
  if (!seasons) return null;
  
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="season" className="mb-1 block text-sm font-medium text-gray-300">
          Season
        </label>
        <select
          id="season"
          value={selectedSeason}
          onChange={onSeasonChange}
          className="w-full rounded-lg border border-gray-700 bg-moviemate-card px-4 py-2 text-white"
        >
          {seasons.filter(season => season.season_number > 0).map((season) => (
            <option key={season.id} value={season.season_number}>
              {season.name}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="episode" className="mb-1 block text-sm font-medium text-gray-300">
          Episode
        </label>
        <select
          id="episode"
          value={selectedEpisode}
          onChange={onEpisodeChange}
          className="w-full rounded-lg border border-gray-700 bg-moviemate-card px-4 py-2 text-white"
        >
          {Array.from({ length: getCurrentSeasonEpisodeCount(seasons, selectedSeason) }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              Episode {i + 1}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// Helper function to get episode count for the current season
const getCurrentSeasonEpisodeCount = (seasons: Season[] | null, seasonNumber: number): number => {
  if (!seasons) return 0;
  
  const currentSeason = seasons.find((s) => s.season_number === seasonNumber);
  return currentSeason?.episode_count || 0;
};

export default SeasonEpisodeSelector;
