import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // Nên ngăn submit mặc định form để tránh reload trang
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            alert("Vui lòng nhập đầy đủ email và mật khẩu");
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                // Save token and user info as needed
                localStorage.setItem('user', JSON.stringify({
                    uid: data.uid,
                    email: data.email,
                    id_token: data.id_token
                }));
                navigate('/service');
            } else {
                alert(`Đăng nhập thất bại: ${data.message}`);
            }
        } catch (error) {
            alert('Lỗi kết nối máy chủ!');
        }
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
