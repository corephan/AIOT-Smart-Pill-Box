import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Service from './pages/Service';
import News from './pages/News';
import Account from './pages/Account';
import ResetPassword from './pages/ResetPassword'; // 👈 Thêm dòng này

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/news" element={<News />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} /> {/* 👈 Thêm dòng này */}
        <Route
          path="/service"
          element={user ? <Service /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/account"
          element={user ? <Account /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
