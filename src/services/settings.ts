
import { AdminSettings, PlayerAPI } from '@/types';

export interface Settings extends AdminSettings {}

// Default settings to use as fallback
const defaultSettings: Settings = {
  siteName: 'FreeCinema',
  siteDescription: 'Watch movies and TV shows online for free',
  primaryColor: '#9b87f5',
  secondaryColor: '#7E69AB',
  accentColor: '#6E59A5',
  sidebarBackgroundColor: '#1a1f2c',
  logoUrl: '',
  enableLiveTV: true,
  enableCloudStream: true,
  enableAutoPlay: true,
  enable3DEffects: true,
  enableTrending: false,
  tmdbApiKey: '43d89010b257341339737be36dfaac13',
  customCSS: '',
  featuredContent: {
    movie: null,
    tvShow: null,
  },
  playerAPIs: [
    {
      id: 'vidsrc-icu',
      name: 'VidSrc ICU',
      url: 'https://vidsrc.icu/embed/{type}/{id}/{season}/{episode}',
      isActive: true,
      priority: 1,
      supportsMovies: true,
      supportsTVShows: true,
      supportsIMDB: true,
      supportsTMDB: true,
      description: 'Latest quality with fast streaming speeds'
    },
    {
      id: 'embed-su',
      name: 'Embed.su',
      url: 'https://embed.su/embed/{type}/{id}/{season}/{episode}',
      isActive: true,
      priority: 2,
      supportsMovies: true,
      supportsTVShows: true,
      supportsIMDB: true,
      supportsTMDB: true,
      description: 'Auto updates with new content daily'
    },
    {
      id: 'vidlink-pro',
      name: 'VidLink Pro',
      url: 'https://vidlink.pro/{type}/{id}/{season}/{episode}',
      isActive: true,
      priority: 3,
      supportsMovies: true,
      supportsTVShows: true,
      supportsTMDB: true,
      description: 'Customizable player with extensive library'
    },
    {
      id: 'multiembed-vip',
      name: 'MultiEmbed VIP',
      url: 'https://multiembed.mov/directstream.php?video_id={id}&{type}=1&s={season}&e={episode}',
      isActive: true,
      priority: 4,
      supportsMovies: true,
      supportsTVShows: true,
      supportsIMDB: true,
      supportsTMDB: true,
      supportsAvailabilityCheck: true,
      availabilityCheckUrl: 'https://multiembed.mov/directstream.php?video_id={id}&check=1',
      description: 'Multi quality with minimal ads'
    }
  ],
  playerSettings: {
    autoPlay: true,
    muted: false,
    defaultVolume: 0.8,
    enable3DEffects: true,
    preferredQuality: 'auto'
  }
};

// Fetch settings from localStorage
export const fetchSettings = async (): Promise<Settings> => {
  try {
    const storedSettings = localStorage.getItem('adminSettings');
    if (!storedSettings) return defaultSettings;
    
    const parsedSettings = JSON.parse(storedSettings);
    
    // Ensure playerAPIs exist and have at least one entry
    if (!parsedSettings.playerAPIs || parsedSettings.playerAPIs.length === 0) {
      console.warn('No player APIs found in stored settings, using default player APIs');
      return {
        ...parsedSettings,
        playerAPIs: defaultSettings.playerAPIs
      };
    }
    
    return parsedSettings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return defaultSettings;
  }
};

// Update settings in localStorage
export const updateSettings = async (updates: Partial<Settings>): Promise<Settings> => {
  try {
    const currentSettings = await fetchSettings();
    const updatedSettings = { ...currentSettings, ...updates };
    
    localStorage.setItem('adminSettings', JSON.stringify(updatedSettings));
    return updatedSettings;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw new Error('Failed to update settings');
  }
};

// Get best available player API based on priority
export const getBestPlayerAPI = async (): Promise<PlayerAPI | null> => {
  const settings = await fetchSettings();
  
  // Safely handle the case where playerAPIs might be undefined
  const playerAPIs = settings.playerAPIs || defaultSettings.playerAPIs;
  const activeAPIs = playerAPIs.filter(api => api.isActive);
  
  if (activeAPIs.length === 0) {
    console.warn("No active player APIs found, falling back to default APIs");
    return defaultSettings.playerAPIs[0]; // Return the first default API
  }
  
  // Return the API with the highest priority (lowest number)
  return activeAPIs.sort((a, b) => a.priority - b.priority)[0];
};

