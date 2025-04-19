/**
 * 頭痛予報 Application
 * Main application initialization and event handling
 */

// Set to true to enable debug panel
const DEBUG_MODE = false;

// API endpoint for the Cloudflare Worker
const API_ENDPOINT = 'https://headache-forecast.your-username.workers.dev';

/**
 * Debug logging function - only logs when debug mode is enabled
 * @param {string} message - Message to log
 */
function debugLog(message) {
  if (DEBUG_MODE) {
    console.log(message);
    const logElement = document.getElementById('debug-log');
    const timestamp = new Date().toLocaleTimeString();
    logElement.innerHTML += `<div>[${timestamp}] ${message}</div>`;
    
    // Auto-scroll to bottom
    logElement.scrollTop = logElement.scrollHeight;
  }
}

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  debugLog("DOM loaded");
  
  // Show debug panel in debug mode
  if (DEBUG_MODE) {
    document.getElementById('debug-panel').classList.remove('hidden');
  }
  
  // Initialize LIFF after DOM is loaded
  initializeLiff();
  
  // Populate prefecture dropdown
  populatePrefectures();
  
  // Add event listeners
  setupEventListeners();
  
  // Check for URL parameters to auto-search
  checkUrlParameters();
});

/**
 * Set up all event listeners for the application
 */
function setupEventListeners() {
  debugLog("Setting up event listeners");
  
  // Prefecture select change event
  const prefectureSelect = document.getElementById('prefecture');
  prefectureSelect.addEventListener('change', handlePrefectureChange);
  
  // Search button click event
  const searchButton = document.getElementById('search-btn');
  searchButton.addEventListener('click', fetchWeatherData);
  
  // Send to chat button click event
  const sendButton = document.getElementById('send-btn');
  sendButton.addEventListener('click', sendResultToChat);
}

/**
 * Check URL parameters for pre-selected location
 */
function checkUrlParameters() {
  debugLog("Checking URL parameters");
  
  const params = new URLSearchParams(window.location.search);
  const city = params.get('city');
  
  if (city) {
    debugLog(`URL parameter city found: ${city}`);
    selectMatchingLocation(city);
  }
}

/**
 * Select the matching prefecture and city from URL parameter
 * @param {string} cityParam - City name from URL parameter
 */
function selectMatchingLocation(cityParam) {
  debugLog(`Selecting location: ${cityParam}`);
  
  // Find matching prefecture
  for (const pref of prefectures) {
    if (cityParam.includes(pref.name)) {
      // Select the prefecture
      document.getElementById('prefecture').value = pref.code;
      handlePrefectureChange();
      
      // Find matching city
      const citySelect = document.getElementById('city');
      for (let i = 0; i < citySelect.options.length; i++) {
        if (cityParam.includes(citySelect.options[i].value) && citySelect.options[i].value !== "") {
          citySelect.selectedIndex = i;
          debugLog(`City selected: ${citySelect.options[i].value}`);
          break;
        }
      }
      
      // Trigger search
      fetchWeatherData();
      break;
    }
  }
}

/**
 * Handle prefecture selection change
 */
function handlePrefectureChange() {
  const prefCode = document.getElementById('prefecture').value;
  const citySelect = document.getElementById('city');
  
  debugLog(`Prefecture changed: ${prefCode}`);
  
  // Reset city dropdown
  citySelect.innerHTML = '<option value="">市区町村を選択</option>';
  
  if (prefCode) {
    // Get cities for selected prefecture
    const cities = majorCities[prefCode] || [];
    debugLog(`Adding ${cities.length} cities`);
    
    // Add cities to dropdown
    cities.forEach(city => {
      const option = document.createElement('option');
      option.value = city.name;
      option.textContent = city.name;
      citySelect.appendChild(option);
    });
    
    // Enable city selection
    citySelect.disabled = false;
  } else {
    // Disable city selection if no prefecture is selected
    citySelect.disabled = true;
    debugLog("City selection disabled");
  }
}

/**
 * Fetch weather data from the API
 */
