import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = () => {
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
            <div className="form-box">
                <h2>🔐 Đăng nhập</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={handleLogin}>Đăng nhập</button>
            </div>
        </div>
    );
}

export default Login;
