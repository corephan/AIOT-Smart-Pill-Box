import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Service.css';

const API_BASE = import.meta.env.VITE_API_BASE;

async function fetchPatientLists() {
  const res = await fetch(`${API_BASE}/get_patient_lists`, {
    credentials: "include",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.patient_lists || [];
}

async function addPatientList(newList) {
  const res = await fetch(`${API_BASE}/add_patient_list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      name: newList.name,
      condition: newList.condition,
      allergic: newList.allergy,
    }),
  });
  return res.ok;
}

async function addMedication(medicationData, list_id) {
  const res = await fetch(`${API_BASE}/medical_management`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      medical_time: medicationData.time,
      medical_duration_days: medicationData.durationOfDays,
      medical_name: medicationData.name,
      note: medicationData.note,
      dose: medicationData.dose,
      list_id: list_id,
    }),
  });
  return res.ok;
}
async function deletePatientList(list_id) {
  const res = await fetch(`${API_BASE}/delete_patient_list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ list_id }),
  });
  return res.ok;
}

async function deleteMedicationFromList(list_id, med_name) {
  const res = await fetch(`${API_BASE}/delete_medication`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ list_id, med_name }),
  });
  return res.ok;
}

function Service() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [patientLists, setPatientLists] = useState([]);
  const [newList, setNewList] = useState({ name: '', condition: '', allergy: '' });
  const [medicationData, setMedicationData] = useState({ 
    name: '', 
    dose: '', 
    time: '', 
    note: '', 
    durationOfDays: '' 
  });
  const [popupListIndex, setPopupListIndex] = useState(null);
  const [popupMedIndex, setPopupMedIndex] = useState(null);
  const [showMedPopup, setShowMedPopup] = useState(false);
  const [showListPopup, setShowListPopup] = useState(false);
  const [filterType, setFilterType] = useState(null);

  // QR feature states
  const [showQRPopup, setShowQRPopup] = useState(false);
  const videoRef = useRef(null);
  const [qrResult, setQrResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [pairingMessage, setPairingMessage] = useState(null); // New state for pairing result

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${API_BASE}/user_info`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setUser({ uid: data.uid, email: data.email });
          setShowLoginPopup(false);
          const lists = await fetchPatientLists();
          setPatientLists(lists);
        } else {
          setShowLoginPopup(true);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setShowLoginPopup(true);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // QR scanning logic
  useEffect(() => {
    let stream;
    let animationId;
    let scanningActive = false;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', true);
          await videoRef.current.play();
          setScanning(true);
          scanningActive = true;
          scanFrame();
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
      }
    }

    function stopCamera() {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setScanning(false);
      scanningActive = false;
      if (animationId) cancelAnimationFrame(animationId);
    }

    async function scanFrame() {
      if (!videoRef.current || !scanningActive) return;
      const video = videoRef.current;
      if (video.readyState !== 4) {
        animationId = requestAnimationFrame(scanFrame);
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Dynamically import jsQR for QR code scanning
      const jsQR = (await import('jsqr')).default;
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code && code.data) {
        setQrResult(code.data);
        stopCamera();
        setShowQRPopup(false);
        // Pair device logic
        pairDeviceWithAccount(code.data);
      } else if (scanningActive) {
        animationId = requestAnimationFrame(scanFrame);
      }
    }

    if (showQRPopup) {
      setQrResult(null);
      setPairingMessage(null); // Reset pairing message
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line
  }, [showQRPopup]);

  // Pair device with account after QR scan
  async function pairDeviceWithAccount(deviceUid) {
    try {
      const res = await fetch(`${API_BASE}/pair_device`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ device_uid: deviceUid })
      });
      const data = await res.json();
      if (res.ok) {
        setPairingMessage({ type: 'success', text: data.message || 'Device paired successfully!' });
      } else {
        setPairingMessage({ type: 'error', text: data.message || 'Failed to pair device.' });
      }
    } catch (err) {
      setPairingMessage({ type: 'error', text: 'Failed to pair device.' });
    }
  }

  const handleAddList = async () => {
    const success = await addPatientList(newList);
    if (success) {
      const lists = await fetchPatientLists();
      setPatientLists(lists);
      setNewList({ name: '', condition: '', allergy: '' });
      setShowListPopup(false);
    } else {
      alert("Failed to add medication list!");
    }
  };

  const loadLists = async () => {
    const lists = await fetchPatientLists();
    setPatientLists(lists);
  };

  const handleDeleteList = async (list_id) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh sách này?")) return;
    const success = await deletePatientList(list_id);
    if (success) {
      await loadLists();
    } else {
      alert("Xóa danh sách thất bại!");
    }
  };

  const handleDeleteMedication = async (list_id, med_name) => {
    if (!window.confirm("Bạn có chắc muốn xóa thuốc này?")) return;
    const success = await deleteMedicationFromList(list_id, med_name);
    if (success) {
      await loadLists();
    } else {
      alert("Xóa thuốc thất bại!");
    }
  };

  const openMedPopup = (listIndex, medIndex = null) => {
    setPopupListIndex(listIndex);
    setPopupMedIndex(medIndex);
    if (medIndex !== null) {
      const med = patientLists[listIndex].medications[medIndex];
      setMedicationData({ 
        ...med, 
        durationOfDays: med.durationOfDays || '' 
      });
    } else {
      setMedicationData({ 
        name: '', 
        dose: '', 
        time: '', 
        note: '', 
        durationOfDays: '' 
      });
    }
    setShowMedPopup(true);
  };

  const saveMedication = async () => {
    const list_id = patientLists[popupListIndex]?.list_id;
    const success = await addMedication(medicationData, list_id);
    if (success) {
      const lists = await fetchPatientLists();
      setPatientLists(lists);
      setShowMedPopup(false);
    } else {
      alert("Failed to add medication!");
    }
  };

  const getFilteredMedications = (meds) => {
    const now = new Date();
    const in3days = new Date();
    in3days.setDate(now.getDate() + 3);

    return meds.filter((med) => {
      if (!med.durationOfDays) return false;
      const start = med.createdAt ? new Date(med.createdAt) : new Date();
      const due = new Date(start);
      due.setDate(start.getDate() + Number(med.durationOfDays));
      if (filterType === 'expired') return due < now;
      if (filterType === 'upcoming') return due >= now && due <= in3days;
      return true;
    });
  };

  return (
    <div className="service-container">
      {showLoginPopup && (
        <div className="popup">
          <h3>🔒 You need to login to use this service</h3>
          <button onClick={() => navigate('/login')}>🔐 Login</button>
          <button onClick={() => navigate('/register')}>📝 Register</button>
        </div>
      )}

      {user && (
        <>
          <h2>📋 Medication Lists</h2>
          <div className="filter-buttons">
            <button onClick={() => setFilterType('upcoming')}>
              📍 Expiring soon (3 days)
            </button>
            <button onClick={() => setFilterType('expired')}>
              ⛔ Expired
            </button>
            <button onClick={() => setFilterType(null)}>
              🔄 All
            </button>
          </div>

          <button
            onClick={() => setShowQRPopup(true)}
            className="qr-btn"
            style={{ marginBottom: 16 }}
          >
            📷 Scan QR
          </button>

          {patientLists.length === 0 && (
            <button 
              onClick={() => setShowListPopup(true)}
              className="add-list-btn"
            >
              ➕ Create Medication List
            </button>
          )}

          {patientLists.map((list, index) => (
            <div key={index} className="list-card">
              <h3>👨‍⚕️ {list.name} – 🏥 {list.condition}</h3>
              {list.allergy && (
                <p className="allergy">⚠️ Allergy: {list.allergy}</p>
              )}
              <ul>
                {getFilteredMedications(list.medications).map((med, idx) => (
                  <li 
                    key={idx} 
                    className={new Date(med.dueDate) < new Date() ? 'expired' : ''}
                  >
                    💊 <strong>{med.name}</strong> – {med.dose}, 🕒 {med.time} – 
                    {(() => {
                      const [hour] = med.time.split(':').map(Number);
                      if (hour >= 5 && hour < 12) return 'Morning';
                      if (hour >= 12 && hour < 17) return 'Afternoon';
                      if (hour >= 17 && hour < 21) return 'Evening';
                      return 'Night';
                    })()}
                    {med.note && <span> – 📝 {med.note}</span>}
                    {med.dueDate && (
                      <span className="due-date-info">
                        ⏰ Due: {med.dueDate} – {(() => {
                          const today = new Date();
                          const due = new Date(med.dueDate);
                          const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
                          return diff >= 0 ? `Days left: ${diff}` : 'Expired';
                        })()}
                      </span>
                    )}
                    <button 
                      onClick={() => openMedPopup(index, idx)}
                      className="edit-btn"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteMedication(list.list_id, med.name)}
                      className="delete-btn"
                    >
                      🗑️ Delete
                    </button>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => openMedPopup(index)}
                className="add-med-btn"
              >
                ➕ Add Medication
              </button>
              <button 
                onClick={() => handleDeleteList(list.list_id)}
                className="delete-list-btn"
              >
                🗑️ Delete List
              </button>
            </div>
          ))}

          {patientLists.length > 0 && (
            <div className="single-list-warning">
              ⚠️ Bạn chỉ có thể tạo một danh sách thuốc duy nhất.
            </div>
          )}
        </>
      )}

      {showListPopup && (
        <div className="popup">
          <h3>🆕 Create Medication List</h3>
          <input 
            placeholder="Patient name" 
            value={newList.name}
            onChange={(e) => setNewList({ ...newList, name: e.target.value })}
          />
          <input 
            placeholder="Medical condition" 
            value={newList.condition}
            onChange={(e) => setNewList({ ...newList, condition: e.target.value })}
          />
          <input 
            placeholder="Allergies (if any)" 
            value={newList.allergy}
            onChange={(e) => setNewList({ ...newList, allergy: e.target.value })}
          />
          <button onClick={handleAddList}>💾 Save</button>
          <button onClick={() => setShowListPopup(false)}>❌ Cancel</button>
        </div>
      )}

      {showMedPopup && (
        <div className="popup">
          <h3>{popupMedIndex !== null ? '✏️ Edit Medication' : '➕ Add Medication'}</h3>
          <input 
            placeholder="Medication name" 
            value={medicationData.name}
            onChange={(e) => setMedicationData({ ...medicationData, name: e.target.value })}
          />
          <input 
            placeholder="Dosage" 
            value={medicationData.dose}
            onChange={(e) => setMedicationData({ ...medicationData, dose: e.target.value })}
          />
          <input 
            type="time" 
            value={medicationData.time} 
            placeholder="Time (e.g., 13:00)"
            onChange={(e) => setMedicationData({ ...medicationData, time: e.target.value })}
          />
          <input 
            type="number" 
            min="1" 
            placeholder="Duration (days)" 
            value={medicationData.durationOfDays}
            onChange={(e) => setMedicationData({ ...medicationData, durationOfDays: e.target.value })}
          />
          <input 
            placeholder="Notes" 
            value={medicationData.note}
            onChange={(e) => setMedicationData({ ...medicationData, note: e.target.value })}
          />
          <button onClick={saveMedication}>💾 Save</button>
          <button onClick={() => setShowMedPopup(false)}>❌ Cancel</button>
        </div>
      )}

      {showQRPopup && (
        <div className="popup">
          <h3>📷 Scan QR Code</h3>
          <video
            ref={videoRef}
            width={300}
            height={220}
            autoPlay
            style={{ border: "1px solid #ccc", borderRadius: 8 }}
          />
          <div style={{ marginTop: 8 }}>
            {scanning ? <span>🔎 Scanning...</span> : <span>Stopped</span>}
          </div>
          <button onClick={() => setShowQRPopup(false)}>❌ Close</button>
        </div>
      )}

      {/* Show scanned QR result dynamically under all */}
      {qrResult && (
        <div className="qr-result" style={{ marginTop: 32, textAlign: 'center', fontWeight: 'bold', color: '#2a7' }}>
          <h3>✅ Scan Successful!</h3>
          <div>QR Content: <span style={{ wordBreak: 'break-all' }}>{qrResult}</span></div>
        </div>
      )}
      {pairingMessage && (
        <div className="qr-result" style={{ marginTop: 12, textAlign: 'center', fontWeight: 'bold', color: pairingMessage.type === 'success' ? '#2a7' : '#c22' }}>
          {pairingMessage.text}
        </div>
      )}
    </div>
  );
}
export default Service;