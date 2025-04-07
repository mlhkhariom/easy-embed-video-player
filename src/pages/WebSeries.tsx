
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FadeIn } from '../components/ui/animations';
import { useToast } from '@/components/ui/use-toast';
import { getPopularTvShows } from '../services/tmdb';
import { Filter } from 'lucide-react';

import WebSeriesHeader from '../components/web-series/WebSeriesHeader';
import WebSeriesFilters from '../components/web-series/WebSeriesFilters';
import WebSeriesResults from '../components/web-series/WebSeriesResults';
import { filterWebSeries } from '../services/WebSeriesService';

const WebSeries = () => {
  const [searchParams] = useSearchParams();
  const [webSeries, setWebSeries] = useState<any[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryType] = useState(searchParams.get('category') || 'popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterYear, setFilterYear] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterNetwork, setFilterNetwork] = useState('');
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchWebSeries = async () => {
      setIsLoading(true);
      try {
        const response = await getPopularTvShows();
        const webSeriesResults = filterWebSeries(response.results);
        setWebSeries(webSeriesResults);
        setFilteredSeries(webSeriesResults);
      } catch (error) {
        console.error('Error fetching web series:', error);
        toast({
          title: "Error",
          description: "Failed to load web series data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWebSeries();
  }, [toast]);
  
  useEffect(() => {
    if (!webSeries.length) return;
    
    let results = [...webSeries];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(show => 
        show.name.toLowerCase().includes(query) || 
        (show.overview && show.overview.toLowerCase().includes(query))
      );
    }
    
    if (filterYear) {
      results = results.filter(show => 
        show.first_air_date && show.first_air_date.includes(filterYear)
      );
    }
    
    if (filterLanguage) {
      results = results.filter(show => 
        show.original_language === filterLanguage.toLowerCase()
      );
    }
    
    setFilteredSeries(results);
  }, [searchQuery, filterYear, filterLanguage, filterNetwork, webSeries]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };
  
  const resetFilters = () => {
    setSearchQuery('');
    setFilterYear('');
    setFilterLanguage('');
    setFilterNetwork('');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-moviemate-background via-purple-900/10 to-moviemate-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <WebSeriesHeader 
          showAdvancedFilters={showAdvancedFilters} 
          onFilterToggle={() => setShowAdvancedFilters(!showAdvancedFilters)} 
        />
        
        <FadeIn>
          <WebSeriesFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterYear={filterYear}
            onYearChange={setFilterYear}
            filterLanguage={filterLanguage}
            onLanguageChange={setFilterLanguage}
            onResetFilters={resetFilters}
            showAdvancedFilters={showAdvancedFilters}
            onSubmit={handleSearch}
          />
        </FadeIn>
        
        <WebSeriesResults 
          isLoading={isLoading}
          filteredSeries={filteredSeries}
          onResetFilters={resetFilters}
        />
      </main>
    </div>
  );
};

export default WebSeries;
