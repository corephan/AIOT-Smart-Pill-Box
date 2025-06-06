// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import AuthPage from './pages/Authpage'; // Hi, this is an comment

function Home() {
  return (
    <div>
      <h1>Chào mừng đến với AIOT Smart Pill Box</h1>
      <p>Đây là ứng dụng quản lý hộp thuốc thông minh.</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ marginTop: '100px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/reset" element={<AuthPage />} />
          {/* Bạn có thể thêm các trang khác như /news, /service ở đây */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
