import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // Nên ngăn submit mặc định form để tránh reload trang
    const handleLogin = (e) => {
        e.preventDefault();
        if (!email || !password) {
            alert("Vui lòng nhập đầy đủ email và mật khẩu");
            return;
        }
        const dummyUser = {
            username: email.split('@')[0],
            email: email,
            phone: '0123456789'
        };
        localStorage.setItem('user', JSON.stringify(dummyUser));
        navigate('/service');
    };

    return (
        <div className="login-wrapper">
            <form className="form-box" onSubmit={handleLogin}>
                <h2>🔐 Đăng nhập</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Đăng nhập</button>
            </form>
        </div>
    );
}

export default Login;
