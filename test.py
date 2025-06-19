import requests

API_BASE = "https://offialjk-416525629014.asia-southeast1.run.app"

payload = {
    "device_udid": "123456",
    "email": "duckisidoros@gmail.com",
    "password": "111111.aA",
    "username": "duck",
    "phone_number": "0383969099",
    "device_id": "123456"
}

with requests.Session() as session:
    response = session.post(f"{API_BASE}/login", json=payload)
    print(response.json())
    response = session.post(f"{API_BASE}/mark_pill_taken", json=payload)
    print(response.json())
    response = session.post(f"{API_BASE}/mark_pill_taken", json=payload)
    print(response.json())