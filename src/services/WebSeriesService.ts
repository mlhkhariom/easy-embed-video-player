
/**
 * Service for web series related functionality
 * @module WebSeriesService
 */

import { TvShow } from '@/types';

interface FilterOptions {
  minRating?: number;
  maxEpisodes?: number;
  minYear?: number;
  includeStreamingOnly?: boolean;
}

/**
 * Filter web series based on criteria
 * @param {TvShow[]} shows - Array of TV shows to filter
 * @param {FilterOptions} options - Optional filter options
 * @returns {TvShow[]} - Filtered array of TV shows
 */
export const filterWebSeries = (
  shows: TvShow[], 
  options: FilterOptions = {
    minRating: 6.5,
    maxEpisodes: 30,
    minYear: 2008,
    includeStreamingOnly: true
  }
): TvShow[] => {
  return shows.filter(show => {
    const { minRating = 6.5, maxEpisodes = 30, minYear = 2008, includeStreamingOnly = true } = options;
    
    // Quality criteria
    const isHighRated = show.vote_average >= minRating;
    const hasFewerEpisodes = !show.number_of_episodes || show.number_of_episodes < maxEpisodes;
    const isRecent = show.first_air_date && new Date(show.first_air_date).getFullYear() >= minYear;
    
    // Streaming networks - popular streaming services
    const streamingNetworks = [213, 1024, 2739, 2552, 4344, 2703, 3186]; // IDs from TMDB
    const isOnStreaming = includeStreamingOnly && show.networks?.some((network: any) => 
      streamingNetworks.includes(network.id)
    );
    
    // Rules for inclusion
    const meetsQualityCriteria = isHighRated && hasFewerEpisodes && isRecent;
    const isDesignatedWebSeries = show.type === 'web_series';
    
    return meetsQualityCriteria || isOnStreaming || isDesignatedWebSeries;
  });
};

/**
 * Get all web series networks from the provided shows
 * @param {TvShow[]} webSeries - Array of web series
 * @returns {Object[]} - Array of unique networks
 */
export const getWebSeriesNetworks = (webSeries: TvShow[]): any[] => {
  const networks: any[] = [];
  
  webSeries.forEach(show => {
    if (show.networks && Array.isArray(show.networks)) {
      show.networks.forEach((network: any) => {
        if (!networks.find(n => n.id === network.id)) {
          networks.push(network);
        }
      });
    }
  });
  
  return networks;
};

/**
 * Sort web series by different criteria
 * @param {TvShow[]} webSeries - Array of web series to sort
 * @param {string} sortBy - Sort criterion
 * @param {string} sortOrder - Sort order (asc or desc)
 * @returns {TvShow[]} - Sorted array of web series
 */
export const sortWebSeries = (
  webSeries: TvShow[], 
  sortBy: 'popularity' | 'vote_average' | 'first_air_date' | 'name' = 'popularity',
  sortOrder: 'asc' | 'desc' = 'desc'
): TvShow[] => {
  const sorted = [...webSeries];
  
  sorted.sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case 'vote_average':
        valueA = a.vote_average;
        valueB = b.vote_average;
        break;
      case 'first_air_date':
        valueA = a.first_air_date ? new Date(a.first_air_date).getTime() : 0;
        valueB = b.first_air_date ? new Date(b.first_air_date).getTime() : 0;
        break;
      case 'name':
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        return sortOrder === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      case 'popularity':
      default:
        valueA = a.popularity;
        valueB = b.popularity;
        break;
    }
    
    if (sortOrder === 'asc') {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  });
  
  return sorted;
};

/**
 * Group web series by network
 * @param {TvShow[]} webSeries - Array of web series
 * @returns {Object} - Map of networks to their shows
 */
export const groupWebSeriesByNetwork = (webSeries: TvShow[]): Record<number, TvShow[]> => {
  const grouped: Record<number, TvShow[]> = {};
  
  webSeries.forEach(show => {
    if (show.networks && Array.isArray(show.networks)) {
      show.networks.forEach((network: any) => {
        if (!grouped[network.id]) {
          grouped[network.id] = [];
        }
        
        if (!grouped[network.id].some(s => s.id === show.id)) {
          grouped[network.id].push(show);
        }
      });
    }
  });
  
  return grouped;
};
