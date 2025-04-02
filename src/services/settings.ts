
import { supabase } from '@/integrations/supabase/client';
import { AdminSettings } from '@/types';

export interface Settings extends AdminSettings {}

// Fetch settings
export const fetchSettings = async (): Promise<Settings> => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching settings:', error);
      throw new Error('Failed to fetch settings');
    }

    return data as Settings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw new Error('Failed to fetch settings');
  }
};

// Update settings
export const updateSettings = async (updates: Partial<Settings>): Promise<Settings> => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .update(updates)
      .eq('id', 1) // Assuming there's only one settings record with id 1
      .select('*')
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      throw new Error('Failed to update settings');
    }

    return data as Settings;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw new Error('Failed to update settings');
  }
};
