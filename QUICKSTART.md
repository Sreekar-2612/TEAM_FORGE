# 🚀 Quick Start Guide - CollabQuest

Get CollabQuest running in 5 minutes!

## Step 1: Install Dependencies

### Backend
```bash
cd server
npm install
```

### Frontend
```bash
cd client
npm install
```

## Step 2: Configure Backend

Create `server/.env` file:
```env
MONGO_URI=mongodb://localhost:27017/teamforge
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
```

**For MongoDB Atlas:**
Replace `MONGO_URI` with your Atlas connection string.

## Step 3: Start MongoDB

Make sure MongoDB is running:
- **Local:** Start MongoDB service
- **Atlas:** No setup needed, just use your connection string

## Step 4: Run the Application

### Option A: Run Both Servers (Recommended)

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Option B: Run Separately

You can run backend and frontend independently for testing.

## Step 5: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

## First Steps

1. **Sign Up:** Create a new account at http://localhost:3000/signup
2. **Complete Profile:** Add your skills, interests, and availability
3. **Start Matching:** Go to Dashboard and swipe on potential teammates!
4. **View Matches:** Check your matches in the Matches page

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify `.env` file exists and has correct values
- Check if port 5000 is available

### Frontend won't connect to backend
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify API proxy in `vite.config.js`

### No candidates showing
- Create multiple user accounts
- Make sure users have different IDs
- Check backend logs for errors

## Need Help?

Check the main README.md for detailed documentation.

