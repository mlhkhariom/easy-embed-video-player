
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CLOUDSTREAM_SOURCES, CloudStreamContent, CloudStreamSource, searchCloudStreamContent } from '../services/cloudstream';
import Navbar from '../components/Navbar';
import { Search, Filter, ExternalLink, Cloud } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useToast } from '../components/ui/use-toast';
import { useAdmin } from '../contexts/AdminContext';
import { useIsMobile } from '@/hooks/use-mobile';

const CloudStream = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  const { settings } = useAdmin();
  const isMobile = useIsMobile();

  // Group sources by category
  const groupedSources: Record<string, CloudStreamSource[]> = CLOUDSTREAM_SOURCES.reduce((acc, source) => {
    const category = source.categories?.[0] || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(source);
    return acc;
  }, {} as Record<string, CloudStreamSource[]>);

  // Categories for tab navigation
  const categories = Object.keys(groupedSources).sort();

  // Search content query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['cloudstreamContent', searchQuery, selectedSources],
    queryFn: () => searchCloudStreamContent(searchQuery, selectedSources.length ? selectedSources : undefined),
    enabled: true,
  });

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchQuery });
    refetch();
  };

  // Toggle source selection
  const toggleSource = (name: string) => {
    setSelectedSources(prev => 
      prev.includes(name) 
        ? prev.filter(s => s !== name) 
        : [...prev, name]
    );
  };

  // Source selector card component
  const SourceCard = ({ source }: { source: CloudStreamSource }) => (
    <div className="flex items-center space-x-3 p-3 rounded-lg bg-moviemate-card/40 backdrop-blur-sm">
      <Checkbox 
        id={`source-${source.name}`} 
        checked={selectedSources.includes(source.name)}
        onCheckedChange={() => toggleSource(source.name)}
      />
      <div className="flex-1">
        <Label htmlFor={`source-${source.name}`} className="font-medium">{source.name}</Label>
        {source.language && (
          <div className="text-xs text-gray-400">{source.language.toUpperCase()}</div>
        )}
      </div>
    </div>
  );

  // Content card component
  const ContentCard = ({ content }: { content: CloudStreamContent }) => (
    <div className="group relative overflow-hidden rounded-lg bg-moviemate-card transition-all hover:scale-105">
      <div 
        className="aspect-[2/3] bg-cover bg-center" 
        style={{ backgroundImage: `url(${content.poster})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"></div>
      </div>
      <div className="absolute bottom-0 w-full p-3">
        <h3 className="text-sm font-bold text-white line-clamp-2">{content.title}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-300">{content.year}</span>
          <span className="text-xs font-medium text-moviemate-primary">{content.source}</span>
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="outline" size="sm" className="gap-2">
          <ExternalLink className="h-4 w-4" />
          View Details
        </Button>
      </div>
    </div>
  );

  if (!settings.enableCloudStream) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold">CloudStream Content</h1>
          <p className="mt-4 text-gray-400">
            The administrator has disabled this feature. Please contact the site administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        <h1 className="mb-8 text-3xl font-bold text-center text-white flex items-center justify-center gap-2">
          <Cloud className="h-8 w-8 text-moviemate-primary" />
          CloudStream Content
        </h1>
        
        <div className="mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  className="pl-8"
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit"
                  className="bg-moviemate-primary hover:bg-moviemate-primary/80"
                >
                  Search
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {showFilters && (
              <div className="rounded-md border border-border bg-card p-4">
                <h4 className="mb-4 text-sm font-medium">Filter by Source</h4>
                <Tabs defaultValue={categories[0]}>
                  <TabsList className="mb-4 grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 overflow-x-auto">
                    {categories.map(category => (
                      <TabsTrigger key={category} value={category} className="capitalize whitespace-nowrap">
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {categories.map(category => (
                    <TabsContent key={category} value={category} className="mt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {groupedSources[category].map(source => (
                          <SourceCard key={source.name} source={source} />
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
                
                {selectedSources.length > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSources([])}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: isMobile ? 6 : 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-moviemate-card/40"></div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
            <h3 className="text-lg font-semibold">Error Loading Content</h3>
            <p className="mt-2">There was an error loading content. Please try again later.</p>
          </div>
        ) : data && data.results.length > 0 ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {data.results.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold">No Results Found</h3>
            <p className="mt-2 text-gray-400">
              {searchQuery 
                ? `No results found for "${searchQuery}". Try a different search term or source.` 
                : 'Start by searching for content or selecting sources.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CloudStream;
