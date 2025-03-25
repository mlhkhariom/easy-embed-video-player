
import { safeFetch, handleAPIError } from './error-handler';
import { supabase } from "@/integrations/supabase/client";

// Define base types for CloudStream content
export interface CloudStreamSource {
  id?: string;
  name: string;
  url: string;
  logo?: string;
  language?: string;
  categories?: string[];
  repo: string;
  description?: string;
  is_enabled?: boolean;
}

export interface CloudStreamContent {
  id: string;
  title: string;
  year?: number;
  poster?: string;
  backdrop?: string;
  plot?: string;
  rating?: number;
  type: 'movie' | 'series';
  url: string;
  source: string;
  external_id?: string;
}

export interface CloudStreamSearchResponse {
  results: CloudStreamContent[];
  hasMore: boolean;
}

// Base URLs for the CloudStream extension APIs
const CS_REPOS = {
  CSX: {
    name: 'CSX',
    url: 'https://raw.githubusercontent.com/SaurabhKaperwan/CSX/master',
    apiUrl: 'https://api.github.com/repos/SaurabhKaperwan/CSX/contents'
  },
  PHISHER: {
    name: 'Phisher',
    url: 'https://raw.githubusercontent.com/phisher98/cloudstream-extensions-phisher/main',
    apiUrl: 'https://api.github.com/repos/phisher98/cloudstream-extensions-phisher/contents'
  },
  KEKIK: {
    name: 'Kekik',
    url: 'https://raw.githubusercontent.com/keyiflerolsun/Kekik-cloudstream/main',
    apiUrl: 'https://api.github.com/repos/keyiflerolsun/Kekik-cloudstream/contents'
  }
};

// Available sources from the extensions
const CSX_SOURCES: CloudStreamSource[] = [
  { name: 'JioTV', url: `${CS_REPOS.CSX.url}/JioTV/src/main/kotlin/com/jeetv/JioTV.kt`, language: 'hi', categories: ['indian', 'live'], repo: 'CSX' },
  { name: 'VivaMax', url: `${CS_REPOS.CSX.url}/VivaMax/src/main/kotlin/com/vivamax/VivaMax.kt`, categories: ['movies', 'series'], repo: 'CSX' },
  { name: 'TurkcAnime', url: `${CS_REPOS.CSX.url}/TurkcAnime/src/main/kotlin/com/turkanime/TurkcAnime.kt`, language: 'tr', categories: ['anime'], repo: 'CSX' },
  { name: 'Javmost', url: `${CS_REPOS.CSX.url}/Javmost/src/main/kotlin/com/javmost/Javmost.kt`, categories: ['adult'], repo: 'CSX' },
  { name: 'AnimeSail', url: `${CS_REPOS.CSX.url}/AnimeSail/src/main/kotlin/com/animesail/AnimeSail.kt`, language: 'id', categories: ['anime'], repo: 'CSX' },
  { name: 'AnimeIndoProvider', url: `${CS_REPOS.CSX.url}/AnimeIndoProvider/src/main/kotlin/com/animeindo/AnimeIndoProvider.kt`, language: 'id', categories: ['anime'], repo: 'CSX' },
  { name: 'DramaSee', url: `${CS_REPOS.CSX.url}/DramaSee/src/main/kotlin/com/dramasee/DramaSee.kt`, categories: ['series'], repo: 'CSX' },
  { name: 'ExtremeTorrent', url: `${CS_REPOS.CSX.url}/ExtremeTorrent/src/main/kotlin/com/extremetorrent/ExtremeTorrent.kt`, categories: ['torrent'], repo: 'CSX' },
  { name: 'FilmanProvider', url: `${CS_REPOS.CSX.url}/FilmanProvider/src/main/kotlin/com/filman/FilmanProvider.kt`, language: 'pl', categories: ['movies', 'series'], repo: 'CSX' },
];

