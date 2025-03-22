
import React, { createContext, useState, useContext, useEffect } from 'react';
import { AdminSettings, AdminUser, LiveTVCategory } from '../types';

interface AdminContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  settings: AdminSettings;
  updateSettings: (newSettings: Partial<AdminSettings>) => void;
  liveTVCategories: LiveTVCategory[];
  updateLiveTVCategories: (categories: LiveTVCategory[]) => void;
  featuredChannels: string[];
  updateFeaturedChannels: (channels: string[]) => void;
}

const defaultSettings: AdminSettings = {
  siteName: 'FreeCinema',
  siteDescription: 'Watch movies and TV shows online for free',
  primaryColor: '#9b87f5', // Default moviemate-primary color
  logoUrl: '',
  enableLiveTV: true,
  enableAutoPlay: true,
  enable3DEffects: true,
  tmdbApiKey: '43d89010b257341339737be36dfaac13',
  customCSS: '',
  featuredContent: {
    movie: null,
    tvShow: null,
  },
};

// Default admin credentials
const DEFAULT_ADMIN: AdminUser = {
  email: 'admin@redxerox.eu.org',
  password: 'Admin@123',
  name: 'Admin',
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [settings, setSettings] = useState<AdminSettings>(
    JSON.parse(localStorage.getItem('adminSettings') || JSON.stringify(defaultSettings))
  );
  const [liveTVCategories, setLiveTVCategories] = useState<LiveTVCategory[]>(
    JSON.parse(localStorage.getItem('liveTVCategories') || '[]')
  );
  const [featuredChannels, setFeaturedChannels] = useState<string[]>(
    JSON.parse(localStorage.getItem('featuredChannels') || '[]')
  );

  // Check if the user is already authenticated
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
      setIsAuthenticated(true);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
  }, [settings]);

  // Save Live TV categories to localStorage when they change
  useEffect(() => {
    localStorage.setItem('liveTVCategories', JSON.stringify(liveTVCategories));
  }, [liveTVCategories]);

  // Save featured channels to localStorage when they change
  useEffect(() => {
    localStorage.setItem('featuredChannels', JSON.stringify(featuredChannels));
  }, [featuredChannels]);

  const login = (email: string, password: string): boolean => {
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
      localStorage.setItem('adminAuth', 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
  };

  const updateSettings = (newSettings: Partial<AdminSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateLiveTVCategories = (categories: LiveTVCategory[]) => {
    setLiveTVCategories(categories);
  };

  const updateFeaturedChannels = (channels: string[]) => {
    setFeaturedChannels(channels);
  };

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        settings,
        updateSettings,
        liveTVCategories,
        updateLiveTVCategories,
        featuredChannels,
        updateFeaturedChannels,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
