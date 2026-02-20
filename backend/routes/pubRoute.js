const router = require("express").Router();
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const requireAuth = require("../middleware/requireAuth");
const { uploadPost, deleteFromCloudinary } = require("../middleware/cloudinaryUpload");
const { validatePost, validateComment } = require("../middleware/validate");
const { pushNotification } = require("../socketManager");

// ─── GET /pub ─────────────────────────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .select("-likedBy")
      .lean();
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// ─── GET /pub/search ──────────────────────────────────────────────────────────
router.get("/search", async (req, res, next) => {
  try {
    const query = req.query.q?.trim() || "";
    if (!query) return res.json([]);
    if (query.length > 100) {
      return res.status(400).json({ error: "Search query too long." });
    }
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const posts = await Post.find({ title: { $regex: escaped, $options: "i" } })
      .select("-likedBy")
      .lean();
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// ─── GET /pub/user ────────────────────────────────────────────────────────────
router.get("/user", requireAuth, async (req, res, next) => {
  try {
    const posts = await Post.find({ username: req.session.username })
      .sort({ createdAt: -1 })
      .lean();
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// ─── POST /pub — create post ──────────────────────────────────────────────────
router.post(
  "/",
  requireAuth,
  uploadPost.single("image"),
  validatePost,
  async (req, res, next) => {
    try {
      const post = new Post({
        title: req.body.title,
        content: req.body.content,
        username: req.session.username,
        image: req.file ? req.file.path : undefined, // Cloudinary URL
      });
      await post.save();
      res.status(201).json({ message: "Post created", post });
    } catch (err) {
      if (req.file) await deleteFromCloudinary(req.file.path);
      next(err);
    }
  }
);

// ─── GET /pub/:id ─────────────────────────────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) return res.status(404).json({ error: "Post not found." });
    res.json({ post });
  } catch (err) {
    next(err);
  }
});

// ─── POST /pub/:id/update ─────────────────────────────────────────────────────
router.post(
  "/:id/update",
  requireAuth,
  uploadPost.single("image"),
  validatePost,
  async (req, res, next) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        if (req.file) await deleteFromCloudinary(req.file.path);
        return res.status(404).json({ error: "Post not found." });
      }
      if (post.username !== req.session.username) {
        if (req.file) await deleteFromCloudinary(req.file.path);
        return res.status(403).json({ error: "You can only edit your own posts." });
      }

      post.title = req.body.title;
      post.content = req.body.content;

      if (req.body.removeImage === "true" && post.image) {
        await deleteFromCloudinary(post.image);
        post.image = undefined;
      }

      if (req.file) {
        if (post.image) await deleteFromCloudinary(post.image);
        post.image = req.file.path;
      }

      await post.save();
      res.json({ message: "Post updated", post });
    } catch (err) {
      if (req.file) await deleteFromCloudinary(req.file.path);
      next(err);
    }
  }
);

// ─── POST /pub/:id/delete ─────────────────────────────────────────────────────
router.post("/:id/delete", requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found." });
    if (post.username !== req.session.username) {
      return res.status(403).json({ error: "You can only delete your own posts." });
    }
    if (post.image) await deleteFromCloudinary(post.image);
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted", postId: post._id });
  } catch (err) {
    next(err);
  }
});

// ─── POST /pub/:id/like ───────────────────────────────────────────────────────
router.post("/:id/like", requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found." });

    const { username } = req.session;
    const hasLiked = post.likedBy.includes(username);

    if (hasLiked) {
      post.likes = Math.max(0, post.likes - 1);
      post.likedBy = post.likedBy.filter((u) => u !== username);
    } else {
      post.likes += 1;
      post.likedBy.push(username);

      // Notify post owner (not if they liked their own post)
      if (post.username !== username) {
        const notification = await Notification.create({
          recipient: post.username,
          sender: username,
          type: "like",
          postId: post._id,
          postTitle: post.title,
        });
        pushNotification(post.username, {
          _id: notification._id,
          type: "like",
          sender: username,
          postTitle: post.title,
          postId: post._id,
          message: `${username} liked your post "${post.title}".`,
          createdAt: notification.createdAt,
          read: false,
        });
      }
    }

    await post.save();
    res.json({ likes: post.likes, liked: !hasLiked });
  } catch (err) {
    next(err);
  }
});

// ─── GET /pub/:id/comments ───────────────────────────────────────────────────
router.get("/:id/comments", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).select("comments").lean();
    if (!post) return res.status(404).json({ error: "Post not found." });
    res.json(post.comments);
  } catch (err) {
    next(err);
  }
});

// ─── POST /pub/:id/comment ───────────────────────────────────────────────────
router.post("/:id/comment", requireAuth, validateComment, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found." });

    const { username } = req.session;
    post.comments.push({ content: req.body.content, username });
    await post.save();

    const savedComment = post.comments[post.comments.length - 1];

    // Notify post owner (not if they comment on their own post)
    if (post.username !== username) {
      const notification = await Notification.create({
        recipient: post.username,
        sender: username,
        type: "comment",
        postId: post._id,
        postTitle: post.title,
      });
      pushNotification(post.username, {
        _id: notification._id,
        type: "comment",
        sender: username,
        postTitle: post.title,
        postId: post._id,
        message: `${username} commented on your post "${post.title}".`,
        createdAt: notification.createdAt,
        read: false,
      });
    }

    res.json({ message: "Comment added", comment: savedComment, username });
  } catch (err) {
    next(err);
  }
});

// ─── POST /pub/:postId/comment/:commentId/delete ──────────────────────────────
router.post("/:postId/comment/:commentId/delete", requireAuth, async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const { username } = req.session;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found." });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found." });

    if (comment.username !== username && post.username !== username) {
      return res.status(403).json({ error: "You can only delete your own comments." });
    }

    post.comments.pull({ _id: commentId });
    await post.save();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
