# Team Forge (formerly CollabQuest) 🔗
**A Smart Team Formation & Collaboration Platform for Students**

---

## 📌 Project Status
**Backend: ✅ Production-ready**  
**Frontend: ✅ Production-ready**

Team Forge is a full-stack web application that enables students to discover teammates, form teams, manage approvals, and collaborate inside teams through structured workflows.

---

## 🚀 What Team Forge Solves

Finding teammates is easy.  
Finding compatible, committed, and manageable teams is not.

Team Forge solves this by combining:
- Swipe-based matching (mutual consent)
- Team-centric invitations
- Admin-controlled approvals
- Team chat and project boards

Teams form intentionally, not randomly.

---

## 🧠 Core Concepts

### 1. User-first matching
Users match before teams form. Mutual likes create a match and a conversation.

### 2. Teams as private workspaces
Each team has:
- Members and admin
- Capacity limits
- Invite policies
- Pending join requests

### 3. Admin approval (optional)
Teams can enforce:
- Open joining
- Admin-approved joining

---

## 🧱 Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs
- REST APIs

### Frontend
- React 18
- Vite
- React Router
- Axios
- Context API
- Modern CSS

---

## 🗄️ Database Models

### User
- fullName, email, password (hashed)
- skills, interests, availability
- profileImage
- teams
- timestamps

### Interaction
- senderId
- receiverId
- type (like/pass)

### Conversation
- participants
- lastMessage
- unread counts

### Team
- name, admin, members
- maxMembers
- invitePolicy
- invite tokens
- pendingInvites
- cooldowns

### TeamMessage
- teamId
- senderId
- content
- timestamps

### TeamProject
- tasks
- status
- progress
- colors

---

## 🔌 Key Features

### Authentication
- Secure signup/login
- JWT-protected routes

### Profile Management
- Edit skills and interests
- Upload profile image

### Matching System
- Swipe-based discovery
- Mutual like = match + chat

### Chat System
- 1-to-1 matched chat
- Unread counts
- Optimistic UI

### Teams
- Create and manage teams
- Invite matched users
- Admin approvals
- Join via invite links

### Team Chat
- Persistent messages
- Member-only access

### Project Board
- Task creation
- Progress tracking
- Status updates

---

## 🔒 Security
- Hashed passwords
- JWT middleware
- Admin-only enforcement
- Invite cooldowns

---

## 📁 Project Structure

```
TEAM_FORGE/
├── server/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
└── client/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── context/
    │   └── services/
    └── package.json
```

---

## 🛠️ Setup

### Backend
```
cd server
npm install
npm run dev
```

### Frontend
```
cd client
npm install
npm run dev
```

---

## 📈 Future Improvements
- Real-time chat (WebSockets)
- Notifications
- AI-based team optimization
- Organization-level teams

---

## ✅ Summary
Team Forge is a complete, scalable system for intentional team formation and collaboration.
