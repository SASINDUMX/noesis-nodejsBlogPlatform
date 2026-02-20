const router = require("express").Router();
const Notification = require("../models/Notification");
const requireAuth = require("../middleware/requireAuth");

// ─── GET /notifications — get current user's notifications ───────────────────
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      recipient: req.session.username,
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    res.json(notifications);
  } catch (err) {
    next(err);
  }
});

// ─── GET /notifications/unread-count ─────────────────────────────────────────
router.get("/unread-count", requireAuth, async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.session.username,
      read: false,
    });
    res.json({ count });
  } catch (err) {
    next(err);
  }
});

// ─── POST /notifications/mark-read — mark all as read ────────────────────────
router.post("/mark-read", requireAuth, async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.session.username, read: false },
      { read: true }
    );
    res.json({ message: "All notifications marked as read." });
  } catch (err) {
    next(err);
  }
});

// ─── POST /notifications/:id/read — mark single notification as read ──────────
router.post("/:id/read", requireAuth, async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.session.username },
      { read: true }
    );
    res.json({ message: "Notification marked as read." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
