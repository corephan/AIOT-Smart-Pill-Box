import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Service.css';

function Service() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [patientLists, setPatientLists] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('patientLists')) || {};
      return user ? saved[user.username] || [] : [];
    } catch {
      return [];
    }
  });

  const [newList, setNewList] = useState({ name: '', condition: '', allergy: '' });
  const [medicationData, setMedicationData] = useState({ name: '', dose: '', time: '', note: '', dueDate: '' });
  const [popupListIndex, setPopupListIndex] = useState(null);
  const [popupMedIndex, setPopupMedIndex] = useState(null);
  const [showMedPopup, setShowMedPopup] = useState(false);
  const [showListPopup, setShowListPopup] = useState(false);
  const [filterType, setFilterType] = useState(null);

  useEffect(() => {
    if (!user) {
      setShowLoginPopup(true);
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveLists = (lists) => {
    const stored = JSON.parse(localStorage.getItem('patientLists')) || {};
    stored[user.username] = lists;
    localStorage.setItem('patientLists', JSON.stringify(stored));
  };

  const handleAddList = () => {
    const updated = [...patientLists, { ...newList, medications: [] }];
    setPatientLists(updated);
    saveLists(updated);
    setNewList({ name: '', condition: '', allergy: '' });
    setShowListPopup(false);
  };

  const handleDeleteList = (index) => {
    const updated = [...patientLists];
    updated.splice(index, 1);
    setPatientLists(updated);
    saveLists(updated);
  };

  const openMedPopup = (listIndex, medIndex = null) => {
    setPopupListIndex(listIndex);
    setPopupMedIndex(medIndex);
    if (medIndex !== null) {
      setMedicationData({ ...patientLists[listIndex].medications[medIndex] });
    } else {
      setMedicationData({ name: '', dose: '', time: '', note: '', dueDate: '' });
    }
    setShowMedPopup(true);
  };

  const saveMedication = () => {
    const updated = [...patientLists];
    if (popupMedIndex !== null) {
      updated[popupListIndex].medications[popupMedIndex] = medicationData;
    } else {
      updated[popupListIndex].medications.push(medicationData);
    }
    setPatientLists(updated);
    saveLists(updated);
    setShowMedPopup(false);
  };

  const deleteMedication = (listIndex, medIndex) => {
    const updated = [...patientLists];
    updated[listIndex].medications.splice(medIndex, 1);
    setPatientLists(updated);
    saveLists(updated);
  };

  const getFilteredMedications = (meds) => {
    const now = new Date();
    const in3days = new Date();
    in3days.setDate(now.getDate() + 3);

    return meds.filter((med) => {
      if (!med.dueDate) return false;
      const due = new Date(med.dueDate);
      if (filterType === 'expired') return due < now;
      if (filterType === 'upcoming') return due >= now && due <= in3days;
      return true;
    });
  };

  return (
    <div className="service-container" style={{ paddingLeft: '40px', paddingRight: '20px' }}>
      {showLoginPopup && (
        <div className="popup">
          <h3>🔒 Bạn cần đăng nhập để sử dụng dịch vụ</h3>
          <button onClick={() => navigate('/login')}>🔐 Đăng nhập</button>
          <button onClick={() => navigate('/register')}>📝 Đăng ký</button>
        </div>
      )}

      {user && (
        <>
          <h2>📋 Danh sách thuốc</h2>
          <div className="filter-buttons">
            <button onClick={() => setFilterType('upcoming')}>📍 Sắp hết hạn (3 ngày)</button>
            <button onClick={() => setFilterType('expired')}>⛔ Đã hết hạn</button>
            <button onClick={() => setFilterType(null)}>🔄 Tất cả</button>
          </div>

          {patientLists.length === 0 ? (
            <button onClick={() => setShowListPopup(true)}>➕ Tạo danh sách thuốc</button>
          ) : null}

          {patientLists.map((list, index) => (
            <div key={index} className="list-card">
              <h3>👨‍⚕️ {list.name} – 🏥 {list.condition}</h3>
              {list.allergy && <p className="allergy">⚠️ Dị ứng: {list.allergy}</p>}
              <ul>
                {getFilteredMedications(list.medications).map((med, idx) => (
                  <li key={idx} className={new Date(med.dueDate) < new Date() ? 'expired' : ''}>
                    💊 <strong>{med.name}</strong> – {med.dose}, 🕒 {med.time} – {
                      (() => {
                        const [hour] = med.time.split(':').map(Number);
                        if (hour >= 5 && hour < 12) return 'Sáng';
                        if (hour >= 12 && hour < 17) return 'Chiều';
                        if (hour >= 17 && hour < 21) return 'Tối';
                        return 'Đêm';
                      })()
                    }
                    {med.note && <span> – 📝 {med.note}</span>}
                    {med.dueDate && (
                      <span className="due-date-info">
                        ⏰ Hạn: {med.dueDate} – {(() => {
                          const today = new Date();
                          const due = new Date(med.dueDate);
                          const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
                          return diff >= 0 ? `Còn: ${diff} ngày` : 'Đã hết hạn';
                        })()}
                      </span>
                    )}
                    <button onClick={() => openMedPopup(index, idx)}>✏️ Sửa</button>
                    <button onClick={() => deleteMedication(index, idx)}>🗑️ Xoá</button>
                  </li>
                ))}
              </ul>
              <button onClick={() => openMedPopup(index)}>➕ Thêm thuốc</button>
              <button onClick={() => handleDeleteList(index)}>🗑️ Xoá danh sách</button>
            </div>
          ))}

          {patientLists.length > 0 && (
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              width: '100%',
              backgroundColor: '#ffc107',
              color: '#333',
              fontSize: '20px',
              fontWeight: 'bold',
              textAlign: 'center',
              padding: '12px 0',
              zIndex: 1000
            }}>
              ⚠️ Bạn chỉ được phép tạo một danh sách thuốc.
            </div>
          )}
        </>
      )}

      {showListPopup && (
        <div className="popup">
          <h3>🆕 Tạo danh sách thuốc</h3>
          <input placeholder="Tên người dùng thuốc" value={newList.name}
            onChange={(e) => setNewList({ ...newList, name: e.target.value })} />
          <input placeholder="Tên bệnh" value={newList.condition}
            onChange={(e) => setNewList({ ...newList, condition: e.target.value })} />
          <input placeholder="Dị ứng thuốc (nếu có)" value={newList.allergy}
            onChange={(e) => setNewList({ ...newList, allergy: e.target.value })} />
          <button onClick={handleAddList}>💾 Lưu</button>
          <button onClick={() => setShowListPopup(false)}>❌ Huỷ</button>
        </div>
      )}

      {showMedPopup && (
        <div className="popup">
          <h3>{popupMedIndex !== null ? '✏️ Sửa thuốc' : '➕ Thêm thuốc'}</h3>
          <input placeholder="Tên thuốc" value={medicationData.name}
            onChange={(e) => setMedicationData({ ...medicationData, name: e.target.value })} />
          <input placeholder="Liều lượng" value={medicationData.dose}
            onChange={(e) => setMedicationData({ ...medicationData, dose: e.target.value })} />
          <input type="time" value={medicationData.time}
            onChange={(e) => setMedicationData({ ...medicationData, time: e.target.value })} />
          <input type="date" value={medicationData.dueDate}
            onChange={(e) => setMedicationData({ ...medicationData, dueDate: e.target.value })} />
          <input placeholder="Ghi chú" value={medicationData.note}
            onChange={(e) => setMedicationData({ ...medicationData, note: e.target.value })} />
          <button onClick={saveMedication}>💾 Lưu</button>
          <button onClick={() => setShowMedPopup(false)}>❌ Huỷ</button>
        </div>
      )}
    </div>
  );
}

export default Service;