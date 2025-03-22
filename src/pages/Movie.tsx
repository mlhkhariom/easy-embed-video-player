
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Movie } from '../types';
import { getMovieDetails, getMovieExternalIds } from '../services/tmdb';
import Navbar from '../components/Navbar';
import ContentDetails from '../components/ContentDetails';
import { Card } from '@/components/ui/card';
import ContentHeader from '../components/content/ContentHeader';
import PlayerSection from '../components/content/PlayerSection';

const MoviePage = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  
  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        setShowPlayer(false);
        
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
  
  // Format movie details for header
  const getFormattedMovieDetails = () => {
    if (!movie) return { title: '', formattedDate: '', formattedRuntime: '', rating: '' };
    
    const title = movie.title;
    const formattedDate = movie.release_date 
      ? new Date(movie.release_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : '';
    
    const formattedRuntime = movie.runtime 
      ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
      : '';
    
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '0.0';
    
    return { title, formattedDate, formattedRuntime, rating };
  };
  
  const { title, formattedDate, formattedRuntime, rating } = getFormattedMovieDetails();
  
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
        ) : movie ? (
          <div className="space-y-8">
            {/* Content Header with Backdrop */}
            <ContentHeader 
              content={movie} 
              type="movie"
              title={title}
              formattedDate={formattedDate}
              formattedRuntime={formattedRuntime}
              rating={rating}
              showPlayer={showPlayer}
              setShowPlayer={setShowPlayer}
            />
            
            {/* Player Section */}
            <PlayerSection 
              showPlayer={showPlayer}
              isMovie={true}
              contentId={movie.id}
              imdbId={movie.imdb_id}
              title={movie.title}
            />
            
            {/* Additional Details */}
            <ContentDetails content={movie} type="movie" />
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default MoviePage;
