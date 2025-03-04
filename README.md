# User Authentication System

## Introduction

Welcome to the **User Authentication System**! This project is built using **Node.js, Express, and MongoDB** to handle user registration, login, and password reset securely. We use **JWT for authentication and bcrypt for password** to ensure user sessions are safe.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JSON Web Token (JWT)
- **Security**: Bcrypt.js for password hashing
- **Email Service**: Nodemailer (for password reset emails)

## Features

- **User Registration**: Users can sign up with a name, email, and password.
- **User Login**: Authenticated using JWT with email and password.
- **Password Reset**: Users can reset their password via email.
- **User Role-Based Access** (Admin/User - optional for expansion).
- **Token Verification**: Securely validates user sessions.

---

## Setup & Installation

### Clone the Repository

```sh
git clone https://github.com/kashyapanjali/AuthBackend.git
cd authbackend
```

### Install Dependencies

```sh
npm install
```

### Set Up Environment Variables

Create a `.env` file in the root folder and add the following:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### Start the Server

```sh
npm start
```

The server should now be running on **http://localhost:5000**

---

## API Endpoints

### Authentication Routes

| Method | Endpoint               | Description                     |
| ------ | ---------------------- | ------------------------------- |
| POST   | `/api/register`        | Register a new user             |
| POST   | `/api/login`           | User login and token generation |
| POST   | `/api/forgot-password` | Request a password reset link   |
| POST   | `/api/reset-password`  | Reset password using the token  |
| GET    | `/api/users/profile`   | Fetch user name (requires JWT)  |
| GET    | `/api/getusername`     | Fetch user name (requires JWT)  |
| GET    | `/api/getuseremail`    | Fetch user email (requires JWT) |

---

## Security Measures

- **Password Hashing**: Uses bcrypt.js to securely store passwords.
- **JWT Authentication**: Ensures only authorized users access secure routes.
- **Input Validation**: Checks for missing fields, invalid emails, and weak passwords.
- **Error Handling**: Provides clear error messages and status codes.

---
