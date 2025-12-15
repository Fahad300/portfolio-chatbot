import React, { useState, useEffect } from 'react';
import './Stats.css';

const Stats = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Password from environment or default
  const STATS_PASSWORD = process.env.REACT_APP_STATS_PASSWORD || 'admin123';

  // Check if already authenticated (stored in sessionStorage)
  useEffect(() => {
    const auth = sessionStorage.getItem('stats_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchStats();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === STATS_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('stats_authenticated', 'true');
      fetchStats();
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const analyticsUrl = process.env.REACT_APP_ANALYTICS_URL || 'https://chat.website.com/api/analytics.php';
      const statsUrl = analyticsUrl.replace('analytics.php', 'get_stats.php');
      
      const response = await fetch(statsUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStatsData(data);
    } catch (err) {
      setError('Failed to load stats. Make sure get_stats.php is uploaded.');
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('stats_authenticated');
    setStatsData(null);
  };

  // Password form
  if (!isAuthenticated) {
    return (
      <div className="stats-container">
        <div className="stats-login">
          <h2>📊 Analytics Dashboard</h2>
          <p>Enter password to view statistics</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="stats-password-input"
              autoFocus
            />
            {error && <p className="stats-error">{error}</p>}
            <button type="submit" className="stats-login-btn">Access Stats</button>
          </form>
        </div>
      </div>
    );
  }

  // Stats display
  return (
    <div className="stats-container">
      <div className="stats-header">
        <h1>📊 Chatbot Analytics</h1>
        <button onClick={handleLogout} className="stats-logout-btn">Logout</button>
      </div>

      {loading && <div className="stats-loading">Loading stats...</div>}
      {error && <div className="stats-error-message">{error}</div>}

      {statsData && (
        <div className="stats-content">
          {/* Summary Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Sessions</h3>
              <p className="stat-number">{statsData.totalSessions || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Total Messages</h3>
              <p className="stat-number">{statsData.totalMessages || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Quick Questions</h3>
              <p className="stat-number">{statsData.totalQuickQuestions || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Custom Messages</h3>
              <p className="stat-number">{statsData.totalCustomMessages || 0}</p>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="stats-section">
            <h2>Recent Sessions</h2>
            <div className="sessions-list">
              {statsData.recentSessions && statsData.recentSessions.length > 0 ? (
                statsData.recentSessions.map((session, index) => (
                  <div key={index} className="session-card">
                    <div className="session-header">
                      <span className="session-id">{session.sessionId}</span>
                      <span className="session-time">{new Date(session.startTime).toLocaleString()}</span>
                    </div>
                    <div className="session-stats">
                      <span>💬 {session.summary?.totalMessages || 0} messages</span>
                      <span>⚡ {session.summary?.quickQuestions || 0} quick</span>
                      <span>✍️ {session.summary?.customMessages || 0} custom</span>
                      <span>⏱️ {Math.floor(session.duration / 60)}m {session.duration % 60}s</span>
                    </div>
                    {session.userInfo && (
                      <div className="session-info">
                        <span>🌍 {session.userInfo.timezone || 'Unknown'}</span>
                        <span>💻 {session.userInfo.platform || 'Unknown'}</span>
                        <span>🌐 {session.userInfo.language || 'Unknown'}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>No sessions yet</p>
              )}
            </div>
          </div>

          {/* Popular Questions */}
          {statsData.popularQuestions && statsData.popularQuestions.length > 0 && (
            <div className="stats-section">
              <h2>Popular Questions</h2>
              <div className="questions-list">
                {statsData.popularQuestions.map((q, index) => (
                  <div key={index} className="question-item">
                    <span className="question-text">{q.question}</span>
                    <span className="question-count">{q.count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location Stats */}
          {statsData.locations && statsData.locations.length > 0 && (
            <div className="stats-section">
              <h2>Visitor Locations</h2>
              <div className="locations-list">
                {statsData.locations.map((loc, index) => (
                  <div key={index} className="location-item">
                    <span className="location-name">{loc.country || 'Unknown'}</span>
                    {loc.city && <span className="location-city">{loc.city}</span>}
                    <span className="location-count">{loc.count} visitors</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="stats-footer">
        <button onClick={fetchStats} className="stats-refresh-btn">🔄 Refresh</button>
        <p>Last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default Stats;

