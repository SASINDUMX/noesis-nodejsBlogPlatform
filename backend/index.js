require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const { initSocket } = require("./socketManager");
const authRoute = require("./routes/authRoute");
const pubRoute = require("./routes/pubRoute");
const profileRoute = require("./routes/profileRoute");
const notificationRoute = require("./routes/notificationRoute");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

// ─── HTTP server (needed for Socket.io) ──────────────────────────────────────
const httpServer = http.createServer(app);

// ─── Socket.io ───────────────────────────────────────────────────────────────
initSocket(httpServer);

// ─── Ensure uploads dir exists (fallback for local dev without Cloudinary) ───
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// ─── Static files ─────────────────────────────────────────────────────────────
app.use(express.static("public"));
app.use("/uploads", express.static(uploadsDir));

// ─── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Sessions ─────────────────────────────────────────────────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 7 * 24 * 60 * 60,
      touchAfter: 24 * 3600,
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

// ─── Global rate limiter ──────────────────────────────────────────────────────
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  })
);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/auth", authRoute);
app.use("/pub", pubRoute);
app.use("/profile", profileRoute);
app.use("/notifications", notificationRoute);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
  res.status(dbState === 1 ? 200 : 503).json({
    status: dbState === 1 ? "ok" : "degraded",
    database: states[dbState] || "unknown",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => res.json({ message: "Noesis API is running" }));

app.use((req, res) => res.status(404).json({ error: "Route not found" }));
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    // Use httpServer.listen (not app.listen) so Socket.io works
    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
