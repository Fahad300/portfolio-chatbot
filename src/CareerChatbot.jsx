import React, { useState, useRef, useEffect } from 'react';
import AIChatbot from './chatbotLogic';
import UserTracker from './userTracking';
import './CareerChatbot.css';

// IMPORTANT: Add your Groq API key here
// Get free API key from: https://console.groq.com/keys
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY || '';

const CareerChatbot = () => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "Hey there! 👋 I'm Fahad's Career Digital Twin. Think of me as his friendly AI assistant - I can chat about his work, skills, projects, or whatever you're curious about. What's on your mind?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const chatbotRef = useRef(null);
  const userTrackerRef = useRef(null);

  // Initialize chatbot and user tracking on mount
  useEffect(() => {
    chatbotRef.current = new AIChatbot(GROQ_API_KEY);
    userTrackerRef.current = new UserTracker();

    if (!GROQ_API_KEY) {
      console.warn('⚠️ No Groq API key found. Using fallback responses.');
    }

    // Get user location (optional, async, respects env flag)
    userTrackerRef.current.getLocation().then(location => {
      if (location) {
        console.log('📍 User Location:', location);
      }
    });

    // Send analytics when component unmounts (user leaves)
    return () => {
      if (userTrackerRef.current) {
        userTrackerRef.current.sendAnalytics();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim() || isTyping) return;

    // Add user message
    const userMessage = {
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    const currentInput = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Track user message
      if (userTrackerRef.current) {
        userTrackerRef.current.trackMessage(currentInput, false);
      }

      // Get AI response
      const response = await chatbotRef.current.generateResponse(currentInput);

      // Simulate typing delay for more natural feel
      const typingDelay = Math.min(1500, 600 + (response.length * 8));

      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: response,
          timestamp: new Date()
        }]);
        setIsTyping(false);
      }, typingDelay);

    } catch (error) {
      console.error('Error generating response:', error);
      // The generateResponse method should always return a fallback response,
      // but just in case, show a helpful message
      setMessages(prev => [...prev, {
        type: 'bot',
        text: "I'm having trouble connecting right now, but I can still help! Try asking about Fahad's background, skills, or how to reach him. 😊",
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question) => {
    if (isTyping) return;

    // Track quick question
    if (userTrackerRef.current) {
      userTrackerRef.current.trackQuickQuestion(question);
      userTrackerRef.current.trackMessage(question, true);
    }

    const userMessage = {
      type: 'user',
      text: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Use fallback response directly (no API call for quick questions)
    // This saves API calls and provides instant responses
    const response = chatbotRef.current.getFallbackResponse(question);
    const typingDelay = Math.min(800, 300 + (response.length * 5)); // Faster for quick questions

    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: response,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, typingDelay);
  };

  // Dynamic quick questions that change based on conversation
  const getQuickQuestions = () => {
    const messageCount = messages.length;

    // Initial questions (first interaction)
    if (messageCount <= 1) {
      return [
        "What's Fahad's experience?",
        "Show me his portfolio",
        "Is he available to hire?",
        "What makes him different?"
      ];
    }

    // Follow-up questions (after first interaction)
    const followUpSets = [
      [
        "Tell me about his projects",
        "Healthcare expertise?",
        "What's his tech stack?",
        "How can I contact him?"
      ],
      [
        "Remote work availability?",
        "What's his process?",
        "Show case studies",
        "Design or development?"
      ]
    ];

    // Rotate through different question sets
    const setIndex = Math.floor((messageCount - 1) / 2) % followUpSets.length;
    return followUpSets[setIndex];
  };

  const quickQuestions = getQuickQuestions();

  return (
    <div className="chatbot-container">
      {/* Stats link */}
      <a
        href="/stats"
        target="_blank"
        rel="noreferrer"
        className="stats-link"
        style={{
          position: 'fixed',
          top: '10px',
          right: '12px',
          fontSize: '12px',
          color: '#fff',
          background: '#667eea',
          padding: '6px 10px',
          borderRadius: '8px',
          textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000
        }}
      >
        📊 Stats
      </a>

      {/* Chat Toggle Button */}
      <button
        className={`chat-toggle ${isChatOpen ? 'open' : ''}`}
        onClick={() => {
          setIsChatOpen(!isChatOpen);
          if (!isChatOpen && userTrackerRef.current) {
            userTrackerRef.current.trackChatOpened();
          }
        }}
        aria-label="Toggle chat"
      >
        {isChatOpen ? (
          <img alt="" src="./chatbot.png" />
        ) : (
          <img alt="" src="./chatbot.png" />
        )}
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="chat-window">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="avatar">FM</div>
              <div>
                <h3>Fahad's Digital Twin</h3>
                <p className="status">
                  <span className="status-dot"></span>
                  Instant Replies
                </p>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="messages-container">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.type}`}
              >
                {message.type === 'bot' && (
                  <div className="message-avatar bot">
                    <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Modern circular background */}
                      <circle cx="24" cy="24" r="23" fill="url(#avatarGradient)" />
                      <defs>
                        <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#667eea', stopOpacity: 1 }} />
                          <stop offset="100%" style={{ stopColor: '#764ba2', stopOpacity: 1 }} />
                        </linearGradient>
                      </defs>

                      {/* Stylized "F" lettermark - unique and memorable */}
                      <path d="M17 13h14v3.5h-10v4.5h9v3.5h-9v9.5h-4V13z" fill="white" fillOpacity="0.95" />

                      {/* Tech accent elements - circuit-inspired dots */}
                      <g opacity="0.5">
                        <circle cx="33" cy="33" r="1.2" fill="white" />
                        <circle cx="36" cy="30" r="0.8" fill="white" />
                        <circle cx="30" cy="36" r="0.8" fill="white" />
                        <line x1="33" y1="33" x2="36" y2="30" stroke="white" strokeWidth="0.5" />
                        <line x1="33" y1="33" x2="30" y2="36" stroke="white" strokeWidth="0.5" />
                      </g>

                      {/* Subtle glow effect */}
                      <circle cx="24" cy="24" r="23" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2" />
                    </svg>
                  </div>
                )}
                <div className="message-content">
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                {message.type === 'user' && (
                  <div className="message-avatar user">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="message bot">
                <div className="message-avatar">🤖</div>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions - Always Visible */}
          <div className="quick-questions">
            <p className="quick-questions-label">Quick questions:</p>
            <div className="quick-questions-grid">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  className="quick-question-btn"
                  onClick={() => handleQuickQuestion(question)}
                  disabled={isTyping}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about Fahad..."
              className="chat-input"
              disabled={isTyping}
            />
            <button
              type="submit"
              className="send-button"
              disabled={!inputValue.trim() || isTyping}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M2 10L18 2L10 18L8 11L2 10Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CareerChatbot;