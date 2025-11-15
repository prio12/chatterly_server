# Chatterly - Server

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-black)

[🚀 Live API](https://chatterly-server-nizy.onrender.com)

This is the backend server for **Chatterly**, a real-time social networking platform. It handles user data, posts, notifications, stories, conversations, and real-time events via Socket.io.

---

## ✨ Features

- 🔌 REST APIs for users, posts, notifications, stories, and conversations
- 🔐 User authentication with JWT and Firebase
- 🔔 Real-time notifications for post interactions
- 💬 Real-time chatting with typing indicators and online status
- 👥 Manage user connections (friend requests, active friends)
- 📸 Media support (images/videos) via Cloudinary

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Atlas)
- **Real-time:** Socket.io
- **Authentication:** Firebase + JWT
- **Deployment:** Render

---

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/Chatterly_Server.git
cd Chatterly_Server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set environment variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_CONNECTION_STRING=<your_mongodb_connection_string>
JWT_SECRET_KEY=<your_jwt_secret>
CLIENT_URL=https://chatterly-ddcd5.web.app
```

> **Note:** `CLIENT_URL` should match your deployed client application URL.

### 4. Run locally

```bash
node index.js
```

The server should be running on `http://localhost:5000` (or your configured `PORT`).

---

## 🌐 Deployment Notes (Render)

- The server is deployed on [Render](https://render.com) at `https://chatterly-server-nizy.onrender.com`.
- **Important:** Free Render servers "sleep" after periods of inactivity. The first request after sleep may take a few seconds to respond.
- Ensure the `CLIENT_URL` in `.env` is set to your deployed client URL for Socket.io and CORS to work properly.

---

## 📡 API Endpoints

| Method | Endpoint         | Description                 |
| ------ | ---------------- | --------------------------- |
| GET    | `/`              | Server health check         |
| POST   | `/users`         | Add a new user              |
| GET    | `/users`         | Get all users               |
| GET    | `/users/:uid`    | Get user by UID             |
| PATCH  | `/users/:uid`    | Update user info            |
| \*     | `/posts`         | Full CRUD for posts         |
| \*     | `/notifications` | Full CRUD for notifications |
| \*     | `/connections`   | Full CRUD for connections   |
| \*     | `/stories`       | Full CRUD for stories       |
| \*     | `/conversations` | Full CRUD for conversations |

**Socket.io events** handle real-time interactions (messaging, notifications, typing indicators, online status).

---

---

## 🔗 Related Repositories

- **[Chatterly Client](https://github.com/prio12/Chatterly_Client)** - Front End with React, firebase, tailwind, cloudinary

---

## 📝 Notes

- Ensure MongoDB Atlas is running and accessible.
- Socket.io handles all real-time events (messaging, notifications, typing indicators, online status).
- Keep `.env` secure; do not push secrets to public repositories.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

## 📄 License

This project is licensed under the MIT License.
