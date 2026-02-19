
const router = require("express").Router();
const Post = require("../models/Post");

const multer = require('multer');
const path = require('path');
const fs = require('fs');



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);

  if (extname && mimeType) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/", async (req, res) => {
  const posts = await Post.find().sort({ updatedAt: -1 });
  res.json(posts);
});

router.get("/search", async (req, res) => {
  const searchQuery = req.query.q || "";
  const posts = await Post.find({ title: { $regex: searchQuery, $options: "i" } });
  res.json(posts);
});

router.get("/user", async (req, res) => {
  try {
    const username = req.session.username;
    if (!username) return res.status(401).json({ error: "Not authenticated" });

    const posts = await Post.find({ username }).sort({ updatedAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});


router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, content } = req.body;
    const username = req.session.username;

    if (!username) return res.status(401).json({ error: "Not authenticated" });

    const post = new Post({
      title,
      content,
      username,
      image: req.file ? req.file.filename : undefined,
    });

    await post.save();
    res.status(201).json({ message: "Post created", post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});


router.post("/:id/delete", async (req, res) => {
  try {
    const username = req.session.username;
    if (!username) return res.status(401).json({ error: "Not authenticated" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.username !== username) {
      return res.status(403).json({ error: "Unauthorized: You can only delete your own posts" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted", postId: post._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});



router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json({ post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});


router.post("/:id/update", upload.single("image"), async (req, res) => {
  try {
    const username = req.session.username;
    if (!username) return res.status(401).json({ error: "Not authenticated" });

    const { title, content, removeImage } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.username !== username) {
      return res.status(403).json({ error: "Unauthorized: You can only update your own posts" });
    }

    post.title = title;
    post.content = content;

    if (removeImage === "true" && post.image) {
      const oldImagePath = path.join("uploads", post.image);
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      post.image = undefined;
    }

    if (req.file) {
      if (post.image) {
        const oldImagePath = path.join("uploads", post.image);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      post.image = req.file.filename;
    }

    await post.save();
    res.json({ message: "Post updated", post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});



router.post("/:id/comment", async (req, res) => {
  try {
    const { content } = req.body;
    const username = req.session.username;
    if (!username) return res.status(401).json({ error: "Not authenticated" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.comments.push({ content, username });
    await post.save();

    res.json({ message: "Comment added", comments: post.comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// GET all comments for a post
router.get("/:id/comments", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    res.json(post.comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});


router.post("/:postId/comment/:commentId/delete", async (req, res) => {
  try {
    const username = req.session.username;
    if (!username) return res.status(401).json({ error: "Not authenticated" });

    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    // Only comment author OR post author can delete the comment
    if (comment.username !== username && post.username !== username) {
      return res.status(403).json({ error: "Unauthorized: You can only delete your own comments" });
    }

    post.comments.pull({ _id: commentId });
    await post.save();

    res.json({ message: "Comment deleted", comments: post.comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});




router.post('/:postId/like', async (req, res) => {
  try {
    const postId = req.params.postId;
    const username = req.session.username;
    if (!username) return res.status(401).json({ error: 'Not authenticated' });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const hasLiked = post.likedBy.includes(username);
    if (hasLiked) {
      post.likes -= 1;
      post.likedBy = post.likedBy.filter(user => user !== username);
    } else {
      post.likes += 1;
      post.likedBy.push(username);
    }

    await post.save();
    res.json({ likes: post.likes, liked: !hasLiked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});



module.exports = router;
