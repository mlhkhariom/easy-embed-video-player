
/**
 * Service for web series related functionality
 */

export const filterWebSeries = (shows: any[]) => {
  return shows.filter(show => {
    const isHighRated = show.vote_average >= 6.5;
    const hasFewerEpisodes = !show.number_of_episodes || show.number_of_episodes < 30;
    const isRecent = show.first_air_date && new Date(show.first_air_date).getFullYear() >= 2008;
    
    const streamingNetworks = [213, 1024, 2739, 2552, 4344, 2703, 3186];
    const isOnStreaming = show.networks?.some((network: any) => 
      streamingNetworks.includes(network.id)
    );
    
    return (isHighRated && hasFewerEpisodes && isRecent) || isOnStreaming || show.type === 'web_series';
  });
};

/**
 * Get all web series networks from the provided shows
 */
export const getWebSeriesNetworks = (webSeries: any[]) => {
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
