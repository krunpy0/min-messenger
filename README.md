A simple messaging application I built while learning full-stack development as the part of The Odin Project course. This project helped me understand real-time communication, database management, and modern web development practices.

## What I learned

- **Real-time messaging** with Socket.io
- **User authentication** using JWT
- **File uploads** with S3 storage
- **Styling** with Tailwind CSS
- **Database operations** with Prisma ORM
- **State management** in React

## Tech Stack

### Frontend

- React 19 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Socket.io client for real-time communication

### Backend

- Node.js with Express
- Socket.io for WebSocket connections
- Prisma ORM with PostgreSQL
- JWT authentication
- Passport.js for OAuth
- AWS S3 for file storage

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- AWS S3 bucket (for file storage)

### Installation

1. Clone the repository:

```bash
https://github.com/krunpy0/min-messenger.git
cd min-messenger
```

2. Set up environment variables:

   - Create a `.env` file in the backend directory
   - Add your database URL, JWT secret, and AWS credentials:

DATABASE_URL, PORT, JWT_SECRET, YA_ACCESS_KEY,YA_SECRET_KEY
(YA_ACCESS_KEY and YA_SECRET_KEY are S3 bucket credentials.)

3. Install dependencies and run:

**Backend:**

```bash
cd backend
npm install
npm run dev
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Project Structure

```
min-messenger/
├── backend/           # Node.js backend
│   ├── app.js        # Main application file
│   ├── chat.js       # Chat functionality
│   ├── passport.js   # Authentication config
│   ├── prisma/       # Database schema
│   └── router/       # API routes
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   └── public/
└── package.json
```

## API Endpoints

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /api/users` - Get users
- `POST /api/messages` - Send message
- `GET /api/messages/:chatId` - Get chat messages
