# Portfolio Chatbot - AI-Powered Career Assistant 🚀

A modern, interactive portfolio chatbot built with React that uses AI to answer questions about your professional background, skills, and experience. Features real-time analytics tracking and a beautiful, responsive UI.

## ✨ Features

- **AI-Powered Conversations**: Uses Groq API for natural language processing
- **Analytics Dashboard**: Track user interactions, sessions, and engagement metrics
- **User Tracking**: Automatic session tracking with location detection (optional)
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Knowledge Base**: Easy-to-update JSON file for your professional information
- **Secure API Proxy**: PHP proxy to protect your API keys

---

## 🎯 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PHP-enabled web hosting (for API proxy)
- Groq API key (free at [console.groq.com](https://console.groq.com/keys))

### Installation

1. **Clone or download this repository**

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
   
   Create a `.env` file in the root directory:
```bash
REACT_APP_GROQ_API_KEY=your_groq_api_key_here
REACT_APP_STATS_PASSWORD=your_stats_password_here
REACT_APP_ENABLE_LOCATION_TRACKING=true
```

4. **Update your knowledge base:**
   
   Edit `src/career-digital-twin-knowledge-base.json` with your professional information:
   - Personal details (name, email, etc.)
   - Skills and technologies
   - Work experience
   - Projects
   - Education
   - Career goals

5. **Run the development server:**
```bash
npm start
```

   The app will open at `http://localhost:3000`

6. **Build for production:**
```bash
npm run build
```

   This creates a `build/` folder with optimized production files.

---

## 📁 Project Structure

```
portfolio-chatbot/
├── src/
│   ├── App.js                          # Main app component with routing
│   ├── App.css                         # App styles
│   ├── index.js                        # Entry point
│   ├── index.css                       # Global styles
│   ├── CareerChatbot.jsx               # Main chatbot component
│   ├── CareerChatbot.css               # Chatbot styles
│   ├── chatbotLogic.js                 # AI logic and Groq integration
│   ├── userTracking.js                 # Analytics and user tracking
│   ├── Stats.jsx                       # Analytics dashboard component
│   ├── Stats.css                       # Stats dashboard styles
│   └── career-digital-twin-knowledge-base.json  # Your professional info
├── public/
│   ├── index.html                      # HTML template
│   ├── favicon.ico
│   └── chatbot.png                     # Chatbot icon
├── chat.php                            # PHP proxy for API calls
├── analytics.php                       # Analytics endpoint
├── get_stats.php                       # Stats retrieval endpoint
├── location.php                        # Location tracking endpoint
├── package.json                        # Dependencies and scripts
└── README.md                           # This file
```

---

## 🚀 Deployment

### Step 1: Get Groq API Key

1. Visit [console.groq.com/keys](https://console.groq.com/keys)
2. Sign up or log in
3. Create a new API key
4. Copy your key (starts with `gsk_...`)

### Step 2: Build the Project

```bash
npm run build
```

This creates a `build/` folder with all production files.

### Step 3: Upload to Hosting

#### 3.1 Upload React Build Files

1. Upload all files from the `build/` folder to your web hosting
2. Ensure `index.html` is in the root directory (e.g., `/public_html/chat/`)

#### 3.2 Upload PHP Files

1. Create an `api/` folder in your hosting directory (e.g., `/public_html/chat/api/`)
2. Upload `chat.php` to `/api/chat.php`
3. Edit `chat.php` and replace the API key:
```php
$apiKey = 'gsk_YOUR_ACTUAL_GROQ_API_KEY_HERE';
```
4. Set file permissions to 644

#### 3.3 Upload Analytics Files (Optional)

If you want analytics tracking:
1. Upload `analytics.php`, `get_stats.php`, and `location.php` to your hosting
2. Configure database connection if needed (check the PHP files for database setup)

### Step 4: Configure Environment Variables

For production, you can either:
- Set environment variables on your hosting platform
- Or configure them directly in the build (not recommended for API keys)

**Important**: Never commit API keys to version control. Use environment variables or server-side configuration.

### Step 5: Test

1. Visit your deployed URL
2. Test the chatbot functionality
3. Visit `/stats` to view analytics (if configured)

---

## 🔧 Configuration

### API Configuration

The chatbot uses Groq API by default. You can configure it in:

- **Development**: `.env` file with `REACT_APP_GROQ_API_KEY`
- **Production**: `chat.php` file (API key in PHP proxy)

### Analytics Configuration

- **Stats Password**: Set via `REACT_APP_STATS_PASSWORD` environment variable
- **Location Tracking**: Enable/disable via `REACT_APP_ENABLE_LOCATION_TRACKING`

### Knowledge Base

Edit `src/career-digital-twin-knowledge-base.json` to customize:
- Personal information
- Skills and technologies
- Work experience
- Projects and portfolio items
- Education and certifications
- Career goals and preferences

---

## 📊 Features Explained

### Chatbot Features

- **Natural Language Understanding**: Handles typos, vague questions, and off-topic queries
- **Contextual Responses**: Maintains conversation context
- **Short, Punchy Responses**: Optimized for quick, engaging interactions
- **Professional Personality**: Friendly but professional tone

### Analytics Features

- **Session Tracking**: Unique session IDs for each visitor
- **Message Analytics**: Track number of messages per session
- **User Information**: Browser, device, screen size, timezone
- **Location Tracking**: Optional IP-based location detection
- **Protected Dashboard**: Password-protected stats page

---

## 🛠️ Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

### Tech Stack

- **React 18** - UI framework
- **React Router DOM** - Client-side routing
- **Groq SDK** - AI/LLM integration
- **PHP** - Server-side API proxy
- **CSS3** - Styling

---

## 🔒 Security Notes

1. **API Keys**: Never expose API keys in client-side code. Use the PHP proxy for production.
2. **CORS**: Configure CORS headers in `chat.php` to restrict access to your domain in production.
3. **Stats Password**: Use a strong password for the analytics dashboard.
4. **Environment Variables**: Keep `.env` files out of version control (add to `.gitignore`).

---

## 📝 Customization

### Changing the Chatbot Personality

Edit the system prompt in `src/chatbotLogic.js` - look for the `createSystemPrompt()` method.

### Styling

- Main chatbot styles: `src/CareerChatbot.css`
- Stats dashboard styles: `src/Stats.css`
- Global styles: `src/index.css`

### Adding New Features

The codebase is modular:
- Chatbot logic: `src/chatbotLogic.js`
- UI components: `src/CareerChatbot.jsx`, `src/Stats.jsx`
- Tracking: `src/userTracking.js`

---

## 🐛 Troubleshooting

### "API key not configured" error
→ Check that your Groq API key is set in `.env` (development) or `chat.php` (production)

### Blank screen after deployment
→ Ensure `index.html` is in the root directory and all static files are uploaded

### Chatbot not responding
→ Check browser console for errors, verify `chat.php` is accessible at `/api/chat.php`

### Analytics not working
→ Verify PHP files are uploaded and accessible, check server logs for errors

### CORS errors
→ Update CORS headers in `chat.php` to allow your domain

---

## 📚 Additional Resources

- [Groq API Documentation](https://console.groq.com/docs)
- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)

---

## 📄 License

This project is private and proprietary.

---

## 🎉 You're All Set!

Your portfolio chatbot is ready to help visitors learn about your professional background. Customize the knowledge base, deploy, and start engaging with your audience!

**Questions or issues?** Check the code comments for detailed explanations of each component.
