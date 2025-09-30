# The Change App - Setup Instructions

## Prerequisites
- Node.js (v16 or higher)
- npm or pnpm

## Quick Start

### 1. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Start the Application
```bash
# Terminal 1: Start backend
npm start

# Terminal 2: Start frontend (in a new terminal)
cd frontend
npm run dev
```

### 3. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### 4. Register as TAObaeus Rushaeus
1. Navigate to http://localhost:5173
2. Register with username: "TAObaeus Rushaeus"
3. Complete the tutorial to earn your first ACent
4. Vote on the founding proposal to earn your second ACent

## Project Structure
- `src/` - Backend source code (Autobase + Express API)
- `frontend/` - React frontend with Tailwind CSS
- `package.json` - Backend dependencies
- `frontend/package.json` - Frontend dependencies

## Features Implemented
✅ Cryptographic identity generation
✅ Tutorial with TAObaeus Rushaeus guide
✅ AI-powered competence verification (dolphin-mistral-7b-v2.8)
✅ Dual token economy (ACents & DCents)
✅ Digital Bill of Rights founding proposal
✅ Geographic scaling system
✅ Complete user onboarding flow

## Troubleshooting
- If ports are in use, restart your terminal or reboot
- If dependencies fail, try: rm -rf node_modules && npm install
- For frontend issues: cd frontend && rm -rf node_modules && npm install
