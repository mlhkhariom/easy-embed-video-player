
import { safeFetch, handleAPIError } from './error-handler';

// Define base types for CloudStream content
export interface CloudStreamSource {
  name: string;
  url: string;
  logo?: string;
  language?: string;
  categories?: string[];
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
}

export interface CloudStreamSearchResponse {
  results: CloudStreamContent[];
  hasMore: boolean;
}

// Base URLs for the CloudStream extension APIs
const CSX_API_BASE = 'https://raw.githubusercontent.com/SaurabhKaperwan/CSX/master';
const PHISHER_API_BASE = 'https://raw.githubusercontent.com/phisher98/cloudstream-extensions-phisher/main';

// Available sources from the extensions
const CSX_SOURCES: CloudStreamSource[] = [
  { name: 'JioTV', url: `${CSX_API_BASE}/JioTV/src/main/kotlin/com/jeetv/JioTV.kt`, language: 'hi', categories: ['indian', 'live'] },
  { name: 'VivaMax', url: `${CSX_API_BASE}/VivaMax/src/main/kotlin/com/vivamax/VivaMax.kt`, categories: ['movies', 'series'] },
  { name: 'TurkcAnime', url: `${CSX_API_BASE}/TurkcAnime/src/main/kotlin/com/turkanime/TurkcAnime.kt`, language: 'tr', categories: ['anime'] },
  { name: 'Javmost', url: `${CSX_API_BASE}/Javmost/src/main/kotlin/com/javmost/Javmost.kt`, categories: ['adult'] },
];

const PHISHER_SOURCES: CloudStreamSource[] = [
  { name: 'Doomovies', url: `${PHISHER_API_BASE}/Doomovies/src/main/kotlin/com/phisher/Doomovies.kt`, categories: ['movies'] },
  { name: 'Filmxy', url: `${PHISHER_API_BASE}/Filmxy/src/main/kotlin/com/phisher/Filmxy.kt`, categories: ['movies'] },
  { name: 'TinyTv', url: `${PHISHER_API_BASE}/TinyTv/src/main/kotlin/com/phisher/TinyTv.kt`, language: 'hi', categories: ['indian', 'movies', 'series'] },
  { name: 'KitsuVIO', url: `${PHISHER_API_BASE}/KitsuVIO/src/main/kotlin/com/phisher/KitsuVIO.kt`, categories: ['anime'] },
];

// Combined sources
export const CLOUDSTREAM_SOURCES = [...CSX_SOURCES, ...PHISHER_SOURCES].sort((a, b) => a.name.localeCompare(b.name));

// Fetch GitHub repository content (raw files)
const fetchRepoContent = async (url: string): Promise<string> => {
  try {
    const response = await safeFetch(url);
    return await response.text();
  } catch (error) {
    throw handleAPIError(error);
  }
};

// Parse raw file content to extract information (simplified parsing)
const parseProviderKotlinFile = (content: string): CloudStreamSource => {
  const nameMatch = content.match(/name\s*=\s*"([^"]+)"/);
  const languageMatch = content.match(/lang\s*=\s*"([^"]+)"/);
  const logoMatch = content.match(/iconUrl\s*=\s*"([^"]+)"/);
  
  return {
    name: nameMatch ? nameMatch[1] : 'Unknown Provider',
    url: '',
    language: languageMatch ? languageMatch[1] : undefined,
    logo: logoMatch ? logoMatch[1] : undefined,
    categories: []
  };
};

// Get all available sources with metadata
export const fetchAllSources = async (): Promise<CloudStreamSource[]> => {
  try {
    // In a real implementation, we would fetch and parse each source
    // For now, we'll return the predefined list
    return CLOUDSTREAM_SOURCES;
  } catch (error) {
    console.error('Error fetching CloudStream sources:', error);
    return CLOUDSTREAM_SOURCES; // Fallback to static list if API fails
  }
};

// Mock search function as we can't actually use the CloudStream backend
export const searchCloudStreamContent = async (
  query: string,
  sourceIds: string[] = []
): Promise<CloudStreamSearchResponse> => {
  try {
    // In a real implementation, we would call the actual API
    // For demo purposes, we'll return mock data based on the query
    
    // Simulate API delay
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

// Get content details (mock implementation)
export const getCloudStreamContentDetails = async (
  id: string,
  sourceId: string
): Promise<CloudStreamContent | null> => {
  try {
    // Find the source
    const source = CLOUDSTREAM_SOURCES.find(s => s.name === sourceId);
    if (!source) return null;
    
    // Mock content details
    return {
      id,
      title: `${sourceId} Content ${id}`,
      year: 2022,
      poster: `https://picsum.photos/seed/${sourceId}${id}/300/450`,
      backdrop: `https://picsum.photos/seed/${sourceId}${id}-bg/1280/720`,
      plot: `This is a detailed description for content from ${sourceId}.`,
      rating: 8.5,
      type: Math.random() > 0.5 ? 'movie' : 'series',
      url: `#/cloudstream/${sourceId}/${id}`,
      source: sourceId
    };
  } catch (error) {
    console.error('Error fetching CloudStream content details:', error);
    return null;
  }
};
