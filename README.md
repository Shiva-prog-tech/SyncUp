# SyncUp
This Social Networking Application
# SyncUp — Networking Platform

Full-stack professional networking app with real-time messaging, built with:

**Frontend:** React + TypeScript + Vite + Tailwind CSS + Socket.IO Client  
**Backend:** Node.js + Express + MongoDB + Socket.IO + JWT Auth

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally OR a MongoDB Atlas URI

---

### 1. Backend Setup

```bash
cd server
npm install
cp ../.env.example .env   # edit .env with your values
npm run dev
```

**server/.env** (required)

---

### 2. Frontend Setup

```bash
# from project root
npm install
cp .env.example .env.local  # values already set for local dev
npm run dev
```

---

### 3. Open two browsers / incognito windows

Register two different user accounts and experience real-time:
- ✅ Live messaging with typing indicators
- ✅ Real-time notifications (likes, comments, connections)
- ✅ Online/offline presence indicators
- ✅ Posts appear instantly across all sessions

---

## 📁 Project Structure

```
syncup/
├── server/                  # Node.js backend
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Message.js
│   │   └── Notification.js
│   ├── routes/              # Express REST API
│   │   ├── auth.js          # /api/auth
│   │   ├── posts.js         # /api/posts
│   │   ├── messages.js      # /api/messages
│   │   ├── notifications.js # /api/notifications
│   │   └── users.js         # /api/users
│   ├── middleware/
│   │   └── auth.js          # JWT middleware
│   ├── socket/
│   │   └── socketHandler.js # WebSocket events
│   └── index.js             # Entry point
│
├── src/                     # React frontend
│   ├── context/
│   │   └── AuthContext.tsx  # Auth + socket init
│   ├── lib/
│   │   ├── api.ts           # REST API calls
│   │   └── socket.ts        # Socket.IO client
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── NetworkView.tsx
│   │   └── JobsView.tsx
│   └── components/
│       ├── layout/          # Navbar, Sidebars
│       ├── feed/            # Feed, PostCard, CreatePost
│       ├── messaging/       # Real-time chat widget
│       ├── notifications/   # Live notifications
│       ├── profile/         # Editable profile
│       └── ui/              # Avatar, Button, Card, Input
│
└── README.md
```

---

## 🔌 WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `send_message` | Client → Server | Send a chat message |
| `new_message` | Server → Client | Receive a message |
| `message_sent` | Server → Client | Confirm your sent message |
| `typing_start` | Client → Server | User started typing |
| `typing_stop` | Client → Server | User stopped typing |
| `user_typing` | Server → Client | Other user is typing |
| `user_stopped_typing` | Server → Client | Other stopped typing |
| `mark_read` | Client → Server | Mark messages as read |
| `messages_read` | Server → Client | Messages were read |
| `new_notification` | Server → Client | New notification pushed |
| `new_post` | Server → Client | New post in feed |
| `post_updated` | Server → Client | Post likes/comments updated |
| `post_deleted` | Server → Client | Post deleted |
| `user_online` | Server → Client | User online status changed |
