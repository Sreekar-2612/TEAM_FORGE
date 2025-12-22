# Team Forge (CollabQuest) 🔗  
*A Smart Team Formation Platform for Students*

---

## 📌 Project Status
**Backend Foundation: ✅ Complete**

The backend infrastructure for **Team Forge (CollabQuest)** has been fully implemented using **Node.js, Express, and MongoDB**.  
This phase focuses on authentication, user management, matching logic, and team communication readiness.

---

## 🚀 Overview
Team Forge is a smart team-finding platform designed to help students form **balanced, compatible teams** for projects, hackathons, and collaborative learning.  
Users are matched based on **skills, interests, and availability**, ensuring both technical fit and real-world feasibility.

---

## 🧱 Core Infrastructure

### Tech Stack
- **Runtime:** Node.js  
- **Framework:** Express.js  
- **Database:** MongoDB with Mongoose ODM  
- **Authentication:** JWT (JSON Web Tokens)  
- **Security:**  
  - Password hashing using `bcryptjs`  
  - Token-based authentication middleware  
  - CORS enabled for cross-origin requests  

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

## 📈 What’s Next (Planned)
- Frontend integration (React / HTML-CSS-JS)
- Team-based real-time chat enhancements
- Notifications for matches & invitations
- AI-based compatibility improvements
- Role-based access control

---



## 🛠️ Getting Started (Backend)

```bash
git clone https://github.com/your-username/team-forge.git
cd team-forge
npm install
npm run dev