async function fetchWeatherData() {
  debugLog("fetchWeatherData started");
  
  const prefecture = document.getElementById('prefecture');
  const city = document.getElementById('city');
  
  if (!prefecture.value) {
    alert('都道府県を選択してください');
    debugLog("Error: No prefecture selected");
    return;
  }
  
  // Get location (prefecture + city if selected)
  let location = prefectures.find(p => p.code === prefecture.value).name;
  if (city.value) {
    location = city.value;
  }
  
  debugLog(`Location for search: ${location}`);
  
  // Show loading, hide results and errors
  showLoading(true);
  hideResult();
  hideError();
  
  try {
    // Fetch weather data
    debugLog("Fetching weather data");
    const weatherData = await getWeatherData(location);
    debugLog("Weather data fetched successfully");
    
    // Display location
    document.getElementById('location-display').textContent = location;
    
    // Display current weather
    document.getElementById('current-weather').textContent = weatherData.currentWeather.weatherMain;
    document.getElementById('current-temp').textContent = `${weatherData.currentWeather.temperature}℃`;
    document.getElementById('current-humidity').textContent = `${weatherData.currentWeather.humidity}%`;
    document.getElementById('current-pressure').textContent = `${weatherData.currentWeather.pressure}hPa`;
    
    // Display forecast
    if (weatherData.forecast.today) {
      document.getElementById('today-weather').textContent = weatherData.forecast.today.weather;
      document.getElementById('today-max-temp').textContent = `${weatherData.forecast.today.maxTemp}℃`;
      document.getElementById('today-min-temp').textContent = `${weatherData.forecast.today.minTemp}℃`;
      document.getElementById('today-pressure').textContent = `${weatherData.forecast.today.avgPressure}hPa`;
    }
    
    if (weatherData.forecast.tomorrow) {
      document.getElementById('tomorrow-weather').textContent = weatherData.forecast.tomorrow.weather;
      document.getElementById('tomorrow-max-temp').textContent = `${weatherData.forecast.tomorrow.maxTemp}℃`;
      document.getElementById('tomorrow-min-temp').textContent = `${weatherData.forecast.tomorrow.minTemp}℃`;
      document.getElementById('tomorrow-pressure').textContent = `${weatherData.forecast.tomorrow.avgPressure}hPa`;
    }
    
    // Calculate and display headache risk
    const headacheRisk = calculateHeadacheRisk(
      weatherData.currentWeather.pressure, 
      weatherData.currentWeather.weatherMain
    );
    
    displayHeadacheRisk(headacheRisk);
    
    // Show results
    showResult();
    debugLog("Results displayed");
    
  } catch (error) {
    debugLog(`Error occurred: ${error.message || error}`);
    document.getElementById('error-text').textContent = error.message || 
      '地域名が正しくないか、サーバーとの通信に問題があります。';
    showError();
  } finally {
    showLoading(false);
  }
}

/**
 * Display headache risk information
 * @param {Object} risk - Risk calculation result
 */
function displayHeadacheRisk(risk) {
  debugLog(`Displaying risk level: ${risk.level}`);
  
  const riskIndicator = document.getElementById('risk-indicator');
  riskIndicator.className = `p-4 rounded-lg mb-6 ${risk.class}`;
  
  document.getElementById('risk-icon').innerHTML = risk.icon;
  document.getElementById('risk-level').textContent = `頭痛リスク：${risk.level}`;
  document.getElementById('risk-forecast').textContent = risk.forecast;
  document.getElementById('risk-advice').textContent = risk.advice;
}

/**
 * UI display toggle functions
 */
function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'flex' : 'none';
  debugLog(`Loading display: ${show ? 'visible' : 'hidden'}`);
}

function showResult() {
  document.getElementById('result-section').style.display = 'block';
  debugLog("Result section displayed");
}

function hideResult() {
  document.getElementById('result-section').style.display = 'none';
  debugLog("Result section hidden");
}

function showError() {
  document.getElementById('error-message').style.display = 'block';
  debugLog("Error message displayed");
}

function hideError() {
  document.getElementById('error-message').style.display = 'none';
  debugLog("Error message hidden");
}

/**
 * Populate prefecture dropdown with data from prefectures.js
 */
function populatePrefectures() {
  debugLog("Populating prefecture dropdown");
  
  const prefectureSelect = document.getElementById('prefecture');
  
  prefectures.forEach(prefecture => {
    const option = document.createElement('option');
    option.value = prefecture.code;
    option.textContent = prefecture.name;
    prefectureSelect.appendChild(option);
  });
  
  debugLog(`${prefectures.length} prefectures added to dropdown`);
}