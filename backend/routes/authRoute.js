const router = require("express").Router();
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const Post = require("../models/Post");
const requireAuth = require("../middleware/requireAuth");
const { validateSignup, validateLogin } = require("../middleware/validate");

// ─── Auth-specific rate limiter ───────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please wait 15 minutes and try again." },
});

// ─── POST /auth/signup ───────────────────────────────────────────────────────
router.post("/signup", authLimiter, validateSignup, async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check for existing user before hashing (cheaper early exit)
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      const field = existingUser.username === username ? "Username" : "Email";
      return res.status(409).json({ error: `${field} is already taken.` });
    }

    const salt = await bcrypt.genSalt(12); // 12 rounds — stronger than default 10
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // Auto-login after signup
    req.session.username = username;

    res.status(201).json({ message: "Signup successful", username });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/login ────────────────────────────────────────────────────────
router.post("/login", authLimiter, validateLogin, async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    // Always run bcrypt even if user not found to prevent timing attacks
    const dummyHash = "$2b$12$invalidhashfortimingnormalization00000000000000000000000";
    const isValid = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, dummyHash).then(() => false);

    if (!user || !isValid) {
      return res.status(400).json({ error: "Wrong credentials. Please try again." });
    }

    // Regenerate session on login to prevent session fixation attacks
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.username = username;
      res.status(200).json({ message: "Login successful", username });
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /auth/logout ────────────────────────────────────────────────────────
router.get("/logout", requireAuth, (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

// ─── DELETE /auth/me — delete own account ────────────────────────────────────
// Changed from GET /auth/delete — GET should never be destructive
router.delete("/me", requireAuth, async (req, res, next) => {
  try {
    const { username } = req.session;

    await Post.deleteMany({ username });
    const user = await User.findOneAndDelete({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie("connect.sid");
      res.json({ message: "Account deleted successfully." });
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /auth/me — get current session user ─────────────────────────────────
// Useful for the frontend to verify session is still alive on page load
router.get("/me", (req, res) => {
  if (!req.session?.username) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  res.json({ username: req.session.username });
});

module.exports = router;
