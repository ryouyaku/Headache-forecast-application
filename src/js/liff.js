/**
 * LINE LIFF integration module
 * Handles LINE Front-end Framework initialization and messaging
 */

// Replace with your actual LIFF ID
const LIFF_ID = "2007239534-bnjnyNja";

/**
 * Initialize LIFF
 */
function initializeLiff() {
  debugLog("Initializing LIFF");
  
  // Check if LIFF is defined
  if (typeof liff === 'undefined') {
    debugLog("LIFF SDK not found");
    return;
  }
  
  // Initialize LIFF
  liff.init({
    liffId: LIFF_ID
  })
  .then(() => {
    debugLog("LIFF initialized successfully");
    // Check if running in LINE
    if (liff.isInClient()) {
      debugLog("Running in LINE client");
    } else {
      debugLog("Running in external browser");
      // Hide send to chat button if not in LINE
      document.getElementById('send-btn').style.display = 'none';
    }
  })
  .catch((error) => {
    debugLog(`LIFF initialization error: ${error}`);
    // Hide send to chat button on error
    document.getElementById('send-btn').style.display = 'none';
  });
}

/**
 * Send results to LINE chat
 */
function sendResultToChat() {
  debugLog("Sending results to chat");
  
  // Check if LIFF is available and running in LINE client
  if (typeof liff === 'undefined' || !liff.isInClient()) {
    alert("この機能はLINE内でのみご利用いただけます。");
    debugLog("Not in LINE client, cannot send to chat");
    return;
  }
  
  try {
    // Get display data
    const location = document.getElementById('location-display').textContent;
    const riskLevel = document.getElementById('risk-level').textContent;
    const riskForecast = document.getElementById('risk-forecast').textContent;
    const riskAdvice = document.getElementById('risk-advice').textContent;
    
    // Current weather data
    const currentWeather = document.getElementById('current-weather').textContent;
    const currentTemp = document.getElementById('current-temp').textContent;
    const currentPressure = document.getElementById('current-pressure').textContent;
    
    // Determine color based on risk level
    let riskColor = "#10B981"; // Low risk (green)
    if (riskLevel.includes("高い")) {
      riskColor = "#EF4444"; // High risk (red)
    } else if (riskLevel.includes("中程度")) {
      riskColor = "#F59E0B"; // Medium risk (yellow)
    }
    
    // Create Flex Message
    const message = {
      type: "flex",
      altText: `${location}の頭痛予報`,
      contents: {
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "頭痛予報",
              weight: "bold",
              color: "#1F76DC",
              size: "xl"
            }
          ]
        },
        hero: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: location,
              weight: "bold",
              size: "xl",
              margin: "md"
            },
            {
              type: "text",
              text: riskLevel,
              size: "lg",
              color: riskColor,
              margin: "md",
              weight: "bold"
            }
          ]
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "vertical",
              margin: "lg",
              spacing: "sm",
              contents: [
                {
                  type: "box",
                  layout: "baseline",
                  spacing: "sm",
                  contents: [
                    {
                      type: "text",
                      text: "天気",
                      color: "#aaaaaa",
                      size: "sm",
                      flex: 2
                    },
                    {
                      type: "text",
                      text: currentWeather,
                      wrap: true,
                      color: "#666666",
                      size: "sm",
                      flex: 5
                    }
                  ]
                },
                {
                  type: "box",
                  layout: "baseline",
                  spacing: "sm",
                  contents: [
                    {
                      type: "text",
                      text: "気温",
                      color: "#aaaaaa",
                      size: "sm",
                      flex: 2
                    },
                    {
                      type: "text",
                      text: currentTemp,
                      wrap: true,
                      color: "#666666",
                      size: "sm",
                      flex: 5
                    }
                  ]
                },
                {
                  type: "box",
                  layout: "baseline",
                  spacing: "sm",
                  contents: [
                    {
                      type: "text",
                      text: "気圧",
                      color: "#aaaaaa",
                      size: "sm",
                      flex: 2
                    },
                    {
                      type: "text",
                      text: currentPressure,
                      wrap: true,
                      color: "#666666",
                      size: "sm",
                      flex: 5
                    }
                  ]
                }
              ]
            },
            {
              type: "separator",
              margin: "lg"
            },
            {
              type: "box",
              layout: "vertical",
              margin: "lg",
              contents: [
                {
                  type: "text",
                  text: riskForecast,
                  size: "sm",
                  wrap: true
                },
                {
                  type: "text",
                  text: "【対処法】",
                  margin: "md",
                  size: "sm",
                  weight: "bold"
                },
                {
                  type: "text",
                  text: riskAdvice,
                  margin: "sm",
                  size: "sm",
                  wrap: true
                }
              ]
            }
          ]
        },
        styles: {
          header: {
            backgroundColor: "#f0f8ff"
          }
        }
      }
    };
    
    // Send message to chat
    liff.sendMessages([message])
      .then(() => {
        alert("頭痛予報をチャットに送信しました");
        debugLog("Message sent to chat successfully");
      })
      .catch((error) => {
        alert("送信に失敗しました。もう一度お試しください。");
        debugLog(`Error sending message: ${error}`);
      });
  } catch (error) {
    debugLog(`Error in sendResultToChat: ${error}`);
    alert("送信処理中にエラーが発生しました。");
  }
}