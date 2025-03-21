
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Movie } from '../types';
import { getMovieDetails, getMovieExternalIds } from '../services/tmdb';
import Navbar from '../components/Navbar';
import ContentDetails from '../components/ContentDetails';

const MoviePage = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch the movie details
        const movieId = parseInt(id);
        const movieData = await getMovieDetails(movieId);
        
        // Get external IDs (for IMDB ID)
        try {
          const externalIds = await getMovieExternalIds(movieId);
          movieData.imdb_id = externalIds.imdb_id;
        } catch (error) {
          console.error('Error fetching external IDs:', error);
        }
        
        setMovie(movieData);
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setError('Failed to load movie details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMovieDetails();
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
        ) : movie ? (
          <ContentDetails content={movie} type="movie" />
        ) : null}
      </main>
    </div>
  );
};

export default MoviePage;
