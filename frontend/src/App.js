import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import WeightTracker from './components/WeightTracker';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/tracker" replace /> : <Login setUser={setUser} />
        } />
        <Route path="/register" element={
          user ? <Navigate to="/tracker" replace /> : <Register />
        } />
        <Route path="/tracker" element={
          <ProtectedRoute>
            <WeightTracker user={user} setUser={setUser} />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to={user ? "/tracker" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
