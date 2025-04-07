
import { Tv, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FadeIn } from '../ui/animations';

interface WebSeriesHeaderProps {
  showAdvancedFilters: boolean;
  onFilterToggle: () => void;
}

const WebSeriesHeader = ({ showAdvancedFilters, onFilterToggle }: WebSeriesHeaderProps) => {
  return (
    <FadeIn>
      <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-white">
            <Tv className="h-8 w-8 text-moviemate-primary" />
            <span>Web Series</span>
          </h1>
          <p className="text-gray-400 mt-1">
            Discover premium streaming shows from around the world
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={onFilterToggle}
          className="flex items-center gap-2"
        >
          <Filter size={16} />
          {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>
    </FadeIn>
  );
};

export default WebSeriesHeader;
