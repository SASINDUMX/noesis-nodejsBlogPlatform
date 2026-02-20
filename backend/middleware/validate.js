/**
 * Lightweight input validation helpers.
 * Returns a 400 response if validation fails, otherwise calls next().
 */

function validateSignup(req, res, next) {
  const { username, email, password } = req.body;
  const errors = [];

  if (!username || typeof username !== "string") {
    errors.push("Username is required.");
  } else if (username.trim().length < 3) {
    errors.push("Username must be at least 3 characters.");
  } else if (username.trim().length > 30) {
    errors.push("Username must be 30 characters or fewer.");
  } else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
    errors.push("Username may only contain letters, numbers, and underscores.");
  }

  if (!email || typeof email !== "string") {
    errors.push("Email is required.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push("A valid email address is required.");
  } else if (email.trim().length > 254) {
    errors.push("Email is too long.");
  }

  if (!password || typeof password !== "string") {
    errors.push("Password is required.");
  } else if (password.length < 6) {
    errors.push("Password must be at least 6 characters.");
  } else if (password.length > 128) {
    errors.push("Password must be 128 characters or fewer.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(" ") });
  }

  // Sanitise — trim string fields before they hit the DB
  req.body.username = username.trim();
  req.body.email = email.trim().toLowerCase();

  next();
}

function validateLogin(req, res, next) {
  const { username, password } = req.body;
  const errors = [];

  if (!username || typeof username !== "string" || !username.trim()) {
    errors.push("Username is required.");
  }
  if (!password || typeof password !== "string" || !password.trim()) {
    errors.push("Password is required.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(" ") });
  }

  req.body.username = username.trim();
  next();
}

function validatePost(req, res, next) {
  const { title, content } = req.body;
  const errors = [];

  if (!title || typeof title !== "string" || !title.trim()) {
    errors.push("Title is required.");
  } else if (title.trim().length > 200) {
    errors.push("Title must be 200 characters or fewer.");
  }

  if (!content || typeof content !== "string" || !content.trim()) {
    errors.push("Content is required.");
  } else if (content.trim().length > 50000) {
    errors.push("Content must be 50,000 characters or fewer.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(" ") });
  }

  req.body.title = title.trim();
  req.body.content = content.trim();

  next();
}

function validateComment(req, res, next) {
  const { content } = req.body;

  if (!content || typeof content !== "string" || !content.trim()) {
    return res.status(400).json({ error: "Comment content is required." });
  }
  if (content.trim().length > 500) {
    return res.status(400).json({ error: "Comment must be 500 characters or fewer." });
  }

  req.body.content = content.trim();
  next();
}

module.exports = { validateSignup, validateLogin, validatePost, validateComment };
