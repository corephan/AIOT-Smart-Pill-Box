import requests, json 

payload = {
    "email": "420618@student.vgu.edu.vn",
    "password": "123456789",
    "confirm_password": "123456789"
}

respones = requests.post("http://127.0.0.1:5000/register", json=payload)
print(respones.json())