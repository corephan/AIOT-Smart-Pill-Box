import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE;

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      const userResponse = await fetch(`${API_BASE}/user_info`, {
        credentials: "include"
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        login(userData);
        navigate("/");
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    }

    setLoading(false);
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
        <button onClick={handleLogin} disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <p style={{ margin: '5px 0' }}>
            <Link to="/reset-password" style={{ color: '#007bff', textDecoration: 'underline' }}>
              Quên mật khẩu?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
