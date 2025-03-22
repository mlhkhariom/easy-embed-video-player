
// IPTV API client based on https://github.com/iptv-org/api

export interface Channel {
  id: string;
  name: string;
  country: string;
  subdivision: string;
  city: string;
  broadcast_area: string[];
  languages: string[];
  categories: string[];
  is_nsfw: boolean;
  website: string;
  logo: string;
}

export interface Stream {
  channel: string;
  url: string;
  http_referrer: string;
  user_agent: string;
  status: string;
  width: number;
  height: number;
  bitrate: number;
}

export const fetchChannels = async (): Promise<Channel[]> => {
  try {
    const response = await fetch('https://iptv-org.github.io/api/channels.json');
    if (!response.ok) throw new Error('Failed to fetch channels');
    return await response.json();
  } catch (error) {
    console.error('Error fetching channels:', error);
    return [];
  }
};

export const fetchIndianChannels = async (): Promise<Channel[]> => {
  try {
    const channels = await fetchChannels();
    return channels.filter(channel => 
      channel.broadcast_area.includes('India') || 
      channel.country === 'IN' ||
      channel.languages.includes('hin') || // Hindi
      channel.languages.includes('tam') || // Tamil
      channel.languages.includes('tel') || // Telugu
      channel.languages.includes('mal') || // Malayalam
      channel.languages.includes('kan') || // Kannada
      channel.languages.includes('ben') || // Bengali
      channel.languages.includes('mar') || // Marathi
      channel.languages.includes('guj')    // Gujarati
    );
  } catch (error) {
    console.error('Error fetching Indian channels:', error);
    return [];
  }
};

export const fetchStreams = async (): Promise<Stream[]> => {
  try {
    const response = await fetch('https://iptv-org.github.io/api/streams.json');
    if (!response.ok) throw new Error('Failed to fetch streams');
    return await response.json();
  } catch (error) {
    console.error('Error fetching streams:', error);
    return [];
  }
};

export const getStreamForChannel = async (channelId: string): Promise<Stream | null> => {
  try {
    const streams = await fetchStreams();
    return streams.find(stream => stream.channel === channelId) || null;
  } catch (error) {
    console.error('Error getting stream for channel:', error);
    return null;
  }
};

export const getChannelsByCategory = async (category: string): Promise<Channel[]> => {
  try {
    const channels = await fetchChannels();
    return channels.filter(channel => channel.categories.includes(category));
  } catch (error) {
    console.error(`Error fetching ${category} channels:`, error);
    return [];
  }
};
