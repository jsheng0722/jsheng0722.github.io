import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home/Home';
import NotePage from './pages/Note/Note';
import NotFoundPage from './pages/NotFoundPage';
import Portfolio from './pages/Portfolio/Portfolio';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/notes" element={<NotePage />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;