const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const requireAuth = require("../middleware/requireAuth");
const { uploadAvatar, deleteFromCloudinary } = require("../middleware/cloudinaryUpload");
const { pushNotification } = require("../socketManager");

// ─── GET /profile/:username — public profile ──────────────────────────────────
router.get("/:username", async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username })
      .select("-password -email")
      .lean();

    if (!user) return res.status(404).json({ error: "User not found." });

    const posts = await Post.find({ username })
      .sort({ createdAt: -1 })
      .select("-likedBy")
      .lean();

    const currentUser = req.session?.username;
    const isFollowing = currentUser
      ? user.followers.includes(currentUser)
      : false;
    const isOwnProfile = currentUser === username;

    res.json({
      user: {
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
        followerCount: user.followers.length,
        followingCount: user.following.length,
        isFollowing,
        isOwnProfile,
        createdAt: user.createdAt,
      },
      posts,
    });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /profile/me — update own profile (bio) ───────────────────────────────
router.put("/me", requireAuth, async (req, res, next) => {
  try {
    const { bio } = req.body;
    const { username } = req.session;

    if (bio !== undefined && typeof bio === "string" && bio.length > 300) {
      return res.status(400).json({ error: "Bio must be 300 characters or fewer." });
    }

    const user = await User.findOneAndUpdate(
      { username },
      { bio: bio?.trim() ?? "" },
      { new: true, select: "-password -email" }
    );

    res.json({ message: "Profile updated.", user });
  } catch (err) {
    next(err);
  }
});

// ─── POST /profile/me/avatar — upload avatar ──────────────────────────────────
router.post(
  "/me/avatar",
  requireAuth,
  uploadAvatar.single("avatar"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided." });
      }

      const { username } = req.session;
      const user = await User.findOne({ username });

      // Delete old avatar from Cloudinary
      if (user.avatar) await deleteFromCloudinary(user.avatar);

      user.avatar = req.file.path; // Cloudinary URL
      await user.save();

      res.json({ message: "Avatar updated.", avatar: user.avatar });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /profile/:username/follow — follow or unfollow ─────────────────────
router.post("/:username/follow", requireAuth, async (req, res, next) => {
  try {
    const targetUsername = req.params.username;
    const { username: currentUsername } = req.session;

    if (targetUsername === currentUsername) {
      return res.status(400).json({ error: "You cannot follow yourself." });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findOne({ username: currentUsername }),
      User.findOne({ username: targetUsername }),
    ]);

    if (!targetUser) return res.status(404).json({ error: "User not found." });

    const isFollowing = currentUser.following.includes(targetUsername);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter((u) => u !== targetUsername);
      targetUser.followers = targetUser.followers.filter((u) => u !== currentUsername);
    } else {
      // Follow
      currentUser.following.push(targetUsername);
      targetUser.followers.push(currentUsername);

      // Create notification
      const notification = await Notification.create({
        recipient: targetUsername,
        sender: currentUsername,
        type: "follow",
      });

      // Push real-time notification if target is online
      pushNotification(targetUsername, {
        _id: notification._id,
        type: "follow",
        sender: currentUsername,
        message: `${currentUsername} started following you.`,
        createdAt: notification.createdAt,
        read: false,
      });
    }

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({
      following: !isFollowing,
      followerCount: targetUser.followers.length,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
