import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Account.css';

function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState([]);
  const [newsHistory, setNewsHistory] = useState([]);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const allLists = JSON.parse(localStorage.getItem('patientLists')) || {};
      const viewedNews = JSON.parse(localStorage.getItem('viewedNews')) || [];

      if (!storedUser) return navigate('/login');
      setUser(storedUser);

      const lists = allLists[storedUser.username] || [];
      setUserData(lists);
      setNewsHistory(viewedNews.slice(-10).reverse());
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  const handleClearNews = () => {
    localStorage.removeItem('viewedNews');
    setNewsHistory([]);
  };

  return (
    <div className="account-container">
      <h2>👤 Thông tin tài khoản</h2>
      {user && (
        <div className="account-info">
          <p><strong>Tên người dùng:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Số điện thoại:</strong> {user.phone}</p>
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
                {list.medications.map((med, idx) => (
                  <li key={idx}>
                    💊 {med.name}, {med.dose} – 🕒 {med.time} – ⏰ {med.dueDate} {med.note && `– 📝 ${med.note}`}
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
