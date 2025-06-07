# API Documentation

# Bạn hãy nhớ tận dụng kho lưu trữ của React để lưu trữ cookie của FLask Session cho việc lưu thông tin nha!

---

## Database Structure (Firebase Realtime Database)

Dưới đây là cấu trúc dữ liệu mẫu của Firebase Realtime Database cho dự án này:

```json
{
  "users": {
    "{uid}": {
      "email": "user@example.com",
      "username": "Tên người dùng",
      "phone_number": "0123456789",
      "created_at": "2024-06-07T12:00:00Z",
      "verified": true
    }
  },
  "devices": {
    "{device_uid}": {
      "owner_uid": "{uid}",
      "paired_at": "2024-06-07T12:00:00Z",
      "device_name": "Tên thiết bị"
    }
  },
  "patients": {
    "{list_id}": {
      "uid": "{uid}",
      "name": "Tên bệnh nhân",
      "condition": "Tình trạng bệnh",
      "allergic": "Dị ứng (nếu có)",
      "created_at": "2024-06-07T12:00:00Z"
    }
  },
  "medical_schedules": {
    "{schedule_id}": {
      "uid": "{uid}",
      "medical_name": "Tên thuốc",
      "medical_amount": "Liều lượng",
      "medical_time": "08:00",
      "medical_duration_days": 7,
      "note": "Ghi chú (nếu có)",
      "created_at": "2024-06-07T12:00:00Z"
    }
  },
  "pill_logs": {
    "{log_id}": {
      "device_id": "{device_uid}",
      "uid": "{uid}",
      "scheduled_time": "08:00",
      "taken_at": "08:05",
      "status": "taken"
    }
  }
}
```

> **Lưu ý:**
>
> - `{uid}`, `{device_uid}`, `{list_id}`, `{schedule_id}`, `{log_id}` là các khóa tự sinh hoặc định danh duy nhất.
> - Bạn có thể mở rộng thêm các trường khác tùy theo nhu cầu thực tế.

## Register

- **URL:** `/register`
- **Method:** `POST`
- **Input:**
  ```json
  {
    "email": "string", // Required
    "password": "string", // Required
    "phone_number": "string", // Required (Vietnamese format)
    "username": "string" // Required (≤10 chars, letters/numbers/spaces)
  }
  ```
- **Success Response:** `201 Created`
  ```json
  {
    "message": "User created successfully",
    "uid": "string",
    "email": "string"
  }
  ```
- **Error Codes:**  
  `USERNAME_REQUIRED`, `EMAIL_REQUIRED`, `EMAIL_INVALID`, `PASSWORD_REQUIRED`, `PASSWORD_INVALID`, `PHONE_NUMBER_REQUIRED`, `PHONE_NUMBER_INVALID`, `USERNAME_INVALID`, `EMAIL_ALREADY_EXISTS`, `INTERNAL_ERROR`

---

## Login

- **URL:** `/login`
- **Method:** `POST`
- **Input:**
  ```json
  {
    "email": "string", // Required
    "password": "string" // Required
  }
  ```
- **Success Response:** `200 OK`
  ```json
  {
    "message": "Login successful",
    "uid": "string",
    "email": "string",
    "id_token": "string"
  }
  ```
- **Error Codes:**  
  `EMAIL_REQUIRED`, `EMAIL_INVALID`, `PASSWORD_REQUIRED`, `PASSWORD_INVALID`, `AUTH_FAILED`, `EMAIL_NOT_VERIFIED`, `EMAIL_NOT_FOUND`, `INVALID_PASSWORD`, `INTERNAL_ERROR`

---

## Reset Password

- **URL:** `/reset_password`
- **Method:** `POST`
- **Input:**
  ```json
  {
    "email": "string" // Required
  }
  ```
- **Success Response:** `200 OK`
  ```json
  {
    "message": "Reset password link sent to your email"
  }
  ```
- **Error Codes:**  
  `EMAIL_REQUIRED`, `EMAIL_INVALID`, `FAILED`, `EMAIL_NOT_FOUND`, `INTERNAL_ERROR`

---

## Pair Device

- **URL:** `/pair_device`
- **Method:** `POST`
- **Input:**
  ```json
  {
    "device_uid": "string" // Required
  }
  ```
- **Success Response:** `200 OK`
  ```json
  {
    "message": "Device paired successfully!",
    "device_uid": "string"
  }
  ```
- **Error Codes:**
  - `401 Unauthorized` if not logged in
  - `400 Bad Request` if device already paired or missing device_uid
  - `500 Internal Server Error` on failure

---

## Generate QR Code

- **URL:** `/generate_QR_code`
- **Method:** `POST`
- **Input:**
  ```json
  {
    "device_udid": "string" // Required
  }
  ```
- **Success Response:**

  - Returns a PNG image file of the QR code for the device.

- **Error Codes:**
  - `400 Bad Request` if device_udid missing
  - `500 Internal Server Error` on failure

---

## Add Patient List

- **URL:** `/add_patient_list`
- **Method:** `POST`
- **Input:**
  ```json
  {
    "uid": "string", // Optional (taken from session if not provided)
    "name": "string", // Required
    "condition": "string", // Required
    "allergic": "string" // Optional
  }
  ```
- **Success Response:** `201 Created`
  ```json
  {
    "message": "Patient list added successfully",
    "list_id": "string"
  }
  ```
- **Error Codes:**  
  `UNAUTHORIZED`, `MISSING_FIELDS`

---

## Medical Management

- **URL:** `/medical_management`
- **Method:** `POST`
- **Input:**
  ```json
  {
    "medical_time": "HH:MM",         // Required
    "medical_duration_days": number, // Required
    "name": "string",                // Required (medicine name)
    "note": "string",                // Optional (default: "Nothing")
    "dose": "string"                 // Optional
  }
  ```
- **Success Response:** `201 Created`
  ```json
  {
    "message": "Medication and schedule created",
    "event_count": number
  }
  ```
- **Error Codes:**  
  `UNAUTHORIZED`, `MISSING_FIELDS`, `INVALID_DURATION`, `INVALID_TIME`, `CALENDAR_ERROR`

---

## Mark Pill Taken

- **URL:** `/mark_pill_taken`
- **Method:** `POST`
- **Input:**
  ```json
  {
    "device_id": "string" // Required
  }
  ```
- **Success Response:** `200 OK`
  ```json
  {
    "message": "Pill marked as taken",
    "scheduled_time": "HH:MM",
    "taken_at": "HH:MM"
  }
  ```
- **Error Codes:**  
  `DEVICE_ID_REQUIRED`, `UNAUTHORIZED`, `NO_MATCH`, `SERVER_ERROR`

---

## Notes

- All endpoints expect and return JSON unless otherwise specified.
- Authentication is managed via Flask session cookies.
- For device and medication management, user must be authenticated (session must contain `uid`).
- Error responses have a `code` and `message` field for easier handling on the frontend.

---

For further details, see the implementation in [backend_related/main.py](backend_related/main.py).
