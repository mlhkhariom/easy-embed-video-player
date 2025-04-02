
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TvShow } from '../types';
import { getWebSeries } from '../services/tmdb';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { handleAPIError } from '../services/error-handler';
import ErrorHandler from '../components/ErrorHandler';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';

const WebSeries = () => {
  const [webSeries, setWebSeries] = useState<TvShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchWebSeries = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await getWebSeries(currentPage);
        
        // Filter to ensure only web series content is displayed
        // Web series typically have limited seasons/episodes compared to TV serials
        const filteredData = data.results.filter(show => {
          // Explicit check for web_series type first
          if (show.show_type === 'web_series') return true;
          
          // Additional criteria to identify web series
          return (
            (!show.number_of_seasons || show.number_of_seasons < 5) && 
            (!show.number_of_episodes || show.number_of_episodes < 50) &&
            show.show_type !== 'tv_serial' &&
            (show.vote_average >= 6.5) // Higher quality content is more likely to be a web series
          );
        });
        
        setWebSeries(filteredData);
        setTotalPages(data.total_pages > 20 ? 20 : data.total_pages); // Limit to max 20 pages
      } catch (error) {
        console.error('Error fetching web series:', error);
        setError(error as Error);
        const errorMessage = handleAPIError(error);
        toast({
          title: "Error loading web series",
          description: errorMessage.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWebSeries();
  }, [currentPage, toast]);
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };
  
  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    
    // Add first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink 
          onClick={() => handlePageChange(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Add ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <span className="px-4">...</span>
        </PaginationItem>
      );
    }
    
    // Add pages around current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = startPage; i <= endPage; i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last page as they're added separately
      
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Add ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <span className="px-4">...</span>
        </PaginationItem>
      );
    }
    
    // Add last page if it's different from the first page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink 
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };
  
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24">
          <ErrorHandler error={error} />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Web Series</h1>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 20 }).map((_, index) => (
              <div key={index} className="animate-pulse space-y-2">
                <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : webSeries.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg bg-moviemate-card p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold">No Web Series Found</h2>
            <p className="mb-6 text-gray-400">Try a different page or check back later for new content.</p>
            <Button onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {webSeries.map((show) => (
                <MovieCard 
                  key={show.id} 
                  item={show}
                  type="tv"
                />
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span className="sr-only">Previous page</span>
                    </Button>
                  </PaginationItem>
                  
                  {!isMobile && generatePaginationItems()}
                  
                  {isMobile && (
                    <PaginationItem>
                      <span className="px-2 text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowRight className="h-4 w-4" />
                      <span className="sr-only">Next page</span>
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default WebSeries;
