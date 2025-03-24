
import { safeFetch, handleAPIError } from './error-handler';

// Define base types for CloudStream content
export interface CloudStreamSource {
  name: string;
  url: string;
  logo?: string;
  language?: string;
  categories?: string[];
  repo: string;
  description?: string;
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

// Fetch raw content from GitHub repository
const fetchRepoContent = async (url: string): Promise<string> => {
  try {
    const response = await safeFetch(url);
    return await response.text();
  } catch (error) {
    throw handleAPIError(error);
  }
};

// Parse raw Kotlin file content to extract information
const parseProviderKotlinFile = (content: string, source: CloudStreamSource): CloudStreamSource => {
  const updatedSource = { ...source };
  
  // Extract name
  const nameMatch = content.match(/name\s*=\s*"([^"]+)"/);
  if (nameMatch) {
    updatedSource.name = nameMatch[1];
  }
  
  // Extract language
  const languageMatch = content.match(/lang\s*=\s*"([^"]+)"/);
  if (languageMatch) {
    updatedSource.language = languageMatch[1];
  }
  
  // Extract logo
  const logoMatch = content.match(/iconUrl\s*=\s*"([^"]+)"/);
  if (logoMatch) {
    updatedSource.logo = logoMatch[1];
  }
  
  // Try to extract description
  const descMatch = content.match(/override\s+val\s+mainUrl\s*=\s*"([^"]+)"/);
  if (descMatch) {
    updatedSource.description = `Provider for ${descMatch[1]}`;
  }
  
  return updatedSource;
};

// Fetch providers from GitHub (only when explicitly requested)
export const fetchProvidersFromGitHub = async (repo: keyof typeof CS_REPOS): Promise<CloudStreamSource[]> => {
  try {
    const repoInfo = CS_REPOS[repo];
    const response = await safeFetch(repoInfo.apiUrl);
    const data = await response.json();
    
    // Filter only directories (potential providers)
    const providerDirs = data.filter((item: any) => item.type === 'dir' && !item.name.startsWith('.'));
    
    const providers: CloudStreamSource[] = [];
    
    for (const dir of providerDirs) {
      try {
        // Check if directory contains a provider file
        const providerFile = `${repoInfo.url}/${dir.name}/src/main/kotlin/com/${dir.name.toLowerCase()}/${dir.name}.kt`;
        const content = await fetchRepoContent(providerFile);
        
        // Create base provider info
        const provider: CloudStreamSource = {
          name: dir.name,
          url: providerFile,
          repo: repo,
          categories: []
        };
        
        // Parse provider details from content
        const enrichedProvider = parseProviderKotlinFile(content, provider);
        providers.push(enrichedProvider);
      } catch (error) {
        console.warn(`Failed to fetch provider ${dir.name} from ${repo}:`, error);
        // Continue with next provider
      }
    }
    
    return providers;
    
  } catch (error) {
    console.error(`Error fetching providers from ${repo}:`, error);
    throw handleAPIError(error);
  }
};

// Get all available sources with metadata
export const fetchAllSources = async (): Promise<CloudStreamSource[]> => {
  try {
    // First return the predefined list
    return CLOUDSTREAM_SOURCES;
    
    // In a production implementation, we would fetch and parse the actual repositories
    // This is commented out because it would make too many API calls to GitHub
    // const csx = await fetchProvidersFromGitHub('CSX');
    // const phisher = await fetchProvidersFromGitHub('PHISHER');
    // const kekik = await fetchProvidersFromGitHub('KEKIK');
    // return [...csx, ...phisher, ...kekik].sort((a, b) => a.name.localeCompare(b.name));
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
