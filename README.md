# Team Forge (CollabQuest) 🔗  
*A Smart Team Formation Platform for Students*

---

## 📌 Project Status
**Backend: ✅ Complete** | **Frontend: ✅ Complete**

**CollabQuest** is now a full-stack application with a complete React frontend and Node.js/Express backend.  
The platform includes authentication, user management, swipe-style matching, profile management, and a modern UI.

---

## 🚀 Overview
Team Forge is a smart team-finding platform designed to help students form **balanced, compatible teams** for projects, hackathons, and collaborative learning.  
Users are matched based on **skills, interests, and availability**, ensuring both technical fit and real-world feasibility.

---

## 🧱 Core Infrastructure

### Tech Stack

**Backend:**
- **Runtime:** Node.js  
- **Framework:** Express.js  
- **Database:** MongoDB with Mongoose ODM  
- **Authentication:** JWT (JSON Web Tokens)  
- **Security:**  
  - Password hashing using `bcryptjs`  
  - Token-based authentication middleware  
  - CORS enabled for cross-origin requests

**Frontend:**
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router
- **HTTP Client:** Axios
- **Styling:** Modern CSS with gradient designs  

---

## 🗄️ Database Schemas (MongoDB)

### 1. User
Stores complete user profile information.
- Name, email, password (hashed)
- Skills (array of tags)
- Interests (array of tags)
- Availability (hours per week)
- Bio
- Role (user / admin)
- Timestamps

---

### 2. Team
Manages team-related data.
- Team name
- Members (user references)
- Required skills
- Created date

---

### 3. Interaction
Tracks user swipe actions for matching logic.
- User (who swiped)
- Target user
- Action (`like` / `pass`)
- Timestamp

---

### 4. Message
Schema for team-based chat functionality.
- Team reference
- Sender reference
- Message content
- Timestamp

---

## 🔌 Implemented API Endpoints

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Description |
|------|---------|------------|
| POST | `/signup` | Register a new user with hashed password |
| POST | `/login` | Authenticate user and return JWT token |

---

### 👤 User Profile (`/api/user`)

| Method | Endpoint | Description |
|------|---------|------------|
| GET | `/me` | Fetch logged-in user’s private profile |
| PUT | `/me` | Update profile (skills, interests, bio, availability) |
| GET | `/:id` | View public profile of another user |

---

### 🤝 Matching System (`/api/matches`)

| Method | Endpoint | Description |
|------|---------|------------|
| GET | `/candidates` | Fetch ranked list of compatible users |
| POST | `/swipe` | Record a "Like" or "Pass" action |

#### Compatibility Algorithm
Matches are ranked using a **rule-based scoring system**:


- Skill overlap + complementarity
- Shared interests and goals
- Realistic time commitment alignment
- Mutual likes trigger a match

---

## 🔒 Security Highlights
- Passwords are never stored in plain text
- JWT-based route protection using middleware
- Secure user-specific data access
- Input validation and structured schemas

---

## 🎨 Frontend Features

- **Authentication Pages** - Beautiful login and signup forms
- **Swipe-Style Matching** - Tinder-like interface for discovering teammates
- **Profile Management** - Edit skills, interests, bio, and availability
- **Matches View** - See all your mutual matches
- **Chat Interface** - Ready for team-based messaging (UI complete, backend integration pending)
- **Responsive Design** - Works on desktop and mobile devices
- **Modern UI** - Gradient designs, smooth animations, and intuitive UX

## 📈 What's Next (Planned)
- Team-based real-time chat backend integration
- Notifications for matches & invitations
- AI-based compatibility improvements
- Role-based access control
- Project board functionality

---



## 🛠️ Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd server
npm install

# Create .env file with:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key
# PORT=5000

npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

### Full Stack Development

Run both servers simultaneously:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

Visit `http://localhost:3000` to use the application!

---

## 📁 Project Structure

```
TEAM_FORGE/
├── server/          # Backend (Node.js/Express)
│   ├── config/      # Database configuration
│   ├── middleware/  # Auth middleware
│   ├── models/      # MongoDB models
│   ├── routes/      # API routes
│   └── server.js     # Entry point
└── client/          # Frontend (React)
    ├── src/
    │   ├── components/  # React components
    │   ├── pages/       # Page components
    │   ├── context/     # React Context
    │   └── services/    # API services
    └── package.json
```

