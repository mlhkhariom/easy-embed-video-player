
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TvShow } from '../types';
import { getTvShowDetails, getTvExternalIds } from '../services/tmdb';
import Navbar from '../components/Navbar';
import ContentDetails from '../components/ContentDetails';

const TvShowPage = () => {
  const { id } = useParams<{ id: string }>();
  const [tvShow, setTvShow] = useState<TvShow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTvShowDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
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
      } catch (error) {
        console.error('Error fetching TV show details:', error);
        setError('Failed to load TV show details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTvShowDetails();
  }, [id]);
  
  return (
    <div className="min-h-screen bg-moviemate-background">
      <Navbar />
      
      <main className="animate-fade-in">
        {isLoading ? (
          <div className="container mx-auto px-4 pt-24">
            <div className="animate-pulse">
              <div className="h-96 rounded-xl bg-moviemate-card"></div>
            </div>
          </div>
        ) : error ? (
          <div className="container mx-auto px-4 pt-24 text-center">
            <div className="rounded-xl bg-red-500/20 p-8">
              <h2 className="mb-4 text-2xl font-bold text-white">Error</h2>
              <p className="text-gray-300">{error}</p>
            </div>
          </div>
        ) : tvShow ? (
          <ContentDetails content={tvShow} type="tv" />
        ) : null}
      </main>
    </div>
  );
};

export default TvShowPage;
