# API Documentation

# Bạn hãy nhớ tận dụng kho lưu trữ của React để lưu trữ cookie của FLask Session cho việc lưu thông tin nha!

## Register

- **URL**: `/register`
- **Method**: `POST`
- **Input** (`application/json`):
  ```json
  {
    "email": "string", // Required
    "password": "string", // Required
    "phone_number": "string", // Required
    "username": "string" // Required
  }
  ```
- **Responses**:
  - **201 Created**
    ```json
    {
      "message": "User created successfully",
      "uid": "string",
      "email": "string"
    }
    ```
  - **400 Bad Request**
    - `USERNAME_REQUIRED`: Username is required
    - `EMAIL_REQUIRED`: Email is required
    - `EMAIL_INVALID`: Invalid email format
    - `PASSWORD_REQUIRED`: Password is required
    - `PASSWORD_INVALID`: Password does not meet security requirements.
    - `PHONE_NUMBER_REQUIRED`: Phone number is required
    - `PHONE_NUMBER_INVALID`: Invalid Vietnamese phone number format
    - `USERNAME_INVALID`: Username must be 10 characters or less and can only contain letters, numbers, and spaces.
    - `EMAIL_ALREADY_EXISTS`: Email already exists
    - `INTERNAL_ERROR`: Internal server error. Please try again later.

---

## Login

- **URL**: `/login`
- **Method**: `POST`
- **Input** (`application/json`):
  ```json
  {
    "email": "string", // Required
    "password": "string" // Required
  }
  ```
- **Responses**:
  - **200 OK**
    ```json
    {
      "message": "Login successful",
      "uid": "string",
      "email": "string",
      "id_token": "string"
    }
    ```
  - **400 Bad Request**
    - `EMAIL_REQUIRED`: Email is required
    - `EMAIL_INVALID`: Invalid email format
    - `PASSWORD_REQUIRED`: Password is required
    - `PASSWORD_INVALID`: Password does not meet security requirements.
    - `AUTH_FAILED`: Authentication failed. Please check your credentials.
    - `EMAIL_NOT_VERIFIED`: Email not verified
    - `EMAIL_NOT_FOUND`: Email not found
    - `INVALID_PASSWORD`: Invalid password
    - `INTERNAL_ERROR`: Internal server error. Please try again later.

---

## Reset Password

- **URL**: `/reset_password`
- **Method**: `POST`
- **Input** (`application/json`):
  ```json
  {
    "email": "string" // Required
  }
  ```
- **Responses**:
  - **200 OK**
    ```json
    {
      "message": "Reset password link sent to your email"
    }
    ```
  - **400 Bad Request**
    - `EMAIL_REQUIRED`: Email is required
    - `EMAIL_INVALID`: Invalid email format
    - `FAILED`: Please check whether you have typed email correctly.
    - `EMAIL_NOT_FOUND`: Email not found.
    - `INTERNAL_ERROR`: Internal server error. Please try again later.

---

## OTP Login

- **URL**: `/OTP_login`
- **Method**: `POST`
- **Headers**:
  - `Authorization: Bearer <Firebase_ID_Token>`
- **Input**: No body.
- **Responses**:
  - **200 OK**
    ```json
    {
      "message": "Logged in as UID <user_uid>",
      "phone": "string"
    }
    ```
  - **401 Unauthorized**
    ```json
    {
      "error": "Missing or invalid token"
    }
    ```
  - **403 Forbidden**
    ```json
    {
      "error": "Token verification failed",
      "details": "string"
    }
    ```

---

## Medical Management

- **URL**: `/medical_management`
- **Method**: `POST`
- **Input** (`application/json`):

  ```json
  {
    "medical_name": "string",       // Required
    "medical_amount": "string",     // Required
    "medical_time": "string",       // Required, format "HH:MM"
    "medical_duration_days": number // Required
  }
  ```

  > **Note:** `uid` and `email` are taken from Flask Session, not from the request body.

- **Responses**:
  - **200 OK**
    ```json
    {
      "message": "Schedule created",
      "event_count": number
    }
    ```
  - **401 Unauthorized**
    - `UNAUTHORIZED`: User not logged in
  - **400 Bad Request**
    - `INVALID_TIME`: Time must be in HH:MM format
  - **500 Internal Server Error**
    - `CALENDAR_ERROR`: [error message]

---
