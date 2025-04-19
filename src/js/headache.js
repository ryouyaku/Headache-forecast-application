/**
 * Headache risk calculation module
 * Calculates headache risk based on weather conditions
 */

/**
 * Calculate headache risk based on pressure and weather conditions
 * @param {number} pressure - Atmospheric pressure in hPa
 * @param {string} weather - Weather description
 * @returns {Object} - Risk assessment
 */
function calculateHeadacheRisk(pressure, weather) {
    debugLog(`Calculating risk: pressure=${pressure}, weather=${weather}`);
    
    // Default risk level (low)
    let riskLevel = 'low';
    let forecast = '';
    let advice = '';
    let iconEmoji = '😊';
    let riskClass = 'risk-low';
    
    // Check pressure levels
    if (pressure < 1000) {
      // Low pressure = high risk
      riskLevel = 'high';
      forecast = '気圧が低く、頭痛が起こりやすい状態です。';
      advice = '水分をこまめに取り、無理な外出は控えましょう。頭痛薬を携帯し、症状が出たらすぐに服用することをおすすめします。';
      iconEmoji = '😖';
      riskClass = 'risk-high';
    } 
    else if (pressure < 1013) {
      // Medium pressure = medium risk
      riskLevel = 'medium';
      forecast = '気圧がやや低く、頭痛の可能性があります。';
      advice = '疲労を溜めないよう休息を取り、水分補給を忘れずに行いましょう。';
      iconEmoji = '😐';
      riskClass = 'risk-medium';
    } 
    else {
      // High pressure = low risk
      riskLevel = 'low';
      forecast = '気圧が安定しており、頭痛のリスクは低めです。';
      advice = '普段通りの生活を心がけ、十分な睡眠と水分補給を意識しましょう。';
      iconEmoji = '😊';
      riskClass = 'risk-low';
    }
    
    // Weather adjustments
    if (weather && (weather.includes('雨') || weather.includes('曇'))) {
      // Rainy or cloudy weather increases risk
      if (riskLevel === 'low') {
        riskLevel = 'medium';
        forecast = '天気が悪く、頭痛の可能性があります。';
        advice = '急な天候の変化に注意し、こまめに休憩を取りましょう。';
        iconEmoji = '😐';
        riskClass = 'risk-medium';
      } 
      else if (riskLevel === 'medium') {
        riskLevel = 'high';
        forecast = '天気が悪く、気圧も不安定で頭痛リスクが高い状態です。';
        advice = '外出はなるべく控え、室内で過ごすことをおすすめします。頭痛薬を携帯しておきましょう。';
        iconEmoji = '😖';
        riskClass = 'risk-high';
      }
    }
    
    // Convert risk level to Japanese
    const levelText = riskLevel === 'high' ? '高い' : (riskLevel === 'medium' ? '中程度' : '低い');
    
    debugLog(`Risk calculation result: ${levelText}`);
    
    return {
      level: levelText,
      forecast: forecast,
      advice: advice,
      icon: iconEmoji,
      class: riskClass
    };
  }