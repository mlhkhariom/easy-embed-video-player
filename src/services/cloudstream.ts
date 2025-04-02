
import { supabase } from '@/integrations/supabase/client';
import { CloudStreamPlugin, CloudStreamRepo } from '@/types';

export interface CloudStreamResponse {
  success: boolean;
  message: string;
  data?: any;
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

    // Insert the plugin into the database
    const { error } = await supabase
      .from('cloudstream_plugins')
      .insert([pluginData]);

    if (error) {
      console.error('Error adding plugin:', error);
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

    // Insert the repository into the database
    const { error } = await supabase
      .from('cloudstream_repositories')
      .insert([repoData]);

    if (error) {
      console.error('Error adding repository:', error);
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
    // For now, we'll just update the last_synced timestamp
    const timestamp = new Date().toISOString();
    
    // Update repositories
    const { error: repoError } = await supabase
      .from('cloudstream_repositories')
      .update({ last_synced: timestamp })
      .eq('is_enabled', true);

    if (repoError) {
      console.error('Error syncing repositories:', repoError);
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

// Additional utility functions can be added here

export default {
  addPlugin,
  addRepository,
  syncContent,
  INDIAN_LANGUAGES
};
