# Noesis - Minimalist Blog Platform

Noesis is a sleek, modern blog platform designed for a premium writing and reading experience. Built with a robust Node.js backend and a dynamic React frontend, it features real-time interactions, deep social integration, and a focus on minimalist aesthetics.


## ✨ Features

- **Personal Workspace**: A dedicated dashboard to manage your posts, profile, and account settings.
- **Social Graph**: Follow other creators, build your community, and see who's following you.
- **Real-time Notifications**: Instant updates for follows, likes, and comments powered by Socket.io.
- **Rich Media**: Seamless avatar and post image uploads integrated with Cloudinary.
- **Aesthetic UI**: Carefully curated dark and light modes with smooth transitions and micro-animations.
- **Security**: Robust authentication using JWT and secure sessions, with protection against common web vulnerabilities.

## 🚀 Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Vanilla CSS (Custom Glassmorphism Design System)
- **State Management**: React Hooks
- **Communication**: Axios & Socket.io-client
- **Icons**: Emoji-based for a lightweight, modern feel

### Backend
- **Runtime**: Node.js & Express
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT, BCrypt, & Express-Session
- **Real-time**: Socket.io
- **Media Storage**: Cloudinary (Multer-storage-cloudinary)
- **Security**: Helmet, Rate Limiter, Mongo Sanitize

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Cloudinary Account (for media uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SASINDUMX/noesis-nodejsBlogPlatform.git
   cd noesis-nodejsBlogPlatform
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create a .env file with your credentials
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

### Environment Variables

#### Backend (`/backend/.env`)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_name
CLOUDINARY_KEY=your_key
CLOUDINARY_SECRET=your_secret
```

#### Frontend (`/frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
```

## 📸 Preview

*Coming soon - Experience the premium dark mode and real-time notification engine.*

## 📄 License

This project is licensed under the ISC License.

---
Built with ✨ by [SASINDUMX](https://github.com/SASINDUMX)
