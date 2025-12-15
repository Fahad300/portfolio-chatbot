// chatbotLogic.js
// AI-powered chatbot using Groq (free tier, fast)

import Groq from 'groq-sdk';
import knowledgeBase from './career-digital-twin-knowledge-base.json';

class AIChatbot {
  constructor(apiKey) {
    this.kb = knowledgeBase;
    this.conversationHistory = [];

    // Use Groq (free tier, very fast)
    const groqApiKey = process.env.REACT_APP_GROQ_API_KEY || apiKey;
    if (!groqApiKey) {
      console.warn('No Groq API key provided. Using fallback responses.');
      this.groqClient = null;
    } else {
      // Allow browser usage for local development
      // ⚠️ WARNING: In production, use the PHP proxy instead to keep API key secure
      // Set REACT_APP_USE_PROXY=true to use the proxy
      this.groqClient = new Groq({
        apiKey: groqApiKey,
        dangerouslyAllowBrowser: true // Only for development - use proxy in production!
      });
      console.log('✓ Using Groq LLM (free tier, fast)');
      console.warn('⚠️ API key is exposed in browser. For production, use REACT_APP_USE_PROXY=true');
    }
  }

  // Create the system prompt that defines the chatbot's personality
  createSystemPrompt() {
    return `You are Fahad's Career Digital Twin - a friendly, professional AI assistant representing Fahad Mushtaq, a UI/UX Engineer.

PERSONALITY & TONE:
- Be warm, friendly, and conversational (like chatting with a colleague)
- Use casual language but stay professional
- Be enthusiastic about Fahad's work and skills
- Use emojis occasionally to be personable (but don't overdo it)
- Keep responses SHORT and punchy (1-2 sentences max, be concise!)
- Avoid sounding robotic or resume-like
- Be helpful and encouraging

HANDLING USER INPUT:
- UNDERSTAND TYPOS: If user makes spelling mistakes, understand what they meant and respond naturally
  Example: "wht is ur experiance?" → Understand they're asking about experience
  Example: "can u cod?" → Understand they're asking about coding skills
  Example: "tel me abot hes skils" → Understand they want to know about skills
  
- HANDLE OFF-TOPIC QUESTIONS: If asked something not related to Fahad's career, politely redirect
  Example: "What's the weather?" → "I'm here to talk about Fahad's professional background! Want to know about his experience, skills, or projects? 😊"
  Example: "Tell me a joke" → "Haha, I'd love to, but I'm better at talking about Fahad's work! Ask me about his UI/UX projects or technical skills instead!"
  Example: "Who won the game?" → "I'm focused on Fahad's career stuff! But I can tell you about the projects he's 'won' - his healthcare apps are pretty impressive! Want to hear more?"
  
- HANDLE VAGUE QUESTIONS: Ask for clarification when needed
  Example: "Tell me about him" → "I'd love to! What interests you most - his work experience, technical skills, or his healthcare expertise?"
  Example: "What can he do?" → "Fahad can do a lot! Are you curious about his design skills, development abilities, or maybe his project experience?"
  
- BE HELPFUL WITH UNCLEAR INPUT: Try to understand intent and offer options
  Example: "stuff he did" → "Are you asking about his work experience or specific projects?"
  Example: "good?" → "Want to know if Fahad's good at what he does? Absolutely! He's got 8+ years crushing it in UI/UX. What specifically interests you?"

- STAY ON TOPIC: Always bring conversation back to Fahad's professional background
  If someone asks about politics, sports, weather, news, etc. - politely redirect without being rude

- HANDLE GIBBERISH: If input is completely unclear, ask politely
  Example: "asdfghjkl" → "I didn't quite catch that! Could you try again? I'm here to help with questions about Fahad's work, skills, or experience. 😊"

YOUR KNOWLEDGE ABOUT FAHAD:
${JSON.stringify(this.kb, null, 2)}

RESPONSE GUIDELINES:
1. Answer naturally like you're Fahad's friendly representative
2. Don't just list facts - tell a story or provide context
3. If asked about experience: mention specific achievements or interesting projects
4. If asked about skills: explain how he uses them, not just list them
5. Be conversational: "Fahad's been in the UI/UX game for 8+ years..." instead of "He has 8 years experience"
6. Add personality: "He absolutely loves working on healthcare apps..." instead of "He works on healthcare applications"
7. Keep it brief and engaging - people prefer short, friendly responses
8. If you don't know something, be honest and suggest how they can learn more
9. ALWAYS try to understand user intent even with typos or poor grammar
10. Politely redirect off-topic questions back to Fahad's career

PRIVACY RULES (NEVER SHARE):
- Phone number
- Exact salary
- Personal address
- Specific salary history

WHAT YOU CAN SHARE:
- Email address: ${this.kb.personalInfo.email}
- LinkedIn profile: ${this.kb.personalInfo.linkedin}
- Portfolio website: ${this.kb.personalInfo.portfolio}
- GitHub: ${this.kb.personalInfo.github}
- General location (Lahore, Pakistan)

IMPORTANT - CONTACT QUESTIONS:
When someone asks "How can I reach him?" or "How to contact?" or "Get in touch" - ALWAYS provide the actual contact details:
Example response: "You can reach Fahad through:\n📧 Email: ${this.kb.personalInfo.email}\n💼 LinkedIn: ${this.kb.personalInfo.linkedin}\n🌐 Portfolio: ${this.kb.personalInfo.portfolio}\n\nHe's pretty responsive and would love to connect!"

When someone asks about email specifically, share: ${this.kb.personalInfo.email}
When someone asks about LinkedIn, share: ${this.kb.personalInfo.linkedin}

HANDLING EDGE CASES:
- Multiple questions at once: Answer the most important one or all briefly
- Very long questions: Extract the main point
- Inappropriate content: Stay professional, don't engage, redirect
- Repeated questions: Answer naturally, maybe with different phrasing
- Questions you can't answer: Be honest but helpful - "I don't have that specific detail, but I know [related info]. Want me to share Fahad's contact so you can ask him directly?"

Remember: You're smart AI that understands intent! Be helpful, handle typos gracefully, stay on topic, and always be friendly!`;
  }

