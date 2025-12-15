// userTracking.js
// Tracks user interactions and analytics

class UserTracker {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = new Date();
    this.userInfo = this.collectUserInfo();
    this.interactions = [];
    this.messageCount = 0;
  }

  // Generate unique session ID
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Collect basic user info (browser, device, etc.)
  collectUserInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString(),
    };
  }

  // Track when chat is opened
  trackChatOpened() {
    this.logInteraction('chat_opened', {
      timestamp: new Date().toISOString()
    });
  }

  // Track when message is sent
  trackMessage(message, isQuickQuestion = false) {
    this.messageCount++;
    this.interactions.push({
      type: 'message',
      message: message,
      isQuickQuestion: isQuickQuestion,
      messageNumber: this.messageCount,
      timestamp: new Date().toISOString()
    });
  }

  // Track quick question clicks
  trackQuickQuestion(question) {
    this.logInteraction('quick_question', {
      question: question,
      timestamp: new Date().toISOString()
    });
  }

  // Track general interactions
  logInteraction(type, data = {}) {
    this.interactions.push({
      type: type,
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  // Get session summary
  getSessionSummary() {
    const duration = Math.floor((new Date() - this.startTime) / 1000);
    return {
      sessionId: this.sessionId,
      startTime: this.startTime.toISOString(),
      duration: duration,
      messageCount: this.messageCount,
      userInfo: this.userInfo,
      interactions: this.interactions,
      summary: {
        totalMessages: this.messageCount,
        quickQuestions: this.interactions.filter(i => i.type === 'quick_question').length,
        customMessages: this.interactions.filter(i => i.type === 'message' && !i.isQuickQuestion).length,
        chatOpened: this.interactions.some(i => i.type === 'chat_opened')
      }
    };
  }

  // Send analytics to server (optional - you can create an endpoint)
  async sendAnalytics(endpoint = null) {
    const data = this.getSessionSummary();
    
    // Log to console (you can see it in browser console)
    console.log('📊 User Analytics:', data);

    // Send to analytics endpoint if provided
    const analyticsUrl = process.env.REACT_APP_ANALYTICS_URL || endpoint || null;
    
    if (analyticsUrl && analyticsUrl !== 'false') {
      try {
        await fetch(analyticsUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
        console.log('✅ Analytics sent to server');
      } catch (error) {
        console.error('Failed to send analytics:', error);
        // Still return data even if send fails
      }
    }
    
    return data;
  }

  // Get user's approximate location (IP-based) — optional and disabled by default
  async getLocation() {
    // Only attempt if explicitly enabled via env flag
    if (process.env.REACT_APP_ENABLE_LOCATION !== 'true') {
      return null;
    }
    try {
      // Use a backend proxy/endpoint to avoid CORS issues and keep tokens server-side
      const locationUrl =
        process.env.REACT_APP_LOCATION_URL ||
        'https://chat.website.com/api/location.php';

      const response = await fetch(locationUrl);
      if (!response.ok) throw new Error('Failed to fetch location');
      const data = await response.json();
      return {
        country: data.country_name,
        city: data.city,
        region: data.region,
        ip: data.ip,
        timezone: data.timezone
      };
    } catch (error) {
      console.error('Failed to get location:', error);
      return null;
    }
  }
}

export default UserTracker;

