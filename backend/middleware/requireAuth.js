/**
 * Middleware that blocks unauthenticated requests.
 * Apply to any route that requires a logged-in user.
 *
 * Usage:
 *   const requireAuth = require("../middleware/requireAuth");
 *   router.get("/protected", requireAuth, handler);
 */
function requireAuth(req, res, next) {
  if (!req.session?.username) {
    return res.status(401).json({ error: "Not authenticated. Please log in." });
  }
  next();
}

module.exports = requireAuth;
