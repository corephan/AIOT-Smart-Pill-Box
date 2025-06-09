import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResetPassword.css';

function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = () => {
    // Giả lập gửi email
    if (!email.includes('@')) {
      setMessage('❌ Vui lòng nhập địa chỉ email hợp lệ.');
    } else {
      setMessage(
        '📨 Nếu email có trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.'
      );
      // Sau vài giây có thể quay về login nếu muốn
      setTimeout(() => navigate('/login'), 3000);
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
