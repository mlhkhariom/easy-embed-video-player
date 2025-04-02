import { supabase } from '@/integrations/supabase/client';
import { CloudStreamPlugin, CloudStreamRepo } from '@/types';

// Type definitions
export interface CloudStreamResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface CloudStreamContent {
  id: string;
  source_id: string;
  source?: string;
  title: string;
  type: 'movie' | 'series';
  year?: number;
  poster?: string;
  backdrop?: string;
  rating?: number;
  plot?: string;
  genres?: string[];
  url?: string;
  external_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CloudStreamSource {
  id?: string;
  name: string;
  url: string;
  repo: string;
  description?: string;
  language?: string;
  categories?: string[];
  logo?: string;
  is_enabled?: boolean;
}

// Available Indian languages
export const INDIAN_LANGUAGES = [
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'kn', name: 'Kannada' },
  { code: 'bn', name: 'Bengali' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ur', name: 'Urdu' },
];

// Pre-defined CloudStream sources for Indian content
export const CLOUDSTREAM_SOURCES: CloudStreamSource[] = [
  // We'll fetch these from the database
];

// Add a new CloudStream plugin
export const addPlugin = async (plugin: {
  name: string;
  url: string;
  version: string;
  description: string;
  author: string;
  repository: string;
  categories: string[];
  language: string;
}): Promise<boolean> => {
  try {
    // Prepare the plugin data for insertion
    const pluginData = {
      name: plugin.name,
      url: plugin.url,
      version: plugin.version,
      description: plugin.description || `Plugin for ${plugin.name}`,
      author: plugin.author || 'Unknown',
      repository: plugin.repository || 'Custom',
      categories: plugin.categories || ['indian'],
      language: plugin.language || 'hi',
      is_enabled: true,
      is_installed: false
    };

    // We need to use the Supabase function now since direct access has type issues
    const response = await supabase.functions.invoke('cloudstream-utils', {
      body: {
        action: 'add_plugin',
        data: pluginData
      }
    });

    if (response.error) {
      console.error('Error adding plugin:', response.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding plugin:', error);
    return false;
  }
};

// Add a new CloudStream repository
export const addRepository = async (repo: {
  name: string;
  url: string;
  description: string;
  author: string;
}): Promise<boolean> => {
  try {
    // Prepare the repository data for insertion
    const repoData = {
      name: repo.name,
      url: repo.url,
      description: repo.description || `Repository for ${repo.name}`,
      author: repo.author || 'Unknown',
      is_enabled: true,
      plugin_count: 0
    };

    // We need to use the Supabase function now since direct access has type issues
    const response = await supabase.functions.invoke('cloudstream-utils', {
      body: {
        action: 'add_repository',
        data: repoData
      }
    });

    if (response.error) {
      console.error('Error adding repository:', response.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding repository:', error);
    return false;
  }
};

// Sync CloudStream content from repositories
export const syncContent = async (): Promise<CloudStreamResponse> => {
  try {
    // For now, we'll use the Supabase function
    const response = await supabase.functions.invoke('cloudstream-utils', {
      body: {
        action: 'sync_content'
      }
    });

    if (response.error) {
      console.error('Error syncing content:', response.error);
      return {
        success: false,
        message: 'Failed to sync repositories'
      };
    }

    return {
      success: true,
      message: 'Successfully synced CloudStream content'
    };
  } catch (error) {
    console.error('Error syncing content:', error);
    return {
      success: false,
      message: 'An error occurred while syncing content'
    };
  }
};

// Fetch all CloudStream sources
export const fetchAllSources = async (): Promise<CloudStreamSource[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('cloudstream-utils', {
      body: { action: 'get_sources' }
    });

    if (error) {
      console.error('Error fetching sources:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching sources:', error);
    return [];
  }
};

// Fetch all CloudStream repositories
export const fetchAllRepositories = async (): Promise<CloudStreamRepo[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('cloudstream-utils', {
      body: { action: 'get_repositories' }
    });

    if (error) {
      console.error('Error fetching repositories:', error);
      return [];
    }

    // Convert to CloudStreamRepo format
    return (data || []).map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      url: repo.url,
      description: repo.description,
      author: repo.author,
      isEnabled: repo.is_enabled,
      lastSynced: repo.last_synced,
      pluginCount: repo.plugin_count
    }));
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return [];
  }
};

// Fetch all CloudStream plugins
export const fetchAllPlugins = async (): Promise<CloudStreamPlugin[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('cloudstream-utils', {
      body: { action: 'get_plugins' }
    });

    if (error) {
      console.error('Error fetching plugins:', error);
      return [];
    }

    // Convert to CloudStreamPlugin format
    return (data || []).map((plugin: any) => ({
      id: plugin.id,
      name: plugin.name,
      url: plugin.url,
      version: plugin.version,
      description: plugin.description,
      author: plugin.author,
      repository: plugin.repository,
      language: plugin.language,
      categories: plugin.categories,
      isEnabled: plugin.is_enabled,
      isInstalled: plugin.is_installed
    }));
  } catch (error) {
    console.error('Error fetching plugins:', error);
    return [];
  }
};

