// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const handleSwitchAccount = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="navbar-container">
      <div className="navbar-title">💊 AIOT Smart Pill Box</div>

      <div className="navbar-links">
        <Link to="/">Trang chủ</Link>
        <Link to="/news">Tin tức</Link>
        <Link to="/service">Dịch vụ</Link>
      </div>

      <div className="navbar-auth">
        {!user ? (
          <>
            <Link to="/login" className="btn">Đăng nhập</Link>
            <Link to="/register" className="btn">Đăng ký</Link>
          </>
        ) : (
          <div className="user-menu" ref={dropdownRef}>
            <span className="user-name" onClick={() => setShowDropdown(!showDropdown)}>
              👤 {user.username}
            </span>
            {showDropdown && (
              <div className="dropdown-menu">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Điện thoại:</strong> {user.phone_number}</p>
                <button onClick={handleSwitchAccount}>🔁 Chuyển tài khoản</button>
                <button onClick={handleLogout} className="logout">🚪 Đăng xuất</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
