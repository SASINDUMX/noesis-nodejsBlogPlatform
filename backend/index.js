const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require("cors");
require('dotenv').config();

const app = express();

// 1. Security Headers
app.use(helmet());

// 2. Rate Limiting (Prevent Brute Force)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/auth/", limiter);

// 3. CORS Configuration
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// 4. Data Sanitization & Body Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize());
app.use(cookieParser());

app.use(express.static("public"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoute = require('./routes/authRoute');
const pubRoute = require('./routes/pubRoute');

app.use("/auth", authRoute);
app.use("/pub", pubRoute);

app.get("/", (req, res) => {
  res.json({ message: "Noesis API is running securely" });
});

// 5. Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development' ? message : 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log("Backend is running on port", port);
});

mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('MongoDB Connected Successfully');
}).catch((error) => {
  console.log("MongoDB Connection Error:", error);
});
