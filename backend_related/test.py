import requests, json 

payload = {
    "email": "104240618@student.vgu.edu.vn",
    "password": "11111111@Aa",
    "medical_name": "Paracetamol",
    "medical_amount": 2,
    "medical_time": "18:00",
    "medical_duration_days": 5,
    "uid": "kVXLTqFN1Jh7C5vw3nKzklqXQb43",
    "phone_number": "0383969099",
    "user_name": "Test User",
    "username": "testuser",
    "device_udid": "123456",
    "device_uid": "123456"
}
response = requests.post("http://127.0.0.1:5000/pair_device", json=payload)
