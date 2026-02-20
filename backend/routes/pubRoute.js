const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const Post = require("../models/Post");
const requireAuth = require("../middleware/requireAuth");
const upload = require("../middleware/upload");
const { validatePost, validateComment } = require("../middleware/validate");

// ─── Helper: safely delete an uploaded file ──────────────────────────────────
function deleteFile(filename) {
  if (!filename) return;
  const filePath = path.join(__dirname, "..", "uploads", filename);
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error("Failed to delete file:", filePath, err.message);
    });
  }
}

// ─── GET /pub — all posts ─────────────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .select("-likedBy") // Don't expose who liked what to everyone
      .lean();
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// ─── GET /pub/search ─────────────────────────────────────────────────────────
router.get("/search", async (req, res, next) => {
  try {
    const query = req.query.q?.trim() || "";
    if (!query) return res.json([]);

    // Limit query length to prevent regex DoS
    if (query.length > 100) {
      return res.status(400).json({ error: "Search query too long." });
    }

    // Escape special regex characters from user input
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const posts = await Post.find({
      title: { $regex: escaped, $options: "i" },
    })
      .select("-likedBy")
      .lean();

    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// ─── GET /pub/user — current user's posts ────────────────────────────────────
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
  upload.single("image"),
  validatePost,
  async (req, res, next) => {
    try {
      const { title, content } = req.body;

      const post = new Post({
        title,
        content,
        username: req.session.username,
        image: req.file ? req.file.filename : undefined,
      });

      await post.save();
      res.status(201).json({ message: "Post created", post });
    } catch (err) {
      // If DB save fails, clean up the uploaded file so we don't orphan it
      if (req.file) deleteFile(req.file.filename);
      next(err);
    }
  }
);

// ─── GET /pub/:id — single post ───────────────────────────────────────────────
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
  upload.single("image"),
  validatePost,
  async (req, res, next) => {
    try {
      const { title, content, removeImage } = req.body;
      const post = await Post.findById(req.params.id);

      if (!post) {
        if (req.file) deleteFile(req.file.filename);
        return res.status(404).json({ error: "Post not found." });
      }

      if (post.username !== req.session.username) {
        if (req.file) deleteFile(req.file.filename);
        return res.status(403).json({ error: "You can only edit your own posts." });
      }

      post.title = title;
      post.content = content;

      if (removeImage === "true" && post.image) {
        deleteFile(post.image);
        post.image = undefined;
      }

      if (req.file) {
        // Remove old image before saving new one
        if (post.image) deleteFile(post.image);
        post.image = req.file.filename;
      }

      await post.save();
      res.json({ message: "Post updated", post });
    } catch (err) {
      if (req.file) deleteFile(req.file.filename);
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

    // Clean up image file from disk
    if (post.image) deleteFile(post.image);

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
      post.likes = Math.max(0, post.likes - 1); // Never go below 0
      post.likedBy = post.likedBy.filter((u) => u !== username);
    } else {
      post.likes += 1;
      post.likedBy.push(username);
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

    const comment = { content: req.body.content, username: req.session.username };
    post.comments.push(comment);
    await post.save();

    // Return the newly added comment (last item in the array)
    const savedComment = post.comments[post.comments.length - 1];
    res.json({ message: "Comment added", comment: savedComment, username: req.session.username });
  } catch (err) {
    next(err);
  }
});

// ─── POST /pub/:postId/comment/:commentId/delete ─────────────────────────────
router.post("/:postId/comment/:commentId/delete", requireAuth, async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const { username } = req.session;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found." });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found." });

    const isCommentOwner = comment.username === username;
    const isPostOwner = post.username === username;

    if (!isCommentOwner && !isPostOwner) {
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
