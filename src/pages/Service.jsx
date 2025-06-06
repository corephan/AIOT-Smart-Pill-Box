import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Service2.css';

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

    const [patientLists, setPatientLists] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('patientLists')) || {};
            return user ? saved[user.username] || [] : [];
        } catch {
            return [];
        }
    });

    const [newList, setNewList] = useState({ name: '', condition: '' });
    const [medicationData, setMedicationData] = useState({ id: null, name: '', dose: '', time: '', note: '' });

    const [popupListIndex, setPopupListIndex] = useState(null);
    const [popupMedIndex, setPopupMedIndex] = useState(null);
    const [showMedPopup, setShowMedPopup] = useState(false);
    const [showListPopup, setShowListPopup] = useState(false);

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

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
        if (!newList.name.trim() || !newList.condition.trim()) {
            alert('⚠️ Vui lòng nhập đầy đủ tên người dùng và tên bệnh.');
            return;
        }
        const newListWithId = { ...newList, id: Date.now(), medications: [] };
        const updated = [...patientLists, newListWithId];
        setPatientLists(updated);
        saveLists(updated);
        setNewList({ name: '', condition: '' });
        setShowListPopup(false);
    };

    const handleDeleteList = (index) => {
        if (!window.confirm('Bạn có chắc muốn xoá danh sách này?')) return;
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
            setMedicationData({ id: null, name: '', dose: '', time: '', note: '' });
        }
        setShowMedPopup(true);
    };

    const saveMedication = () => {
        if (!medicationData.name.trim() || !medicationData.dose.trim() || !medicationData.time.trim()) {
            alert('⚠️ Vui lòng nhập đầy đủ tên thuốc, liều lượng và thời gian.');
            return;
        }

        const updated = [...patientLists];
        if (popupMedIndex !== null) {
            // Update existing medication
            updated[popupListIndex].medications[popupMedIndex] = medicationData;
        } else {
            // Add new medication with unique id
            updated[popupListIndex].medications.push({ ...medicationData, id: Date.now() });
        }
        setPatientLists(updated);
        saveLists(updated);
        setShowMedPopup(false);
    };

    const deleteMedication = (listIndex, medIndex) => {
        if (!window.confirm('Bạn có chắc muốn xoá thuốc này?')) return;
        const updated = [...patientLists];
        updated[listIndex].medications.splice(medIndex, 1);
        setPatientLists(updated);
        saveLists(updated);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    const handleSwitchAccount = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    return (
        <div className="service-container">
            <div className="user-info">
                <span onClick={() => setShowDropdown(!showDropdown)}>👤 {user?.username}</span>
                {showDropdown && (
                    <div className="dropdown" ref={dropdownRef}>
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>SĐT:</strong> {user?.phone}</p>
                        <button onClick={handleSwitchAccount}>🔄 Chuyển tài khoản</button>
                        <button onClick={handleLogout}>🚪 Đăng xuất</button>
                    </div>
                )}
            </div>

            <h2>📋 Danh sách thuốc</h2>
            <button onClick={() => setShowListPopup(true)}>➕ Tạo danh sách mới</button>

            {patientLists.map((list, index) => (
                <div key={list.id || index} className="list-card">
                    <h3>👨‍⚕️ {list.name} – 🏥 {list.condition}</h3>
                    <ul>
                        {list.medications.map((med, idx) => (
                            <li key={med.id || idx}>
                                💊 <strong>{med.name}</strong> – {med.dose}, 🕒 {med.time}
                                {med.note && <span> – 📝 {med.note}</span>}
                                <button onClick={() => openMedPopup(index, idx)}>✏️ Sửa</button>
                                <button onClick={() => deleteMedication(index, idx)}>🗑️ Xoá</button>
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => openMedPopup(index)}>➕ Thêm thuốc</button>
                    <button onClick={() => handleDeleteList(index)}>🗑️ Xoá danh sách</button>
                </div>
            ))}

            {/* Overlay + Popup tạo danh sách */}
            {showListPopup && (
                <>
                    <div className="overlay" onClick={() => setShowListPopup(false)}></div>
                    <div className="popup">
                        <h3>🆕 Tạo danh sách</h3>
                        <input
                            placeholder="Tên người dùng thuốc"
                            value={newList.name}
                            onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                        />
                        <input
                            placeholder="Tên bệnh"
                            value={newList.condition}
                            onChange={(e) => setNewList({ ...newList, condition: e.target.value })}
                        />
                        <button onClick={handleAddList}>💾 Lưu</button>
                        <button onClick={() => setShowListPopup(false)}>❌ Huỷ</button>
                    </div>
                </>
            )}

            {/* Overlay + Popup thêm/sửa thuốc */}
            {showMedPopup && (
                <>
                    <div className="overlay" onClick={() => setShowMedPopup(false)}></div>
                    <div className="popup">
                        <h3>{popupMedIndex !== null ? '✏️ Sửa thuốc' : '➕ Thêm thuốc'}</h3>
                        <input
                            placeholder="Tên thuốc"
                            value={medicationData.name}
                            onChange={(e) => setMedicationData({ ...medicationData, name: e.target.value })}
                        />
                        <input
                            placeholder="Liều lượng"
                            value={medicationData.dose}
                            onChange={(e) => setMedicationData({ ...medicationData, dose: e.target.value })}
                        />
                        <input
                            type="time"
                            value={medicationData.time}
                            onChange={(e) => setMedicationData({ ...medicationData, time: e.target.value })}
                        />
                        <input
                            placeholder="Ghi chú"
                            value={medicationData.note}
                            onChange={(e) => setMedicationData({ ...medicationData, note: e.target.value })}
                        />
                        <button onClick={saveMedication}>💾 Lưu</button>
                        <button onClick={() => setShowMedPopup(false)}>❌ Huỷ</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Service;
