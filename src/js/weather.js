/**
 * Weather data fetching module
 * Handles API communication with the Cloudflare Worker proxy
 */

/**
 * Fetch weather data from the API
 * @param {string} location - Location name (city or prefecture)
 * @returns {Promise<Object>} - Weather data including current conditions and forecast
 */
async function getWeatherData(location) {
    if (!location) {
      throw new Error('Location is required');
    }
    
    debugLog(`Fetching weather data for ${location}`);
    
    try {
      // Construct API URL
      const url = `${API_ENDPOINT}?city=${encodeURIComponent(location)}`;
      debugLog(`API URL: ${url}`);
      
      // Fetch data
      const response = await fetch(url);
      
      // Check for errors
      if (!response.ok) {
        const errorText = await response.text();
        debugLog(`API error: ${response.status} - ${errorText}`);
        throw new Error('地域名が正しくないか、サーバーとの通信に問題があります');
      }
      
      // Parse JSON response
      const data = await response.json();
      debugLog('API response received');
      
      // Check for API error
      if (!data.success) {
        throw new Error(data.error || '不明なエラーが発生しました');
      }
      
      return data;
    } catch (error) {
      debugLog(`Error in getWeatherData: ${error.message || error}`);
      throw error;
    }
  }