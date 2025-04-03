
import { AdminSettings } from '@/types';

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
  enableAutoPlay: true,
  enable3DEffects: true,
  enableTrending: false,
  enableCloudStream: false,
  selectedCountry: 'global',
  tmdbApiKey: '43d89010b257341339737be36dfaac13',
  customCSS: '',
  featuredContent: {
    movie: null,
    tvShow: null,
  },
  playerSettings: {
    defaultQuality: 'auto',
    autoplay: true,
    preload: true,
    subtitlesEnabled: true,
    defaultSubtitleLanguage: 'en',
    playbackSpeed: 1.0
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
