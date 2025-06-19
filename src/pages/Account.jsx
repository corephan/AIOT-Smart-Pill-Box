import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Account.css';

const API_BASE = import.meta.env.VITE_API_BASE;

function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState([]);
  const [newsHistory, setNewsHistory] = useState([]);

  useEffect(() => {
    // Fetch user info from backend
    fetch(`${API_BASE}/me`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (!data || !data.user) return navigate('/login');
        setUser(data.user);
      })
      .catch(() => navigate('/login'));

    // Fetch patient lists from backend
    fetch(`${API_BASE}/get_patient_lists`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setUserData(data.patient_lists || []))
      .catch(() => setUserData([]));

    // Fetch news history from backend (replace with your API if available)
    fetch(`${API_BASE}/news_history`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setNewsHistory((data.history || []).slice(-10).reverse()))
      .catch(() => setNewsHistory([]));
  }, [navigate]);

  const handleClearNews = () => {
    // Clear news history via backend (replace with your API if available)
    fetch(`${API_BASE}/news_history/clear`, { method: 'POST', credentials: 'include' })
      .then(() => setNewsHistory([]))
      .catch(() => setNewsHistory([]));
  };

  return (
    <div className="account-container">
      <h2>👤 Thông tin tài khoản</h2>
      {user && (
        <div className="account-info">
          <p><strong>Tên người dùng:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Số điện thoại:</strong> {user.phone_number || user.phone}</p>
        </div>
      )}

      <div className="account-section">
        <h3>📋 Danh sách thuốc đã tạo</h3>
        {userData.length === 0 ? (
          <p>Chưa có danh sách thuốc nào.</p>
        ) : (
          userData.map((list, index) => (
            <div key={index} className="account-list-card">
              <h4>{list.name} – {list.condition}</h4>
              {list.allergy && <p className="allergy">⚠️ Dị ứng: {list.allergy}</p>}
              <ul>
                {(list.medications || []).map((med, idx) => (
                  <li key={idx}>
                    💊 {med.name}, {med.dose} – 🕒 {med.time}
                    {med.dueDate && <> – ⏰ {med.dueDate}</>}
                    {med.note && <> – 📝 {med.note}</>}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      <div className="account-section">
        <h3>📰 Tin tức đã xem</h3>
        <div className="news-history">
          {newsHistory.length === 0 ? (
            <p>Bạn chưa xem bài báo nào.</p>
          ) : (
            <>
              <ul>
                {newsHistory.map((news, index) => (
                  <li key={index}>
                    <a href={news.link} target="_blank" rel="noopener noreferrer">{news.title}</a>
                  </li>
                ))}
              </ul>
              <button onClick={handleClearNews} style={{ marginTop: '10px', padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                🗑️ Xoá toàn bộ lịch sử
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Account;