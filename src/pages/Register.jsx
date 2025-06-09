import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
  const [info, setInfo] = useState({ username: '', password: '', email: '', phone: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const { username, password, email, phone } = info;

    // Kiểm tra client-side trước khi gửi đi
    if (!username || !password || !email || !phone) {
      setError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          email,
          phone_number: phone
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Đăng ký thành công!');
        navigate('/login');
      } else {
        setError(data.message || 'Đăng ký thất bại.');
      }
    } catch (err) {
      console.error('Lỗi khi gửi yêu cầu:', err);
      setError('Không thể kết nối đến máy chủ.');
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="register-wrapper">
      <form className="register-box" onSubmit={handleRegister}>
        <h2>📝 Đăng ký</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={info.username}
          onChange={(e) => setInfo({ ...info, username: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={info.password}
          onChange={(e) => setInfo({ ...info, password: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={info.email}
          onChange={(e) => setInfo({ ...info, email: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Số điện thoại"
          value={info.phone}
          onChange={(e) => setInfo({ ...info, phone: e.target.value })}
          required
        />
        <div className="button-group">
          <button type="submit">Đăng ký</button>
          <button type="button" onClick={handleGoToLogin} className="login-btn">
            Đã có tài khoản? Đăng nhập
          </button>
        </div>
      </form>
    </div>
  );
}

export default Register;