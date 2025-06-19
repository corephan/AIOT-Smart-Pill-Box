import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const API_BASE = import.meta.env.VITE_API_BASE;

function Register() {
    const [info, setInfo] = useState({ username: '', password: '', email: '', phone_number: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async () => {
        setError('');
        setLoading(true);
        setSuccess(false);
        try {
            const response = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    username: info.username,
                    password: info.password,
                    email: info.email,
                    phone_number: info.phone_number
                })
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess(true);
            } else {
                setError(data.message || 'Đăng ký thất bại.');
            }
        } catch (err) {
            setError('Lỗi kết nối máy chủ.');
        }
        setLoading(false);
    };

    const handleGoToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="register-wrapper">
            <div className="register-box">
                <h2>📝 Đăng ký</h2>
                {success ? (
                    <div className="success-message" style={{ textAlign: 'center', margin: '40px 0' }}>
                        <div style={{ fontSize: 24, marginBottom: 16 }}>✅ Đăng ký thành công!</div>
                        <div>Vui lòng kiểm tra email để xác thực tài khoản của bạn.</div>
                    </div>
                ) : (
                    <>
                        <input
                            type="text"
                            placeholder="Tên đăng nhập"
                            value={info.username}
                            onChange={(e) => setInfo({ ...info, username: e.target.value })}
                        />
                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            value={info.password}
                            onChange={(e) => setInfo({ ...info, password: e.target.value })}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={info.email}
                            onChange={(e) => setInfo({ ...info, email: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Số điện thoại"
                            value={info.phone_number}
                            onChange={(e) => setInfo({ ...info, phone_number: e.target.value })}
                        />
                        {error && <div className="error-message">{error}</div>}
                        <div className="button-group">
                            <button onClick={handleRegister} disabled={loading}>
                                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                            </button>
                            <button onClick={handleGoToLogin} className="login-btn">
                                Đã có tài khoản? Đăng nhập
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Register;