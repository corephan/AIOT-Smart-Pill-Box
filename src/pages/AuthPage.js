// src/pages/AuthPage.js
import React, { useState } from 'react';

export default function AuthPage() {
  const API_BASE = 'http://localhost:5000';

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'reset'
  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    phone_number: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint =
      mode === 'login' ? '/login' :
      mode === 'register' ? '/register' : '/reset_password';

    const payload =
      mode === 'login' ? { email: form.email, password: form.password } :
      mode === 'register' ? {
        email: form.email,
        password: form.password,
        username: form.username,
        phone_number: form.phone_number
      } :
      { email: form.email };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',  // để nhận session cookie từ backend Flask
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        if (mode === 'login') {
          localStorage.setItem('id_token', data.id_token);
          alert('Đăng nhập thành công!');
          // Bạn có thể redirect hoặc làm gì đó khi login thành công
        } else if (mode === 'register') {
          alert('Đăng ký thành công!');
          setMode('login'); // chuyển về màn hình đăng nhập sau khi đăng ký
        } else {
          alert(data.message || 'Gửi link khôi phục thành công!');
        }
      } else {
        alert(data.message || 'Có lỗi xảy ra!');
      }
    } catch (err) {
      alert('Không thể kết nối đến máy chủ');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>
        {mode === 'login' ? 'Đăng nhập' :
          mode === 'register' ? 'Đăng ký' : 'Quên mật khẩu'}
      </h2>

      <form onSubmit={handleSubmit}>
        {(mode === 'login' || mode === 'register' || mode === 'reset') && (
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        )}

        {(mode === 'login' || mode === 'register') && (
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            required
            value={form.password}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
        )}

        {mode === 'register' && (
          <>
            <input
              type="text"
              name="username"
              placeholder="Tên người dùng"
              required
              value={form.username}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              name="phone_number"
              placeholder="Số điện thoại"
              required
              value={form.phone_number}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
          </>
        )}

        <button type="submit" style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#007BFF',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          {mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Đăng ký' : 'Gửi link khôi phục'}
        </button>
      </form>

      <div style={{ marginTop: 10, textAlign: 'center' }}>
        {mode !== 'login' && (
          <button
            onClick={() => setMode('login')}
            style={{ marginTop: 10, cursor: 'pointer', background: 'none', border: 'none', color: '#007BFF' }}
          >
            ← Quay lại đăng nhập
          </button>
        )}
        {mode === 'login' && (
          <>
            <p>
              Chưa có tài khoản?{' '}
              <button
                onClick={() => setMode('register')}
                style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#007BFF' }}
              >
                Đăng ký
              </button>
            </p>
            <p>
              Quên mật khẩu?{' '}
              <button
                onClick={() => setMode('reset')}
                style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#007BFF' }}
              >
                Khôi phục
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
