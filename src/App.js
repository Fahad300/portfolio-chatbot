import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CareerChatbot from './CareerChatbot';
import Stats from './Stats';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/analytics" element={<Navigate to="/stats" replace />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/" element={<CareerChatbot />} />
      </Routes>
    </Router>
  );
}

export default App;