// Sync CloudStream sources from repositories to Supabase
export const syncSourcesToSupabase = async (): Promise<boolean> => {
  try {
    const response = await supabase.functions.invoke('cloudstream-utils', {
      body: { action: 'sync_sources' }
    });

    if (response.error) {
      console.error('Error syncing sources:', response.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error syncing sources:', error);
    return false;
  }
};

// Search CloudStream content
export const searchCloudStreamContent = async (
  query: string,
  sources?: string[],
  options?: {
    indianContent?: boolean;
    language?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<{
  results: CloudStreamContent[];
  hasMore: boolean;
  totalResults: number;
}> => {
  try {
    const response = await supabase.functions.invoke('cloudstream-utils', {
      body: {
        action: 'search_content',
        query,
        sources,
        options
      }
    });

    if (response.error) {
      console.error('Error searching content:', response.error);
      return { results: [], hasMore: false, totalResults: 0 };
    }

    return response.data || { results: [], hasMore: false, totalResults: 0 };
  } catch (error) {
    console.error('Error searching content:', error);
    return { results: [], hasMore: false, totalResults: 0 };
  }
};

// Get CloudStream content details
export const getCloudStreamContentDetails = async (
  contentId: string,
  sourceId: string
): Promise<CloudStreamContent | null> => {
  try {
    const response = await supabase.functions.invoke('cloudstream-utils', {
      body: {
        action: 'get_content_details',
        contentId,
        sourceId
      }
    });

    if (response.error) {
      console.error('Error getting content details:', response.error);
      return null;
    }

    return response.data || null;
  } catch (error) {
    console.error('Error getting content details:', error);
    return null;
  }
};

// Parse CloudStream repository to get plugins and sources
export const parseCloudStreamRepo = async (
  repoUrl: string
): Promise<{
  plugins: any[];
  sources: any[];
}> => {
  try {
    const response = await supabase.functions.invoke('cloudstream-utils', {
      body: {
        action: 'parse_repository',
        repoUrl
      }
    });

    if (response.error) {
      console.error('Error parsing repository:', response.error);
      return { plugins: [], sources: [] };
    }

    return response.data || { plugins: [], sources: [] };
  } catch (error) {
    console.error('Error parsing repository:', error);
    return { plugins: [], sources: [] };
  }
};

// Subscribe to CloudStream updates
export const subscribeToCloudStreamUpdates = (
  callback: () => void
): (() => void) => {
  const channel = supabase
    .channel('cloudstream-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'cloudstream_content' },
      () => callback()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'cloudstream_sources' },
      () => callback()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'cloudstream_plugins' },
      () => callback()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'cloudstream_repositories' },
      () => callback()
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};

// Note: We're keeping the default export for backward compatibility
// but we'll primarily use named exports in new code
export default {
  INDIAN_LANGUAGES,
  CLOUDSTREAM_SOURCES,
  addPlugin,
  addRepository,
  syncContent,
  fetchAllSources,
  fetchAllRepositories,
  fetchAllPlugins,
  syncSourcesToSupabase,
  searchCloudStreamContent,
  getCloudStreamContentDetails,
  parseCloudStreamRepo,
  subscribeToCloudStreamUpdates
};
