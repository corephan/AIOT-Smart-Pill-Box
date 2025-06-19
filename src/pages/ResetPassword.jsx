import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResetPassword.css';

const API_BASE = import.meta.env.VITE_API_BASE;

function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async () => {
    if (!email.includes('@')) {
      setMessage('❌ Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/reset_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage(
          '📨 Nếu email có trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.'
        );
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setMessage('❌ Có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } catch (error) {
      setMessage('❌ Không thể kết nối đến máy chủ.');
    }
  };

  return (
    <div className="reset-password-container">
      <h2>🔁 Đặt lại mật khẩu</h2>
      <p>Nhập địa chỉ email bạn đã đăng ký để nhận hướng dẫn đặt lại mật khẩu.</p>
      <input
        type="email"
        placeholder="Nhập email..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleReset}>Gửi yêu cầu</button>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default ResetPassword;