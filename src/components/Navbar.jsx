import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef();

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Xử lý đăng xuất
    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    // Xử lý chuyển tài khoản
    const handleSwitchAccount = async () => {
        await logout();
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
                {!isAuthenticated || !user ? (
                    <>
                        <Link to="/login" className="btn">Đăng nhập</Link>
                        <Link to="/register" className="btn">Đăng ký</Link>
                    </>
                ) : (
                    <div
                        className="user-menu"
                        ref={dropdownRef}
                        onMouseEnter={() => setShowDropdown(true)}
                        onMouseLeave={() => setShowDropdown(false)}
                    >
                        <span className="user-name">
                            👤 {user.username}
                        </span>
                        {showDropdown && (
                            <div className="dropdown-menu">
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Điện thoại:</strong> {user.phone}</p>
                                <button onClick={() => navigate('/account')}>👁️ Tài khoản</button>
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

export default Navbar;