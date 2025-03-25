
// src/types/index.ts

export interface AdminUser {
  email: string;
  password: string;
  name: string;
}

export interface AdminSettings {
  siteName: string;
  siteDescription: string;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  sidebarBackgroundColor?: string;
  logoUrl: string;
  enableLiveTV: boolean;
  enableCloudStream: boolean;
  enableAutoPlay: boolean;
  enable3DEffects: boolean;
  tmdbApiKey: string;
  customCSS: string;
  featuredContent: {
    movie: number | null;
    tvShow: number | null;
  };
}

export interface LiveTVCategory {
  id: string;
  name: string;
  order: number;
  icon: string;
  isEnabled: boolean;
}

export interface M3UData {
  url: string;
  name: string;
  channels: Channel[];
}

export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  category?: string;
  language?: string;
}

export interface CloudStreamSource {
  id: string;
  name: string;
  url: string;
  logo?: string;
  language?: string;
  categories: string[];
  repo: string;
  description?: string;
  is_enabled: boolean;
}

export interface CloudStreamContent {
  id: string;
  source_id: string;
  title: string;
  type: 'movie' | 'series';
  year?: number;
  poster?: string;
  backdrop?: string;
  rating?: number;
  plot?: string;
  genres?: string[];
  url: string;
  created_at: string;
  updated_at: string;
}
