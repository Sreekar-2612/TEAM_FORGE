# CollabQuest Frontend

Modern React frontend for CollabQuest - Smart Team Finder for Students.

## Features

- 🔐 Authentication (Login/Signup)
- 👤 Profile Management
- 💫 Swipe-style Matching Interface
- 🤝 Matches View
- 💬 Chat Interface (Coming Soon)
- 🎨 Beautiful, Modern UI

## Tech Stack

- **React 18** - UI Library
- **React Router** - Navigation
- **Vite** - Build Tool
- **Axios** - HTTP Client

## Getting Started

### Install Dependencies

```bash
cd client
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Project Structure

```
client/
├── src/
│   ├── components/     # Reusable components
│   ├── context/        # React Context (Auth)
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── App.jsx        # Main app component
│   └── main.jsx       # Entry point
├── index.html
└── package.json
```

## API Configuration

The frontend is configured to proxy API requests to `http://localhost:5000/api` by default.

To change the API URL, create a `.env` file:

```env
VITE_API_URL=http://your-api-url/api
```

## Features in Detail

### Authentication
- Secure login/signup
- JWT token management
- Protected routes

### Swipe Matching
- Tinder-style card interface
- Compatibility scoring
- Real-time match notifications
- Touch/swipe support

### Profile Management
- Edit bio, skills, interests
- Set availability
- Dynamic tag management

