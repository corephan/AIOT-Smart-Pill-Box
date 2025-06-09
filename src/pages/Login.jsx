import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ setUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // gửi cookie từ Flask
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Lưu người dùng vào state, không cần localStorage vì cookie giữ session
        setUser({ uid: data.uid, email: data.email });
        navigate('/');
      } else {
        setError(data.message || 'Đăng nhập thất bại.');
      }
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      setError('Đã có lỗi kết nối đến máy chủ.');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="form-box">
        <h2>🔐 Đăng nhập</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
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
        <p style={{ marginTop: '10px' }}>
          <a href="/reset-password" style={{ color: '#007bff', textDecoration: 'underline' }}>
            Quên mật khẩu?
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
