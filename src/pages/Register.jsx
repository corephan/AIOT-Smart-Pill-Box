import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
    const [info, setInfo] = useState({ username: '', password: '', email: '', phone: '' });
    const navigate = useNavigate();

    const handleRegister = () => {
        const newUser = {
            username: info.username,
            email: info.email,
            phone: info.phone
        };
        localStorage.setItem('user', JSON.stringify(newUser));
        alert('✅ Đăng ký thành công!');
        navigate('/service');
    };

    const handleGoToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="register-wrapper">
            <div className="register-box">
                <h2>📝 Đăng ký</h2>
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
                    value={info.phone}
                    onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                />
                <div className="button-group">
                    <button onClick={handleRegister}>Đăng ký</button>
                    <button onClick={handleGoToLogin} className="login-btn">Đã có tài khoản? Đăng nhập</button>
                </div>
            </div>
        </div>
    );
}

export default Register;
