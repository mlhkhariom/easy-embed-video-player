
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import { fetchIndianChannels, getStreamForChannel, Channel } from '../services/iptv';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Play, Radio } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const LiveTV = () => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: channels, isLoading, error } = useQuery({
    queryKey: ['indian-channels'],
    queryFn: fetchIndianChannels,
  });

  useEffect(() => {
    if (selectedChannel) {
      const fetchStream = async () => {
        const stream = await getStreamForChannel(selectedChannel.id);
        if (stream) {
          setStreamUrl(stream.url);
        } else {
          toast({
            title: "Stream Unavailable",
            description: `No stream found for ${selectedChannel.name}`,
            variant: "destructive",
          });
          setStreamUrl(null);
        }
      };
      
      fetchStream();
    }
  }, [selectedChannel]);

  // Group channels by category
  const categorizedChannels = channels ? 
    channels.reduce((acc: Record<string, Channel[]>, channel) => {
      channel.categories.forEach(category => {
        if (!acc[category]) acc[category] = [];
        acc[category].push(channel);
      });
      return acc;
    }, {}) : {};

  // Get unique categories
  const categories = channels ? 
    Array.from(new Set(channels.flatMap(channel => channel.categories)))
      .filter(Boolean)
      .sort() : [];

  const filteredChannels = activeCategory === 'all' 
    ? channels 
    : (categorizedChannels[activeCategory] || []);

  return (
    <div className="min-h-screen bg-moviemate-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16 pt-24">
        <h1 className="mb-6 text-3xl font-bold text-white">Live TV <span className="text-moviemate-primary">India</span></h1>
        
        {error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load channels. Please try again later.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Player Area */}
            {selectedChannel && (
              <div className="mb-8 overflow-hidden rounded-xl bg-moviemate-card shadow-xl">
                <div className="bg-gradient-to-r from-moviemate-primary/20 to-purple-900/20 p-4">
                  <div className="flex items-center gap-2">
                    {selectedChannel.logo ? (
                      <img 
                        src={selectedChannel.logo} 
                        alt={selectedChannel.name} 
                        className="h-10 w-10 rounded-full bg-black object-contain p-1"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-moviemate-primary/30">
                        <Radio size={20} className="text-white" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedChannel.name}</h2>
                      <p className="text-xs text-gray-400">
                        {selectedChannel.categories.join(' • ')}
                      </p>
                    </div>
                  </div>
                </div>
                
                {streamUrl ? (
                  <div className="aspect-video w-full">
                    <iframe 
                      src={streamUrl}
                      className="h-full w-full"
                      allowFullScreen
                      allow="autoplay; encrypted-media"
                      sandbox="allow-scripts allow-same-origin"
                    ></iframe>
                  </div>
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center bg-black/50">
                    <div className="text-center">
                      <AlertCircle size={40} className="mx-auto mb-2 text-moviemate-primary" />
                      <p className="text-white">Loading stream...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Channel Categories */}
            <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveCategory}>
              <TabsList className="mb-4 grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                <TabsTrigger value="all">All</TabsTrigger>
                {categories.slice(0, 7).map(category => (
                  <TabsTrigger key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value={activeCategory} className="mt-0">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {isLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="overflow-hidden rounded-lg bg-moviemate-card">
                        <Skeleton className="aspect-video w-full" />
                        <div className="p-3">
                          <Skeleton className="mb-2 h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))
                  ) : filteredChannels?.length ? (
                    filteredChannels.map(channel => (
                      <div 
                        key={channel.id}
                        className={`group cursor-pointer overflow-hidden rounded-lg bg-moviemate-card transition-all hover:scale-105 hover:shadow-xl ${
                          selectedChannel?.id === channel.id ? 'ring-2 ring-moviemate-primary' : ''
                        }`}
                        onClick={() => setSelectedChannel(channel)}
                      >
                        <div className="relative aspect-video bg-gradient-to-br from-purple-800/20 to-black/60">
                          {channel.logo ? (
                            <img 
                              src={channel.logo} 
                              alt={channel.name}
                              className="h-full w-full object-contain p-4"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Radio size={30} className="text-white opacity-50" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="rounded-full bg-moviemate-primary/90 p-3 backdrop-blur-sm">
                              <Play size={24} className="text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="mb-1 truncate text-sm font-medium text-white">
                            {channel.name}
                          </h3>
                          <p className="truncate text-xs text-gray-400">
                            {channel.categories.slice(0, 2).join(' • ')}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full rounded-lg bg-moviemate-card p-8 text-center">
                      <AlertCircle size={40} className="mx-auto mb-2 text-moviemate-primary" />
                      <h3 className="text-xl font-medium text-white">No Channels Found</h3>
                      <p className="text-gray-400">
                        No channels available in this category
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
};

export default LiveTV;