const PHISHER_SOURCES: CloudStreamSource[] = [
  { name: 'Doomovies', url: `${CS_REPOS.PHISHER.url}/Doomovies/src/main/kotlin/com/phisher/Doomovies.kt`, categories: ['movies'], repo: 'PHISHER' },
  { name: 'Filmxy', url: `${CS_REPOS.PHISHER.url}/Filmxy/src/main/kotlin/com/phisher/Filmxy.kt`, categories: ['movies'], repo: 'PHISHER' },
  { name: 'TinyTv', url: `${CS_REPOS.PHISHER.url}/TinyTv/src/main/kotlin/com/phisher/TinyTv.kt`, language: 'hi', categories: ['indian', 'movies', 'series'], repo: 'PHISHER' },
  { name: 'KitsuVIO', url: `${CS_REPOS.PHISHER.url}/KitsuVIO/src/main/kotlin/com/phisher/KitsuVIO.kt`, categories: ['anime'], repo: 'PHISHER' },
  { name: 'Kawaiii', url: `${CS_REPOS.PHISHER.url}/Kawaiii/src/main/kotlin/com/phisher/Kawaiii.kt`, categories: ['anime'], repo: 'PHISHER' },
  { name: 'Kisskh', url: `${CS_REPOS.PHISHER.url}/Kisskh/src/main/kotlin/com/phisher/Kisskh.kt`, categories: ['movies', 'series'], repo: 'PHISHER' },
  { name: 'NineAnime', url: `${CS_REPOS.PHISHER.url}/NineAnime/src/main/kotlin/com/phisher/NineAnime.kt`, categories: ['anime'], repo: 'PHISHER' },
];

const KEKIK_SOURCES: CloudStreamSource[] = [
  { name: 'BicapsNet', url: `${CS_REPOS.KEKIK.url}/BicapsNet/src/main/kotlin/com/keyiflerolsun/BicapsNet.kt`, language: 'tr', categories: ['anime', 'movies', 'series'], repo: 'KEKIK' },
  { name: 'Blutv', url: `${CS_REPOS.KEKIK.url}/Blutv/src/main/kotlin/com/keyiflerolsun/Blutv.kt`, language: 'tr', categories: ['movies', 'series'], repo: 'KEKIK' },
  { name: 'DiziPal', url: `${CS_REPOS.KEKIK.url}/DiziPal/src/main/kotlin/com/keyiflerolsun/DiziPal.kt`, language: 'tr', categories: ['series'], repo: 'KEKIK' },
  { name: 'HdFilmCehennemi', url: `${CS_REPOS.KEKIK.url}/HdFilmCehennemi/src/main/kotlin/com/keyiflerolsun/HdFilmCehennemi.kt`, language: 'tr', categories: ['movies'], repo: 'KEKIK' },
];

// Combined sources
export const CLOUDSTREAM_SOURCES = [...CSX_SOURCES, ...PHISHER_SOURCES, ...KEKIK_SOURCES].sort((a, b) => a.name.localeCompare(b.name));

// Sync predefined sources to Supabase
export const syncSourcesToSupabase = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${window.location.origin}/api/sync-cloudstream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'syncSources',
        sources: CLOUDSTREAM_SOURCES
      }),
    });
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error syncing sources to Supabase:', error);
    return false;
  }
};

// Get all available sources from Supabase with realtime support
export const fetchAllSources = async (): Promise<CloudStreamSource[]> => {
  try {
    const { data: sources, error } = await supabase
      .from('cloudstream_sources')
      .select('*')
      .eq('is_enabled', true)
      .order('name');
    
    if (error) {
      throw error;
    }
    
    return sources || [];
  } catch (error) {
    console.error('Error fetching CloudStream sources:', error);
    return CLOUDSTREAM_SOURCES; // Fallback to static list if API fails
  }
};

