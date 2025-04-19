/**
 * Cloudflare Worker for Headache Forecast
 * Acts as a proxy for OpenWeatherMap API
 */

// OpenWeatherMap API Key (set this in Cloudflare Workers environment variables)
// const WEATHER_API_KEY = '';

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
  });
  
  /**
   * Handle incoming requests
   * @param {Request} request - The incoming request
   * @returns {Response} - The response
   */
  async function handleRequest(request) {
    // Set up CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };
    
    // Handle OPTIONS request (preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }
    
    // Only handle GET requests
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Method not allowed'
      }), {
        status: 405,
        headers: corsHeaders
      });
    }
    
    try {
      // Parse URL
      const url = new URL(request.url);
      
      // Get city parameter
      const city = url.searchParams.get('city');
      
      if (!city) {
        // City is required
        return new Response(JSON.stringify({
          success: false,
          error: '都道府県または市区町村を指定してください'
        }), {
          status: 400,
          headers: corsHeaders
        });
      }
      
      // Get current weather
      const currentWeather = await getCurrentWeather(city);
      
      if (!currentWeather) {
        return new Response(JSON.stringify({
          success: false,
          error: '地域名が正しくありません'
        }), {
          status: 404,
          headers: corsHeaders
        });
      }
      
      // Get weather forecast
      const forecast = await getWeatherForecast(city);
      
      // Determine headache risk
      const headacheRisk = judgeHeadacheRisk(
        currentWeather.pressure, 
        currentWeather.weatherMain
      );
      
      // Prepare response
      const response = {
        success: true,
        city: city,
        currentWeather: currentWeather,
        forecast: forecast,
        headacheRisk: headacheRisk
      };
      
      // Return response
      return new Response(JSON.stringify(response), {
        headers: corsHeaders
      });
      
    } catch (error) {
      // Handle errors
      console.error('Error processing request:', error);
      
      return new Response(JSON.stringify({
        success: false,
        error: 'データ取得中にエラーが発生しました: ' + error.message
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
  
  /**
   * Get current weather data for location
   * @param {string} city - City or location name
   * @returns {Object|null} - Weather data or null if error
   */
  async function getCurrentWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric&lang=ja`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.cod === 200) {
        return {
          weatherMain: data.weather[0].description,
          pressure: data.main.pressure,
          temperature: Math.round(data.main.temp * 10) / 10, // Round to 1 decimal place
          humidity: data.main.humidity
        };
      } else {
        console.error('OpenWeather API error:', data);
        return null;
      }
    } catch (error) {
      console.error('Error fetching current weather:', error);
      return null;
    }
  }
  
  /**
   * Get weather forecast for location
   * @param {string} city - City or location name
   * @returns {Object} - Forecast data for today and tomorrow
   */
  async function getWeatherForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric&lang=ja`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.cod === '200') {
        return processForecastData(data);
      } else {
        console.error('OpenWeather API error:', data);
        return {
          today: null,
          tomorrow: null
        };
      }
    } catch (error) {
      console.error('Error fetching forecast:', error);
      return {
        today: null,
        tomorrow: null
      };
    }
  }
  
  /**
   * Process forecast data to extract today and tomorrow
   * @param {Object} data - Raw forecast data
   * @returns {Object} - Processed forecast for today and tomorrow
   */
  function processForecastData(data) {
    // Current date in UTC
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Tomorrow's date
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Filter forecasts for today and tomorrow
    const todayForecasts = data.list.filter(item => item.dt_txt.includes(today));
    const tomorrowForecasts = data.list.filter(item => item.dt_txt.includes(tomorrowStr));
    
    // Calculate daily forecast values
    const todayForecast = calculateDayForecast(todayForecasts);
    const tomorrowForecast = calculateDayForecast(tomorrowForecasts);
    
    return {
      today: todayForecast,
      tomorrow: tomorrowForecast
    };
  }
  
  /**
   * Calculate aggregated forecast values for a day
   * @param {Array} forecasts - List of forecast intervals for a day
   * @returns {Object|null} - Aggregated forecast or null if no data
   */
  function calculateDayForecast(forecasts) {
    if (!forecasts || forecasts.length === 0) {
      return null;
    }
    
    let maxTemp = -100;
    let minTemp = 100;
    let totalPressure = 0;
    const weatherCounts = {};
    
    // Process each forecast interval
    forecasts.forEach(forecast => {
      // Track max and min temperatures
      if (forecast.main.temp_max > maxTemp) {
        maxTemp = forecast.main.temp_max;
      }
      if (forecast.main.temp_min < minTemp) {
        minTemp = forecast.main.temp_min;
      }
      
      // Sum pressure for average calculation
      totalPressure += forecast.main.pressure;
      
      // Count occurrences of each weather condition
      const weather = forecast.weather[0].description;
      weatherCounts[weather] = (weatherCounts[weather] || 0) + 1;
    });
    
    // Find most frequent weather condition
    let maxCount = 0;
    let mostFrequentWeather = "";
    
    for (const weather in weatherCounts) {
      if (weatherCounts[weather] > maxCount) {
        maxCount = weatherCounts[weather];
        mostFrequentWeather = weather;
      }
    }
    
    // Calculate average pressure
    const avgPressure = Math.round(totalPressure / forecasts.length);
    
    return {
      weather: mostFrequentWeather,
      maxTemp: Math.round(maxTemp * 10) / 10,
      minTemp: Math.round(minTemp * 10) / 10,
      avgPressure: avgPressure
    };
  }
  
  /**
   * Determine headache risk based on weather conditions
   * @param {number} pressure - Atmospheric pressure in hPa
   * @param {string} weather - Weather description
   * @returns {Object} - Risk assessment
   */
  function judgeHeadacheRisk(pressure, weather) {
    let level, forecast, advice, className;
    
    // Base risk on pressure
    if (pressure < 1000) {
      // Low pressure = high risk
      level = '高い';
      forecast = '気圧が低く、頭痛が起こりやすい状態です。';
      advice = '水分をこまめに取り、無理な外出は控えましょう。頭痛薬を携帯し、症状が出たらすぐに服用することをおすすめします。';
      className = 'risk-high';
    } 
    else if (pressure < 1013) {
      // Medium pressure = medium risk
      level = '中程度';
      forecast = '気圧がやや低く、頭痛の可能性があります。';
      advice = '疲労を溜めないよう休息を取り、水分補給を忘れずに行いましょう。';
      className = 'risk-medium';
    } 
    else {
      // High pressure = low risk
      level = '低い';
      forecast = '気圧が安定しており、頭痛のリスクは低めです。';
      advice = '普段通りの生活を心がけ、十分な睡眠と水分補給を意識しましょう。';
      className = 'risk-low';
    }
    
    // Adjust risk based on weather
    if (weather && (weather.includes('雨') || weather.includes('曇'))) {
      // Rainy or cloudy weather increases risk
      if (level === '低い') {
        level = '中程度';
        forecast = '天気が悪く、頭痛の可能性があります。';
        advice = '急な天候の変化に注意し、こまめに休憩を取りましょう。';
        className = 'risk-medium';
      } 
      else if (level === '中程度') {
        level = '高い';
        forecast = '天気が悪く、気圧も不安定で頭痛リスクが高い状態です。';
        advice = '外出はなるべく控え、室内で過ごすことをおすすめします。頭痛薬を携帯しておきましょう。';
        className = 'risk-high';
      }
    }
    
    return {
      level: level,
      forecast: forecast,
      advice: advice,
      class: className
    };
  }