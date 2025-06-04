// src/pages/AuthPage.js
import React, { useState } from 'react';

export default function AuthPage() {
  const API_BASE = 'http://localhost:5000';

  const [mode, setMode] = useState('login'); // login | register | reset
  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    phone_number: ''
  });x

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };    

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint =
      mode === 'login'
        ? '/login'
        : mode === 'register'
        ? '/register'
        : '/reset_password';

    const payload =
      mode === 'login'
        ? { email: form.email, password: form.password }
        : mode === 'register'
        ? {
            email: form.email,
            password: form.password,
            username: form.username,
            phone_number: form.phone_number
          }
        : { email: form.email };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Để nhận Flask session cookie
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        if (mode === 'login') {
          localStorage.setItem('id_token', data.id_token);
          alert('Đăng nhập thành công!');
        } else if (mode === 'register') {
          alert('Đăng ký thành công!');
        } else {
          alert(data.message); // Reset password message
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
      <h2>{mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Đăng ký' : 'Quên mật khẩu'}</h2>
      <form onSubmit={handleSubmit}>
        {(mode === 'register' || mode === 'login' || mode === 'reset') && (
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={handleChange}
          />
        )}
        {(mode === 'register' || mode === 'login') && (
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            required
            value={form.password}
            onChange={handleChange}
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
            />
            <input
              type="text"
              name="phone_number"
              placeholder="Số điện thoại"
              required
              value={form.phone_number}
              onChange={handleChange}
            />
          </>
        )}
        <button type="submit">
          {mode === 'login'
            ? 'Đăng nhập'
            : mode === 'register'
            ? 'Đăng ký'
            : 'Gửi link khôi phục'}
        </button>
      </form>

      <div style={{ marginTop: 10 }}>
        {mode !== 'login' && <button onClick={() => setMode('login')}>← Quay lại đăng nhập</button>}
        {mode === 'login' && (
          <>
            <p>
              Chưa có tài khoản?{' '}
              <button onClick={() => setMode('register')}>Đăng ký</button>
            </p>
            <p>
              Quên mật khẩu?{' '}
              <button onClick={() => setMode('reset')}>Khôi phục</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
