
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TvShow } from '../types';
import { getTvShowDetails, getTvExternalIds } from '../services/tmdb';
import Navbar from '../components/Navbar';
import ContentDetails from '../components/ContentDetails';
import { Card } from '@/components/ui/card';

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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24">
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
          <ContentDetails content={tvShow} type="tv" />
        ) : null}
      </main>
    </div>
  );
};

export default TvShowPage;
