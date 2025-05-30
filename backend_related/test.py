import requests, json 

payload = {
    "email": "104240618@student.vgu.edu.vn",
    "password": "11111111@",
    "medical_name": "Paracetamol",
    "medical_amount": 2,
    "medical_time": "17:10",
    "medical_duration_days": 5,
    "uid": "9qmG2APy10cScHCfhiCssHvAH4g2",
    "phone_number": "0123456789",
    "user_name": "Test User",
    "username": "testuser",
}
response = requests.post("http://127.0.0.1:5000/mark_pill_taken", json=payload)
print(response.json())