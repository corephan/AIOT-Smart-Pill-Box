# Setup cơ bản:

SMTP_SERVER = smtp.gmail.com
SMTP_PORT = 587
SENDER_EMAIL =
SENDER_PASSWORD =
Vui lòng ghi các dòng như trên vào .env file

## Các API Endpoints

### Đăng ký (Register)

- **URL**: `/register`
- **Method**: `POST`
- **Chức năng**: Tạo tài khoản người dùng mới với email và mật khẩu. Gửi email xác minh tài khoản sau khi đăng ký thành công.

#### Request (Input)

- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "email": "string", // Email của người dùng (bắt buộc)
    "password": "string" // Mật khẩu của người dùng (bắt buộc)
  }
  ```
  - **Lưu ý về `password`**: Mật khẩu phải đáp ứng các yêu cầu bảo mật được định nghĩa trong hàm `check_password` (không được cung cấp trong mã nguồn, giả định tồn tại và có logic kiểm tra độ phức tạp).

#### Response (Output)

- **Status Code**: `201 Created`
- **Body (Thành công)**:
  ```json
  {
    "message": "User created successfully",
    "uid": "string", // UID của người dùng được tạo
    "email": "string" // Email của người dùng
  }
  ```
- **Status Code**: `400 Bad Request`
- **Body (Lỗi)**: Xem phần [Mã lỗi phổ biến](#mã-lỗi-phổ-biến)
  - `EMAIL_REQUIRED`: Email không được cung cấp.
  - `EMAIL_INVALID`: Định dạng email không hợp lệ.
  - `PASSWORD_REQUIRED`: Mật khẩu không được cung cấp.
  - `PASSWORD_INVALID`: Mật khẩu không đáp ứng yêu cầu bảo mật.
  - `EMAIL_ALREADY_EXISTS`: Email đã tồn tại.
  - `INTERNAL_ERROR`: Lỗi máy chủ nội bộ.

### Đăng nhập (Login)

- **URL**: `/login`
- **Method**: `POST`
- **Chức năng**: Đăng nhập người dùng bằng email và mật khẩu. Trả về `id_token` và `uid` nếu đăng nhập thành công. Kiểm tra trạng thái xác minh email.

#### Request (Input)

- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "email": "string", // Email của người dùng (bắt buộc)
    "password": "string" // Mật khẩu của người dùng (bắt buộc)
  }
  ```

#### Response (Output)

- **Status Code**: `200 OK`
- **Body (Thành công)**:
  ```json
  {
    "message": "Login successful",
    "uid": "string", // UID của người dùng
    "email": "string", // Email của người dùng
    "id_token": "string" // Firebase ID Token (được sử dụng cho các yêu cầu API yêu cầu xác thực)
  }
  ```
- **Status Code**: `400 Bad Request` hoặc `401 Unauthorized`
- **Body (Lỗi)**: Xem phần [Mã lỗi phổ biến](#mã-lỗi-phổ-biến)
  - `EMAIL_REQUIRED`: Email không được cung cấp.
  - `EMAIL_INVALID`: Định dạng email không hợp lệ.
  - `PASSWORD_REQUIRED`: Mật khẩu không được cung cấp.
  - `EMAIL_NOT_VERIFIED`: Email chưa được xác minh.
  - `EMAIL_NOT_FOUND`: Email không tìm thấy.
  - `AUTH_FAILED`: Email hoặc mật khẩu không hợp lệ.
  - `INTERNAL_ERROR`: Lỗi máy chủ nội bộ.

### Đặt lại mật khẩu (Reset Password)

- **URL**: `/reset_password`
- **Method**: `POST`
- **Chức năng**: Gửi một liên kết đặt lại mật khẩu đến email của người dùng.

#### Request (Input)

- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "email": "string" // Email của người dùng cần đặt lại mật khẩu (bắt buộc)
  }
  ```

#### Response (Output)

- **Status Code**: `200 OK`
- **Body (Thành công)**:
  ```json
  {
    "message": "Reset password link sent to your email"
  }
  ```
- **Status Code**: `400 Bad Request`
- **Body (Lỗi)**: Xem phần [Mã lỗi phổ biến](#mã-lỗi-phổ-biến)
  - `EMAIL_REQUIRED`: Email không được cung cấp.
  - `EMAIL_INVALID`: Định dạng email không hợp lệ.
  - `EMAIL_NOT_FOUND`: Email không tìm thấy.
  - `FAILED`: Không thể gửi liên kết đặt lại mật khẩu (thường do lỗi email).
  - `INTERNAL_ERROR`: Lỗi máy chủ nội bộ.

### Đăng nhập bằng OTP/Xác thực Firebase Token (OTP Login / Firebase Token Authentication)

- **URL**: `/OTP_login`
- **Method**: `POST`
- **Chức năng**: Xác thực người dùng bằng Firebase ID Token (thường được lấy từ quá trình đăng nhập OTP qua điện thoại hoặc các phương thức đăng nhập khác của Firebase).

#### Request (Input)

- **Headers**:
  - `Authorization`: `Bearer <Firebase_ID_Token>` (Token được cung cấp bởi Firebase sau khi xác thực OTP hoặc các phương thức khác).

#### Response (Output)

- **Status Code**: `200 OK`
- **Body (Thành công)**:
  ```json
  {
    "message": "Logged in as UID <user_uid>", // Thông báo đăng nhập thành công
    "phone": "string" // Số điện thoại của người dùng (nếu có trong token)
  }
  ```
- **Status Code**: `401 Unauthorized` hoặc `403 Forbidden`
- **Body (Lỗi)**:
  ```json
  {
    "error": "string", // Mô tả lỗi chung
    "details": "string" // Chi tiết lỗi cụ thể
  }
  ```
  - `Missing or invalid token`: Header Authorization không hợp lệ.
  - `Token verification failed`: Token không hợp lệ hoặc hết hạn.
