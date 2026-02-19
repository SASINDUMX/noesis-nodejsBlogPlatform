 Noesis Node.js Blog Platform

Noesis is a full-stack blog platform built with **Node.js**, **Express**, **MongoDB**, and **React**. 
It allows users to create, read, update, and delete posts, upload images, and comment on posts. 
The project is designed for learning modern web development practices including REST APIs, React hooks, and responsive design.
---

## 🚀 Features

- **User-Friendly Interface** with a modern topbar and responsive design.
- **CRUD Operations**: Create, Read, Update, and Delete posts.
- **Image Upload** support for blog posts.
- **Comments**: Users can comment on each post.
- **Authentication** (optional for delete/update restrictions).
- **Responsive Layout**: Works on desktop and mobile devices.
- **Search and Filter** functionality (if implemented).


## ⚡ Technologies Used

- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Frontend:** React, Axios, CSS
- **File Uploads:** Multer (for image uploads)
- **Styling:** CSS, responsive layout, flexbox
- **Version Control:** Git & GitHub


##📌 Future Improvements

- **Add search & filter posts.
- **Deploy to Vercel/Heroku.
- **Security improvements


## 💻 Installation

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/noesis-nodejsBlogPlatform.git
cd noesis-nodejsBlogPlatform

2. Setup Backend

cd backend
npm install

Create a .env file with your MongoDB connection string:
MONGO_URI=<your_mongodb_connection_string>
PORT=5000

npm start

3. Setup Frontend

cd ../frontend
npm install
npm start

The React app will run on http://localhost:5173 (if using Vite) or http://localhost:3000 (if using CRA).
Backend API runs on http://localhost:5000
