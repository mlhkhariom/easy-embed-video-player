
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TvShow } from '../types';
import { getTvShowDetails, getTvExternalIds } from '../services/tmdb';
import Navbar from '../components/Navbar';
import ContentDetails from '../components/ContentDetails';
import { Card } from '@/components/ui/card';
import ContentHeader from '../components/content/ContentHeader';
import PlayerSection from '../components/content/PlayerSection';
import SeasonEpisodeSelector from '../components/content/SeasonEpisodeSelector';

const TvShowPage = () => {
  const { id } = useParams<{ id: string }>();
  const [tvShow, setTvShow] = useState<TvShow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  
  useEffect(() => {
    const fetchTvShowDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        setShowPlayer(false);
        
        // Fetch the TV show details
        const tvId = parseInt(id);
        const tvData = await getTvShowDetails(tvId);
        
        // Get external IDs (for IMDB ID)
        try {
          const externalIds = await getTvExternalIds(tvId);
          tvData.imdb_id = externalIds.imdb_id;
        } catch (error) {
          console.error('Error fetching external IDs:', error);
        }
        
        setTvShow(tvData);
        
        // Set initial season and episode if available
        if (tvData.seasons && tvData.seasons.length > 0) {
          const firstRegularSeason = tvData.seasons.find(s => s.season_number > 0);
          if (firstRegularSeason) {
            setSelectedSeason(firstRegularSeason.season_number);
          }
        }
      } catch (error) {
        console.error('Error fetching TV show details:', error);
        setError('Failed to load TV show details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTvShowDetails();
  }, [id]);
  
  // Format TV show details for header
  const getFormattedTvShowDetails = () => {
    if (!tvShow) return { title: '', formattedDate: '', formattedRuntime: '', rating: '' };
    
    const title = tvShow.name;
    const formattedDate = tvShow.first_air_date 
      ? new Date(tvShow.first_air_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : '';
    
    const formattedRuntime = tvShow.number_of_seasons 
      ? `${tvShow.number_of_seasons} Season${tvShow.number_of_seasons > 1 ? 's' : ''}`
      : '';
    
    const rating = tvShow.vote_average ? tvShow.vote_average.toFixed(1) : '0.0';
    
    return { title, formattedDate, formattedRuntime, rating };
  };
  
  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeason(parseInt(e.target.value));
    setSelectedEpisode(1); // Reset episode when season changes
  };
  
  const handleEpisodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEpisode(parseInt(e.target.value));
  };
  
  const { title, formattedDate, formattedRuntime, rating } = getFormattedTvShowDetails();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {isLoading ? (
          <Card className="w-full p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-2/3 rounded-md bg-muted"></div>
              <div className="h-4 w-1/3 rounded-md bg-muted"></div>
              <div className="h-32 w-full rounded-md bg-muted"></div>
            </div>
          </Card>
        ) : error ? (
          <Card className="w-full p-8 border-red-500/20 bg-red-500/10">
            <h2 className="mb-4 text-2xl font-bold">Error</h2>
            <p>{error}</p>
          </Card>
        ) : tvShow ? (
          <div className="space-y-8">
            {/* Content Header with Backdrop */}
            <ContentHeader 
              content={tvShow} 
              type="tv"
              title={title}
              formattedDate={formattedDate}
              formattedRuntime={formattedRuntime}
              rating={rating}
              showPlayer={showPlayer}
              setShowPlayer={setShowPlayer}
            />
            
            {/* Season and Episode Selector */}
            {showPlayer && (
              <SeasonEpisodeSelector 
                seasons={tvShow.seasons || null}
                selectedSeason={selectedSeason}
                selectedEpisode={selectedEpisode}
                onSeasonChange={handleSeasonChange}
                onEpisodeChange={handleEpisodeChange}
              />
            )}
            
            {/* Player Section */}
            <PlayerSection 
              showPlayer={showPlayer}
              isMovie={false}
              contentId={tvShow.id}
              imdbId={tvShow.imdb_id}
              selectedSeason={selectedSeason}
              selectedEpisode={selectedEpisode}
              title={tvShow.name}
            />
            
            {/* Additional Details */}
            <ContentDetails content={tvShow} type="tv" />
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default TvShowPage;
