
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TvShow } from '../types';
import { getWebSeries, isWebSeries } from '../services/tmdb';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { handleAPIError } from '../services/error-handler';
import ErrorHandler from '../components/ErrorHandler';
import { ArrowLeft, ArrowRight, Filter, FilterX } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

// Define filter options for web series
interface FilterOptions {
  rating: number | null;
  yearFrom: number | null;
  yearTo: number | null;
  languages: string[];
}

const WebSeries = () => {
  const [webSeries, setWebSeries] = useState<TvShow[]>([]);
  const [allWebSeries, setAllWebSeries] = useState<TvShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    rating: null,
    yearFrom: null,
    yearTo: null,
    languages: []
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchWebSeries = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await getWebSeries(currentPage);
        
        // Extra filtering to ensure only true web series are displayed
        const filteredData = data.results.filter(show => {
          // Use our enhanced isWebSeries function
          return isWebSeries(show);
        });
        
        setWebSeries(filteredData);
        setAllWebSeries(filteredData);
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
  
  // Apply local filters
  useEffect(() => {
    if (allWebSeries.length > 0) {
      let filtered = [...allWebSeries];
      
      // Apply rating filter
      if (filters.rating) {
        filtered = filtered.filter(show => show.vote_average >= filters.rating!);
      }
      
      // Apply year filters
      if (filters.yearFrom || filters.yearTo) {
        filtered = filtered.filter(show => {
          if (!show.first_air_date) return false;
          
          const year = parseInt(show.first_air_date.substring(0, 4));
          const matchesFrom = !filters.yearFrom || year >= filters.yearFrom;
          const matchesTo = !filters.yearTo || year <= filters.yearTo;
          
          return matchesFrom && matchesTo;
        });
      }
      
      // Apply language filters
      if (filters.languages.length > 0) {
        filtered = filtered.filter(show => 
          filters.languages.includes(show.original_language || '')
        );
      }
      
      setWebSeries(filtered);
    }
  }, [filters, allWebSeries]);
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      rating: null,
      yearFrom: null,
      yearTo: null,
      languages: []
    });
    setWebSeries(allWebSeries);
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
  
  // Language options
  const languageOptions = [
    { id: "hi", label: "Hindi" },
    { id: "en", label: "English" },
    { id: "ta", label: "Tamil" },
    { id: "te", label: "Telugu" },
    { id: "ml", label: "Malayalam" },
    { id: "bn", label: "Bengali" },
  ];
  
  // Rating options
  const ratingOptions = [
    { value: 8, label: "8+ Excellent" },
    { value: 7, label: "7+ Good" },
    { value: 6, label: "6+ Average" },
  ];
  
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
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Filter Web Series</SheetTitle>
              </SheetHeader>
              
              <div className="py-4">
                <Separator className="mb-4" />
                
                <div className="space-y-6">
                  {/* Rating filter */}
                  <div>
                    <h3 className="mb-2 text-sm font-medium">Minimum Rating</h3>
                    <div className="space-y-2">
                      {ratingOptions.map((option) => (
                        <div key={option.value} className="flex items-center gap-2">
                          <Checkbox 
                            id={`rating-${option.value}`}
                            checked={filters.rating === option.value}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFilters(prev => ({ ...prev, rating: option.value }));
                              } else if (filters.rating === option.value) {
                                setFilters(prev => ({ ...prev, rating: null }));
                              }
                            }}
                          />
                          <Label htmlFor={`rating-${option.value}`}>{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Language filter */}
                  <div>
                    <h3 className="mb-2 text-sm font-medium">Language</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {languageOptions.map((lang) => (
                        <div key={lang.id} className="flex items-center gap-2">
                          <Checkbox 
                            id={`lang-${lang.id}`}
                            checked={filters.languages.includes(lang.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFilters(prev => ({ 
                                  ...prev, 
                                  languages: [...prev.languages, lang.id] 
                                }));
                              } else {
                                setFilters(prev => ({ 
                                  ...prev, 
                                  languages: prev.languages.filter(l => l !== lang.id)
                                }));
                              }
                            }}
                          />
                          <Label htmlFor={`lang-${lang.id}`}>{lang.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <SheetFooter>
                <Button variant="outline" onClick={resetFilters} className="gap-2">
                  <FilterX className="h-4 w-4" />
                  Reset Filters
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
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
