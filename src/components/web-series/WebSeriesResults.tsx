
import { StaggerContainer, StaggerItem, ScrollReveal } from '../../components/ui/animations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardsGridSkeleton } from '../../components/ui/loaders';
import MovieCard from '../../components/MovieCard';
import { Globe } from 'lucide-react';

interface WebSeriesResultsProps {
  isLoading: boolean;
  filteredSeries: any[];
  onResetFilters: () => void;
}

const WebSeriesResults = ({
  isLoading,
  filteredSeries,
  onResetFilters
}: WebSeriesResultsProps) => {
  if (isLoading) {
    return <CardsGridSkeleton count={12} />;
  }
  
  if (filteredSeries.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-400">No web series found</p>
        <p className="text-gray-500 mt-2">
          Try adjusting your filters or search criteria
        </p>
        <Button onClick={onResetFilters} className="mt-4">
          Reset Filters
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <StaggerContainer>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredSeries.map((show) => (
            <StaggerItem key={show.id}>
              <div className="group relative">
                <MovieCard
                  item={show}
                  type="tv"
                />
                {show.networks && show.networks[0] && (
                  <Badge 
                    className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm" 
                    variant="outline"
                  >
                    {show.networks[0].name}
                  </Badge>
                )}
              </div>
            </StaggerItem>
          ))}
        </div>
      </StaggerContainer>
      
      {filteredSeries.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button variant="outline" size="lg">
            Load More
          </Button>
        </div>
      )}
      
      <ScrollReveal>
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6">
            Popular Streaming Platforms
          </h2>
          
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {['Netflix', 'Amazon Prime', 'Disney+', 'HBO Max', 'Hulu', 'Apple TV+'].map((platform) => (
              <div
                key={platform}
                className="bg-moviemate-card p-4 rounded-lg text-center hover:bg-moviemate-card/80 transition-colors"
              >
                <div className="w-16 h-16 mx-auto bg-moviemate-primary/20 rounded-full flex items-center justify-center mb-2">
                  <Globe className="h-8 w-8 text-moviemate-primary" />
                </div>
                <p className="font-medium text-white">{platform}</p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </>
  );
};

export default WebSeriesResults;
