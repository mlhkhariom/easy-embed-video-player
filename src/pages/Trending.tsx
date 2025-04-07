
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from '../components/ui/animations';
import { GradientText, Parallax } from '../components/ui/effects';
import { CardSkeleton, CardsGridSkeleton } from '../components/ui/loaders';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { getTrendingContent } from '../services/tmdb';
import { TrendingUp, Film, Tv, Clock, Calendar } from 'lucide-react';

const Trending = () => {
  const [trendingContent, setTrendingContent] = useState<any[]>([]);
  const [contentType, setContentType] = useState<'all' | 'movie' | 'tv'>('all');
  const [timeWindow, setTimeWindow] = useState<'day' | 'week'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchTrendingContent = async () => {
      setIsLoading(true);
      try {
        const data = await getTrendingContent(contentType, timeWindow);
        setTrendingContent(data.results);
      } catch (error) {
        console.error('Failed to fetch trending content:', error);
        toast({
          title: "Error",
          description: "Failed to load trending content",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrendingContent();
  }, [contentType, timeWindow, toast]);
  
  const goToDetails = (id: number, type: 'movie' | 'tv') => {
    navigate(`/${type}/${id}`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-moviemate-background to-purple-900/20">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <FadeIn>
          <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold text-white">
                <TrendingUp className="h-8 w-8 text-moviemate-primary" />
                <span>Trending</span>
              </h1>
              <p className="text-gray-400 mt-1">
                Discover what's popular right now
              </p>
            </div>
            
            <div className="flex space-x-2 items-center">
              <Button 
                variant={timeWindow === 'day' ? "default" : "outline"} 
                size="sm"
                onClick={() => setTimeWindow('day')}
                className="flex items-center gap-2"
              >
                <Clock size={16} />
                Today
              </Button>
              <Button 
                variant={timeWindow === 'week' ? "default" : "outline"} 
                size="sm"
                onClick={() => setTimeWindow('week')}
                className="flex items-center gap-2"
              >
                <Calendar size={16} />
                This Week
              </Button>
            </div>
          </div>
          
          <Tabs
            defaultValue="all"
            value={contentType}
            onValueChange={(value) => setContentType(value as 'all' | 'movie' | 'tv')}
            className="mb-8"
          >
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="movie" className="flex items-center gap-2">
                <Film size={16} />
                Movies
              </TabsTrigger>
              <TabsTrigger value="tv" className="flex items-center gap-2">
                <Tv size={16} />
                TV Shows
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </FadeIn>
        
        {isLoading ? (
          <CardsGridSkeleton count={12} />
        ) : (
          <>
            {/* Hero section - first trending item */}
            {trendingContent.length > 0 && (
              <SlideUp>
                <div 
                  className="relative w-full h-[50vh] rounded-xl overflow-hidden mb-8 bg-cover bg-center"
                  style={{ 
                    backgroundImage: `url(https://image.tmdb.org/t/p/original${trendingContent[0].backdrop_path})` 
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <GradientText className="text-3xl font-bold mb-2">
                      {trendingContent[0].title || trendingContent[0].name}
                    </GradientText>
                    <p className="text-white mb-4 line-clamp-2">
                      {trendingContent[0].overview}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => goToDetails(
                          trendingContent[0].id, 
                          trendingContent[0].title ? 'movie' : 'tv'
                        )}
                      >
                        View Details
                      </Button>
                      <Button variant="outline">
                        Add to Watchlist
                      </Button>
                    </div>
                  </div>
                </div>
              </SlideUp>
            )}
            
            {/* Trending grid */}
            <Parallax speed={0.05} direction="up">
              <h2 className="text-2xl font-bold text-white mb-6">
                Trending {contentType === 'movie' ? 'Movies' : contentType === 'tv' ? 'TV Shows' : 'Content'}
              </h2>
            </Parallax>
            
            <StaggerContainer>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {trendingContent.map((item) => {
                  const type = item.media_type || (item.title ? 'movie' : 'tv');
                  return (
                    <StaggerItem key={item.id}>
                      <MovieCard
                        item={item}
                        type={type}
                      />
                    </StaggerItem>
                  );
                })}
              </div>
            </StaggerContainer>
            
            {trendingContent.length === 0 && (
              <div className="text-center py-20">
                <p className="text-xl text-gray-400">No trending content found</p>
                <p className="text-gray-500 mt-2">Try changing your filters</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Trending;
