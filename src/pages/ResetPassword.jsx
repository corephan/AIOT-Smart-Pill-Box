import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResetPassword.css';

function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async () => {
    setMessage('');
    setError('');

    if (!email.trim()) {
      setError('❌ Vui lòng nhập địa chỉ email.');
      return;
    }

    try {
      const response = await fetch('/reset_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('📨 ' + data.message);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        // Xử lý các mã lỗi cụ thể
        switch (data.code) {
          case 'EMAIL_REQUIRED':
            setError('❌ Email là bắt buộc.');
            break;
          case 'EMAIL_INVALID':
            setError('❌ Định dạng email không hợp lệ.');
            break;
          case 'EMAIL_NOT_FOUND':
            setError('❌ Email không tồn tại trong hệ thống.');
            break;
          case 'FAILED':
            setError('❌ Gửi yêu cầu thất bại. Vui lòng thử lại.');
            break;
          case 'INTERNAL_ERROR':
            setError('❌ Lỗi hệ thống. Vui lòng thử lại sau.');
            break;
          default:
            setError('❌ Đã xảy ra lỗi không xác định.');
        }
      }
    } catch (err) {
      setError('❌ Không thể kết nối tới máy chủ.');
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
      {error && <p className="message error">{error}</p>}
      {message && <p className="message success">{message}</p>}
    </div>
  );
}

export default ResetPassword;