// Check if a player API is available for the given content
export const checkPlayerAPIAvailability = async (api: PlayerAPI, id: string): Promise<boolean> => {
  if (!api.supportsAvailabilityCheck || !api.availabilityCheckUrl) {
    return true; // Assume available if no check method
  }
  
  try {
    const checkUrl = api.availabilityCheckUrl.replace('{id}', id);
    const response = await fetch(checkUrl);
    const result = await response.text();
    
    return result === '1'; // Return true if result is "1", false otherwise
  } catch (error) {
    console.error(`Error checking availability for ${api.name}:`, error);
    return false;
  }
};

// Generate player URL with the given API
export const generatePlayerUrl = (api: PlayerAPI, type: 'movie' | 'tv', id: string | number, season?: number, episode?: number): string => {
  let url = api.url;
  
  // Replace placeholders in URL
  url = url.replace(/\{type\}/g, type);
  url = url.replace(/\{id\}/g, id.toString());
  
  // Add season and episode parameters if provided and it's a TV show
  if (type === 'tv' && season && episode) {
    url = url.replace(/\{season\}/g, season.toString());
    url = url.replace(/\{episode\}/g, episode.toString());
  } else {
    // Remove any season/episode placeholders for movies
    url = url.replace(/\/\{season\}\/\{episode\}/g, '');
    url = url.replace(/\&s=\{season\}/g, '');
    url = url.replace(/\&e=\{episode\}/g, '');
  }
  
  // Handle type parameter for MultiEmbed
  if (url.includes('{type}=1')) {
    url = url.replace(/\{type\}=1/g, type === 'movie' ? 'movie=1' : 'tv=1');
  }
  
  // Add API key if available
  if (api.apiKey && url.includes('{api_key}')) {
    url = url.replace(/\{api_key\}/g, api.apiKey);
  }
  
  // Clean up any remaining placeholders
  url = url.replace(/\/\{season\}/g, '');
  url = url.replace(/\/\{episode\}/g, '');
  
  return url;
};

// Find the best available API for a specific content
export const findBestAvailableAPI = async (
  contentId: string | number, 
  imdbId?: string, 
  type: 'movie' | 'tv' = 'movie'
): Promise<{api: PlayerAPI, url: string} | null> => {
  const settings = await fetchSettings();
  
  // Use default APIs if none are configured
  const playerAPIs = settings.playerAPIs?.length > 0 
    ? settings.playerAPIs 
    : defaultSettings.playerAPIs;
  
  if (!playerAPIs || playerAPIs.length === 0) {
    console.error("No player APIs configured, even in defaults");
    throw new Error("No player APIs configured");
  }
  
  const activeAPIs = playerAPIs
    .filter(api => api.isActive)
    .sort((a, b) => a.priority - b.priority);
  
  if (activeAPIs.length === 0) {
    console.warn("No active player APIs, using first default API");
    // Use the first default API as fallback
    const fallbackAPI = defaultSettings.playerAPIs[0];
    const url = generatePlayerUrl(fallbackAPI, type, contentId);
    return { api: fallbackAPI, url };
  }
  
  // First check if we have an IMDB ID, and try APIs that support it
  if (imdbId) {
    const imdbCompatibleAPIs = activeAPIs.filter(api => api.supportsIMDB);
    
    for (const api of imdbCompatibleAPIs) {
      // If API supports availability check, verify it's available
      if (api.supportsAvailabilityCheck) {
        const isAvailable = await checkPlayerAPIAvailability(api, imdbId);
        if (!isAvailable) continue;
      }
      
      const url = generatePlayerUrl(api, type, imdbId);
      return { api, url };
    }
  }
  
  // If no IMDB compatible API worked or no IMDB ID, try with TMDB ID
  const tmdbCompatibleAPIs = activeAPIs.filter(api => api.supportsTMDB);
  
  for (const api of tmdbCompatibleAPIs) {
    // For TMDB APIs, use the contentId directly
    const url = generatePlayerUrl(api, type, contentId);
    return { api, url };
  }
  
  // If we get here, try any active API as a last resort
  if (activeAPIs.length > 0) {
    const firstAPI = activeAPIs[0];
    const url = generatePlayerUrl(firstAPI, type, contentId);
    return { api: firstAPI, url };
  }
  
  // If all else fails, use the first default API
  if (defaultSettings.playerAPIs?.length > 0) {
    const fallbackAPI = defaultSettings.playerAPIs[0];
    const url = generatePlayerUrl(fallbackAPI, type, contentId);
    return { api: fallbackAPI, url };
  }
  
  // If we get here, none of the APIs worked
  return null;
};