// Search content with Supabase and real-time data
export const searchCloudStreamContent = async (
  query: string,
  sourceIds: string[] = []
): Promise<CloudStreamSearchResponse> => {
  try {
    // First, try to get real content from Supabase
    let supabaseQuery = supabase
      .from('cloudstream_content')
      .select('*, cloudstream_sources(name)')
      .order('title');
    
    // Add search filter if query is provided
    if (query && query.trim() !== '') {
      supabaseQuery = supabaseQuery.ilike('title', `%${query}%`);
    }
    
    // Add source filter if sourceIds are provided
    if (sourceIds.length > 0) {
      supabaseQuery = supabaseQuery.in('cloudstream_sources.name', sourceIds);
    }
    
    const { data, error } = await supabaseQuery;
    
    if (error) {
      throw error;
    }
    
    // If we got data from Supabase, format and return it
    if (data && data.length > 0) {
      const results: CloudStreamContent[] = data.map(item => ({
        id: item.id,
        title: item.title,
        year: item.year,
        poster: item.poster,
        backdrop: item.backdrop,
        plot: item.plot,
        rating: item.rating,
        type: item.type as 'movie' | 'series',
        url: `/cloudstream/${item.cloudstream_sources.name}/${item.external_id}`,
        source: item.cloudstream_sources.name
      }));
      
      return {
        results,
        hasMore: false // We don't support pagination for real data yet
      };
    }
    
    // If no data in Supabase yet, fall back to mock data
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate mock results
    const results: CloudStreamContent[] = [];
    
    // Filter sources if specified
    const sources = sourceIds.length > 0 
      ? CLOUDSTREAM_SOURCES.filter(s => sourceIds.includes(s.name))
      : CLOUDSTREAM_SOURCES;
    
    // Generate 0-5 mock results per source based on the query
    sources.forEach(source => {
      const resultCount = Math.floor(Math.random() * 6); // 0-5 results
      
      for (let i = 0; i < resultCount; i++) {
        if (query.length > 0 && Math.random() > 0.7) continue; // Skip some results for non-empty queries
        
        results.push({
          id: `${source.name}-${Date.now()}-${i}`,
          title: query.length > 0 
            ? `${query} ${i + 1} (${source.name})` 
            : `Sample ${source.name} Content ${i + 1}`,
          year: 2020 + Math.floor(Math.random() * 4),
          poster: `https://picsum.photos/seed/${source.name}${i}/300/450`,
          backdrop: `https://picsum.photos/seed/${source.name}${i}-bg/1280/720`,
          plot: `This is a sample content item from the ${source.name} source.`,
          rating: Math.floor(Math.random() * 100) / 10,
          type: Math.random() > 0.5 ? 'movie' : 'series',
          url: `#/cloudstream/${source.name}/${i}`,
          source: source.name
        });
      }
    });
    
    return {
      results,
      hasMore: results.length > 0 && Math.random() > 0.3 // Randomly determine if there are more results
    };
  } catch (error) {
    console.error('Error searching CloudStream content:', error);
    return {
      results: [],
      hasMore: false
    };
  }
};

// Get content details from Supabase
export const getCloudStreamContentDetails = async (
  contentId: string,
  sourceId: string
): Promise<CloudStreamContent | null> => {
  try {
    // Try to get from Supabase first
    const { data, error } = await supabase
      .from('cloudstream_content')
      .select('*, cloudstream_sources(name)')
      .eq('external_id', contentId)
      .eq('cloudstream_sources.name', sourceId)
      .maybeSingle();
    
    if (error) {
      throw error;
    }
    
    // If we found the content in Supabase, return it
    if (data) {
      return {
        id: data.id,
        title: data.title,
        year: data.year,
        poster: data.poster,
        backdrop: data.backdrop,
        plot: data.plot,
        rating: data.rating,
        type: data.type as 'movie' | 'series',
        url: `/cloudstream/${data.cloudstream_sources.name}/${data.external_id}`,
        source: data.cloudstream_sources.name,
        external_id: data.external_id
      };
    }
    
    // Find the source
    const source = CLOUDSTREAM_SOURCES.find(s => s.name === sourceId);
    if (!source) return null;
    
    // Mock content details as fallback
    return {
      id: contentId,
      title: `${sourceId} Content ${contentId}`,
      year: 2022,
      poster: `https://picsum.photos/seed/${sourceId}${contentId}/300/450`,
      backdrop: `https://picsum.photos/seed/${sourceId}${contentId}-bg/1280/720`,
      plot: `This is a detailed description for content from ${sourceId}.`,
      rating: 8.5,
      type: Math.random() > 0.5 ? 'movie' : 'series',
      url: `#/cloudstream/${sourceId}/${contentId}`,
      source: sourceId,
      external_id: contentId
    };
  } catch (error) {
    console.error('Error fetching CloudStream content details:', error);
    return null;
  }
};

// Listen for real-time updates to CloudStream content
export const subscribeToCloudStreamUpdates = (callback: () => void) => {
  const channel = supabase
    .channel('cloudstream-changes')
    .on('postgres_changes', 
      {
        event: '*', 
        schema: 'public',
        table: 'cloudstream_content'
      }, 
      () => {
        callback();
      }
    )
    .on('postgres_changes', 
      {
        event: '*', 
        schema: 'public',
        table: 'cloudstream_sources'
      }, 
      () => {
        callback();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
