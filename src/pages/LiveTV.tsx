import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import { fetchIndianChannels, getStreamForChannel, Channel, getChannelsByCategory } from '../services/iptv';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Play, Radio } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from 'framer-motion';
import { useAdmin } from '../contexts/AdminContext';

const LiveTV = () => {
  const { settings, liveTVCategories, featuredChannels } = useAdmin();
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

  const categorizedChannels = channels ? 
    channels.reduce((acc: Record<string, Channel[]>, channel) => {
      channel.categories.forEach(category => {
        if (!acc[category]) acc[category] = [];
        acc[category].push(channel);
      });
      return acc;
    }, {}) : {};

  const categories = channels ? 
    Array.from(new Set(channels.flatMap(channel => channel.categories)))
      .filter(category => {
        if (liveTVCategories.length > 0) {
          const adminCategory = liveTVCategories.find(cat => cat.id === category);
          return adminCategory ? adminCategory.enabled : false;
        }
        return Boolean(category);
      })
      .sort((a, b) => {
        if (liveTVCategories.length > 0) {
          const catA = liveTVCategories.find(cat => cat.id === a);
          const catB = liveTVCategories.find(cat => cat.id === b);
          return (catA?.order || 0) - (catB?.order || 0);
        }
        return a.localeCompare(b);
      }) : [];

  const filteredChannels = activeCategory === 'all' 
    ? channels 
    : (categorizedChannels[activeCategory] || []);

  const featuredChannelsList = channels ? 
    channels.filter(channel => featuredChannels.includes(channel.id)) 
    : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    },
    hover: {
      y: -10,
      scale: 1.05,
      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
      transition: {
        type: 'spring',
        stiffness: 200
      }
    }
  };

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
            {selectedChannel && (
              <motion.div 
                className="mb-8 overflow-hidden rounded-xl bg-moviemate-card shadow-xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
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
                      <motion.div
                        animate={{
                          opacity: [0.5, 1, 0.5],
                          scale: [0.98, 1.02, 0.98]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <AlertCircle size={40} className="mx-auto mb-2 text-moviemate-primary" />
                        <p className="text-white">Loading stream...</p>
                      </motion.div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
            
            {featuredChannelsList.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-xl font-semibold text-white">Featured Channels</h2>
                <motion.div 
                  className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {featuredChannelsList.map(channel => (
                    <motion.div 
                      key={channel.id}
                      className={`group cursor-pointer overflow-hidden rounded-lg bg-gradient-to-br from-moviemate-primary/10 to-purple-900/5 transition-all ${
                        selectedChannel?.id === channel.id ? 'ring-2 ring-moviemate-primary' : ''
                      }`}
                      onClick={() => setSelectedChannel(channel)}
                      variants={cardVariants}
                      whileHover="hover"
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
                        <motion.div 
                          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                        >
                          <motion.div 
                            className="rounded-full bg-moviemate-primary/90 p-3 backdrop-blur-sm"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Play size={24} className="text-white" />
                          </motion.div>
                        </motion.div>
                      </div>
                      <div className="p-3">
                        <h3 className="mb-1 truncate text-sm font-medium text-white">
                          {channel.name}
                        </h3>
                        <p className="truncate text-xs text-gray-400">
                          {channel.categories.slice(0, 2).join(' • ')}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}
            
            <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveCategory}>
              <TabsList className="mb-4 grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                <TabsTrigger value="all">All</TabsTrigger>
                {categories.slice(0, 7).map(category => (
                  <TabsTrigger key={category} value={category}>
                    {liveTVCategories.find(cat => cat.id === category)?.name || 
                      category.charAt(0).toUpperCase() + category.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value={activeCategory} className="mt-0">
                <motion.div 
                  className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
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
                      <motion.div 
                        key={channel.id}
                        className={`group cursor-pointer overflow-hidden rounded-lg bg-moviemate-card transition-all ${
                          selectedChannel?.id === channel.id ? 'ring-2 ring-moviemate-primary' : ''
                        }`}
                        onClick={() => setSelectedChannel(channel)}
                        variants={cardVariants}
                        whileHover="hover"
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
                          <motion.div 
                            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                          >
                            <motion.div 
                              className="rounded-full bg-moviemate-primary/90 p-3 backdrop-blur-sm"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Play size={24} className="text-white" />
                            </motion.div>
                          </motion.div>
                        </div>
                        <div className="p-3">
                          <h3 className="mb-1 truncate text-sm font-medium text-white">
                            {channel.name}
                          </h3>
                          <p className="truncate text-xs text-gray-400">
                            {channel.categories.slice(0, 2).join(' • ')}
                          </p>
                        </div>
                      </motion.div>
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
                </motion.div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
};

export default LiveTV;