  // Generate response using Groq API (with proxy support)
  async generateResponse(userInput) {
    // Check if we should use PHP proxy
    const useProxy = process.env.REACT_APP_USE_PROXY === 'true';
    const proxyUrl = process.env.REACT_APP_PROXY_URL || 'https://chat.fahadmushtaq.com/api/chat.php';
    console.log('Using proxy:', useProxy);
    if (useProxy) {
      console.log('Proxy URL:', proxyUrl);
    }

    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        text: userInput
      });

      let responseText;

      // Use PHP proxy if enabled (for production on hosting)
      if (useProxy) {
        const fullPrompt = `${this.createSystemPrompt()}

CONVERSATION SO FAR:
${this.conversationHistory.slice(-5).map(msg =>
          `${msg.role === 'user' ? 'Visitor' : 'You'}: ${msg.text}`
        ).join('\n')}

Respond naturally and conversationally to the visitor's latest message. Keep it SHORT (1-2 sentences max), friendly, and engaging!`;

        try {
          const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: fullPrompt })
          });

          if (!response.ok) {
            if (response.status === 404) {
              console.warn('Proxy endpoint not found (404). Falling back to direct API or fallback responses.');
              throw new Error('PROXY_NOT_FOUND');
            }
            const errorText = await response.text();
            console.error('Proxy API error:', response.status, errorText);
            throw new Error(`API request failed: ${response.status}`);
          }

          // Check if response is JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.warn('Proxy returned non-JSON response. Falling back...');
            throw new Error('PROXY_NOT_FOUND');
          }

          const data = await response.json();

          if (data.error) {
            throw new Error(data.error);
          }

          // Parse response format (compatible with both direct and proxy)
          if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
            responseText = data.candidates[0].content.parts[0].text;
          } else if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
            // Direct Groq format
            responseText = data.choices[0].message.content;
          } else {
            console.error('Unexpected response format from proxy:', data);
            throw new Error('Invalid response format from proxy');
          }
        } catch (fetchError) {
          // If proxy fails, try direct API if available, otherwise use fallback
          if (fetchError.message === 'PROXY_NOT_FOUND' ||
            fetchError.message.includes('404') ||
            fetchError.message.includes('Failed to fetch') ||
            fetchError.name === 'TypeError') {
            console.warn('Proxy unavailable:', fetchError.message, '- Attempting direct API or fallback...');
            // Fall through to direct API or fallback
            if (!this.groqClient) {
              return this.getFallbackResponse(userInput);
            }
            // Continue to direct API call below
          } else {
            throw fetchError;
          }
        }

        // If proxy succeeded, return the response
        if (responseText) {
          // Add bot response to history
          this.conversationHistory.push({
            role: 'bot',
            text: responseText
          });
          return responseText;
        }
      }

      // Direct API call (for local development or when proxy fails)
      // Use Groq if available
      if (this.groqClient) {
        try {
          console.log('Using Groq API...');
          const completion = await this.groqClient.chat.completions.create({
            messages: [
              { role: 'system', content: this.createSystemPrompt() },
              ...this.conversationHistory.slice(-5).map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.text
              })),
              { role: 'user', content: userInput }
            ],
            model: 'llama-3.1-8b-instant', // Free tier model - very fast!
            temperature: 0.9,
            max_tokens: 150, // Keep responses short (1-2 sentences)
          });
          responseText = completion.choices[0]?.message?.content || '';
          if (responseText) {
            console.log('✓ Groq response received');
          }
        } catch (groqError) {
          console.error('Groq API Error:', groqError);
          // Check if it's a rate limit error
          if (groqError.message?.includes('rate limit') ||
            groqError.message?.includes('429') ||
            groqError.status === 429 ||
            groqError.code === 'rate_limit_exceeded') {
            console.warn('⚠️ Rate limit reached. Using fallback responses.');
            // Don't throw - fall through to fallback
            responseText = null;
          } else {
            throw groqError;
          }
        }
      }
      // Fallback mode if no API key
      else {
        return this.getFallbackResponse(userInput);
      }

      // If API call failed, use fallback
      if (!responseText) {
        return this.getFallbackResponse(userInput);
      }

      // Add bot response to history
      this.conversationHistory.push({
        role: 'bot',
        text: responseText
      });

      return responseText;

    } catch (error) {
      console.error('API Error:', error);
      // Check if it's a rate limit error
      if (error.message?.includes('rate limit') ||
        error.message?.includes('429') ||
        error.status === 429 ||
        error.code === 'rate_limit_exceeded') {
        console.warn('⚠️ Rate limit reached. Using fallback responses.');
      } else {
        console.log('✅ Falling back to intelligent responses - chatbot is still fully functional!');
      }
      return this.getFallbackResponse(userInput);
    }
  }

  // Fallback responses if API fails or no key provided
  getFallbackResponse(userInput) {
    const input = userInput.toLowerCase().trim();

    // Exact quick-question answers map
    const quickAnswers = {
      "what's fahad's experience?": "8+ years in UI/UX! Started as a graphic designer, moved to front-end dev, now specializes in healthcare apps at Persivia. 🏥",
      "whats fahad's experience?": "8+ years in UI/UX! Started as a graphic designer, moved to front-end dev, now specializes in healthcare apps at Persivia. 🏥",
      "show me his portfolio": `See his work: ${this.kb.personalInfo.portfolio} - Healthcare platforms, patient dashboards, clinical workflows! 🎨`,
      "is he available to hire?": "Yes! Actively looking - remote, hybrid, on-site, or freelance. Flexible and ready to chat! 🚀",
      "what makes him different?": "Design + Code + Healthcare UX expertise! 8+ years experience, sees projects through from concept to code. Collaborative and detail-oriented! 🚀",
      "tell me about his projects": `Healthcare platforms, patient dashboards, clinical workflows. See full case studies: ${this.kb.personalInfo.portfolio}`,
      "healthcare expertise?": "Healthcare UX specialist! Designs patient management systems, medical dashboards, HIPAA-compliant interfaces. 🏥",
      "what's his tech stack?": "Design + Code combo! Figma for design, React for building, plus healthcare UX expertise. Pretty versatile! 💪",
      "whats his tech stack?": "Design + Code combo! Figma for design, React for building, plus healthcare UX expertise. Pretty versatile! 💪",
      "how can i contact him?": `📧 ${this.kb.personalInfo.email} | 💼 ${this.kb.personalInfo.linkedin} | 🌐 ${this.kb.personalInfo.portfolio}`,
      "remote work availability?": "Based in Lahore, Pakistan. Fully set up for remote work - experienced with distributed teams! 💻",
      "what's his process?": "Research → Design (Figma) → Prototype → Build (React) → Test → Iterate. User-centered approach with healthcare compliance in mind! 🔄",
      "whats his process?": "Research → Design (Figma) → Prototype → Build (React) → Test → Iterate. User-centered approach with healthcare compliance in mind! 🔄",
      "show case studies": `See detailed case studies on his portfolio: ${this.kb.personalInfo.portfolio} - Healthcare platforms, patient dashboards, and more! 📊`,
      "design or development?": "Both! He designs in Figma AND codes in React. Full-stack UI/UX - from concept to production. Best of both worlds! 🎨💻"
    };

    if (quickAnswers[input]) {
      return quickAnswers[input];
    }

    // Handle very short or unclear input
    if (input.length < 3) {
      return "I didn't quite catch that! 😅 Ask me about Fahad's experience, skills, projects, or how to get in touch!";
    }

    // Handle common typos in greetings
    if (input.match(/h[ie]|h[ey]|hlo|helo|helloo|hii|hay|heya/)) {
      return "Hey there! 👋 I'm Fahad's digital assistant. I can tell you all about his work, skills, and what he's been up to. What would you like to know?";
    }

    // SPECIFIC QUICK QUESTION HANDLERS (check these first for exact matches)
    // Order matters - more specific patterns first

    // SPECIFIC QUICK QUESTION HANDLERS - Match exact quick questions first
    // Using flexible patterns to catch all variations

    // "Show case studies" (check before portfolio to avoid conflict)
    if (input.includes('case stud') || input.includes('case study')) {
      return `See detailed case studies on his portfolio: ${this.kb.personalInfo.portfolio} - Healthcare platforms, patient dashboards, and more! 📊`;
    }

    // "Show me his portfolio"
    if (input.includes('portfolio') || (input.includes('show') && input.includes('portfolio'))) {
      return `See his work: ${this.kb.personalInfo.portfolio} - Healthcare platforms, patient dashboards, clinical workflows! 🎨`;
    }

    // "What's Fahad's experience?" or "What's his experience?"
    if (input.includes('experien') && (input.includes('fahad') || input.includes('his') || input.includes('what'))) {
      return "8+ years in UI/UX! Started as a graphic designer, moved to front-end dev, now specializes in healthcare apps at Persivia. 🏥";
    }

    // "Is he available to hire?" or "available to hire"
    if ((input.includes('available') && input.includes('hire')) || (input.includes('hire') && input.includes('available'))) {
      return "Yes! Actively looking - remote, hybrid, on-site, or freelance. Flexible and ready to chat! 🚀";
    }

    // "What makes him different?"
    if (input.includes('different') && (input.includes('makes') || input.includes('what'))) {
      return "Design + Code + Healthcare UX expertise! 8+ years experience, sees projects through from concept to code. Collaborative and detail-oriented! 🚀";
    }

    // "Tell me about his projects"
    if (input.includes('project') && (input.includes('tell') || input.includes('about'))) {
      return `Healthcare platforms, patient dashboards, clinical workflows. See full case studies: ${this.kb.personalInfo.portfolio}`;
    }

    // "Healthcare expertise?"
    if (input.includes('healthcare') && (input.includes('expertise') || input.includes('expert'))) {
      return "Healthcare UX specialist! Designs patient management systems, medical dashboards, HIPAA-compliant interfaces. 🏥";
    }

    // "What's his tech stack?"
    if (input.includes('tech stack') || (input.includes('tech') && input.includes('stack'))) {
      return "Design + Code combo! Figma for design, React for building, plus healthcare UX expertise. Pretty versatile! 💪";
    }

    // "How can I contact him?"
    if (input.includes('contact') && (input.includes('how') || input.includes('can'))) {
      return `📧 ${this.kb.personalInfo.email} | 💼 ${this.kb.personalInfo.linkedin} | 🌐 ${this.kb.personalInfo.portfolio}`;
    }

    // "Remote work availability?"
    if (input.includes('remote') && (input.includes('work') || input.includes('avail'))) {
      return "Based in Lahore, Pakistan. Fully set up for remote work - experienced with distributed teams! 💻";
    }

    // "What's his process?"
    if (input.includes('process') && (input.includes('what') || input.includes('his'))) {
      return "Research → Design (Figma) → Prototype → Build (React) → Test → Iterate. User-centered approach with healthcare compliance in mind! 🔄";
    }

    // "Design or development?"
    if ((input.includes('design') && input.includes('dev')) || (input.includes('design') && input.includes('development'))) {
      return "Both! He designs in Figma AND codes in React. Full-stack UI/UX - from concept to production. Best of both worlds! 🎨💻";
    }

    // GENERAL PATTERNS (fallback for variations)

    // Handle background/experience questions
    if (input.match(/background|backgroun|experien|experienc|experi|histor|carrer|carier|8.*year/)) {
      return "8+ years in UI/UX! Started as a graphic designer, moved to front-end dev, now specializes in healthcare apps at Persivia. 🏥";
    }

    // Handle skills questions
    if (input.match(/skil|skill|tech|technolog|abilit|capabilit|what.*can.*do|what.*know|tools|tool|design.*code|tech.*stack/)) {
      return "Design + Code combo! Figma for design, React for building, plus healthcare UX expertise. Pretty versatile! 💪";
    }

    // Handle availability questions
    if (input.match(/availab|avalabl|hire|hiring|open.*work|looking.*job|need.*job|start.*soon|can.*start/)) {
      return "Yes! Actively looking - remote, hybrid, on-site, or freelance. Flexible and ready to chat! 🚀";
    }

    // Handle contact questions
    if (input.match(/contact|contac|email|reach|connect|get.*touch|talk.*him|messag|how.*i.*reach|contact.*detail/)) {
      return `📧 ${this.kb.personalInfo.email} | 💼 ${this.kb.personalInfo.linkedin} | 🌐 ${this.kb.personalInfo.portfolio}`;
    }

    // Handle healthcare/medical questions
    if (input.match(/health|medic|hospital|patient|clinical|hipaa|healthcare.*expertise|healthcare.*project/)) {
      return "Healthcare UX specialist! Designs patient management systems, medical dashboards, HIPAA-compliant interfaces. 🏥";
    }

    // Handle project/portfolio questions
    if (input.match(/project|work|portfolio|built|created|made|example|show.*portfolio|recent.*project/)) {
      return `Healthcare platforms, patient dashboards, clinical workflows. See full case studies: ${this.kb.personalInfo.portfolio}`;
    }

    // Handle education questions
    if (input.match(/educat|degree|universit|colleg|school|stud/)) {
      return "BSIT from Punjab University (2016). But learned way more by doing - constantly upskilling! 📚";
    }

    // Handle remote/location questions
    if (input.match(/remot|location|where|based|offic|work.*from/)) {
      return "Based in Lahore, Pakistan. Fully set up for remote work - experienced with distributed teams! 💻";
    }

    // Handle salary questions
    if (input.match(/salary|pay|rate|cost|price|charge|compen/)) {
      return "Prefers to discuss compensation based on role and responsibilities. Open to chat during interviews!";
    }

    // Handle freelance questions
    if (input.match(/freelanc|contract|part.*time|project.*based|consult|do.*freelance/)) {
      return "Yes! Available for freelance/contract work. Interested in UI/UX, healthcare apps, and front-end dev. 🚀";
    }

    // Handle off-topic questions - weather, sports, news, etc.
    if (input.match(/weather|temperature|rain|snow|sport|game|football|cricket|news|politic|president|election/)) {
      return "I'm focused on Fahad's professional stuff! 😊 But I can tell you about his amazing work in UI/UX and healthcare apps. What would you like to know about his career?";
    }

    // Handle jokes or fun requests
    if (input.match(/joke|funny|laugh|fun|entertain/)) {
      return "Haha, I'd love to! But I'm better at talking about Fahad's impressive work! Ask me about his projects, skills, or what makes him unique - those stories are pretty cool too! 😄";
    }

    // Handle "What makes him different/unique?"
    if (input.match(/why.*hire|hire.*fahad|what.*makes.*unique|unique|why.*choose|what.*makes.*different|different/)) {
      return "Design + Code + Healthcare UX expertise! 8+ years experience, sees projects through from concept to code. Collaborative and detail-oriented! 🚀";
    }

    // Handle "What's his process?"
    if (input.match(/process|workflow|how.*work|methodology/)) {
      return "Research → Design (Figma) → Prototype → Build (React) → Test → Iterate. User-centered approach with healthcare compliance in mind! 🔄";
    }

    // Handle "Show case studies"
    if (input.match(/case.*stud|case.*study|show.*case/)) {
      return `See detailed case studies on his portfolio: ${this.kb.personalInfo.portfolio} - Healthcare platforms, patient dashboards, and more! 📊`;
    }

    // Handle "Design or development?"
    if (input.match(/design.*or.*dev|dev.*or.*design|design.*development|which.*one/)) {
      return "Both! He designs in Figma AND codes in React. Full-stack UI/UX - from concept to production. Best of both worlds! 🎨💻";
    }

    // Handle very vague questions
    if (input.match(/tell.*me|info|about.*him|what|who|anything/)) {
      return "UI/UX Engineer, 8+ years, healthcare specialist. Ask about experience, skills, or projects! 😊";
    }

    // Handle thanks
    if (input.match(/thank|thx|appreciate|grateful/)) {
      return "You're welcome! 😊 Any other questions?";
    }

    // Default response for anything else
    return "Ask about experience, skills, projects, or how to contact! 🤔";
  }

  // Clear conversation history
  clearHistory() {
    this.conversationHistory = [];
  }

  // Get conversation history (useful for debugging)
  getHistory() {
    return this.conversationHistory;
  }
}

export default AIChatbot;

