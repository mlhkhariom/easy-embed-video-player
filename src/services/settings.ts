
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
      id: 'vidsrc',
      name: 'VidSrc',
      url: 'https://vidsrc.dev/embed/{type}/{id}',
      isActive: true,
      priority: 1
    },
    {
      id: 'superembed',
      name: 'SuperEmbed',
      url: 'https://multiembed.mov/directstream.php?video_id={id}&{type}=1',
      isActive: true,
      priority: 2
    },
    {
      id: 'dbgo',
      name: 'DBGO',
      url: 'https://dbgo.fun/imdb.php?id={id}',
      isActive: true,
      priority: 3
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
    return storedSettings ? JSON.parse(storedSettings) : defaultSettings;
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
  const playerAPIs = settings.playerAPIs || [];
  const activeAPIs = playerAPIs.filter(api => api.isActive);
  
  if (activeAPIs.length === 0) return null;
  
  // Return the API with the highest priority (lowest number)
  return activeAPIs.sort((a, b) => a.priority - b.priority)[0];
};

// Generate player URL with the given API
export const generatePlayerUrl = (api: PlayerAPI, type: 'movie' | 'tv', id: string | number, season?: number, episode?: number): string => {
  let url = api.url;
  
  // Replace placeholders in URL
  url = url.replace('{type}', type);
  url = url.replace('{id}', id.toString());
  
  // Add season and episode parameters if provided and it's a TV show
  if (type === 'tv' && season && episode) {
    if (url.includes('{season}')) {
      url = url.replace('{season}', season.toString());
    } else {
      // Add season parameter if not in template
      url += url.includes('?') ? '&' : '?';
      url += `season=${season}`;
    }
    
    if (url.includes('{episode}')) {
      url = url.replace('{episode}', episode.toString());
    } else {
      // Add episode parameter if not in template
      url += url.includes('?') ? '&' : '?';
      url += `episode=${episode}`;
    }
  }
  
  // Add API key if available
  if (api.apiKey && url.includes('{api_key}')) {
    url = url.replace('{api_key}', api.apiKey);
  }
  
  return url;
};
