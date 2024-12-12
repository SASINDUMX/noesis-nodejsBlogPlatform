
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

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, content } = req.body;
    const username = req.session.username;

    if (!username) {
      return res.status(400).send("User not authenticated");
    }

    const post = new Post({
      title,
      content,
      username,
      image: req.file ? req.file.filename : undefined,
    });

    await post.save();
    res.redirect("/home");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.post("/:id/delete", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    res.redirect("/account");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.get("/:id/update", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    res.render("create", { isUpdate: true, post, username: req.session.username });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.post("/:id/update", upload.single("image"), async (req, res) => {
  try {
    const { title, content, removeImage } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).send("Post not found");
    }

    post.title = title;
    post.content = content;

    if (removeImage === "true" && post.image) {
      const oldImagePath = path.join("uploads", post.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      post.image = undefined;
    }

    if (req.file) {
      if (post.image) {
        const oldImagePath = path.join("uploads", post.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      post.image = req.file.filename;
    }

    await post.save();
    res.redirect("/home");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.post("/:id/comment", async (req, res) => {
  const { content } = req.body;
  const username = req.session.username;

  if (!username) {
    return res.status(400).send("User not authenticated");
  }

  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    post.comments.push({ content, username });
    await post.save();
    res.redirect(`/home`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.post("/:postId/comment/:commentId/delete", async (req, res) => {
  try {
      const { postId, commentId } = req.params;

      const post = await Post.findByIdAndUpdate(
        postId,
        { $pull: { comments: { _id: commentId } } },
        { new: true }
      );

      if (!post) {
          console.log(`Post with ID ${postId} not found`);
          return res.status(404).send("Post not found");
      }

      res.redirect("/home");
  } catch (err) {
      console.error(`Error deleting comment: ${err}`);
      res.status(500).send("Server error");
  }
});


router.post('/:postId/like', async (req, res) => {
  try {
    const postId = req.params.postId;
    const username = req.session.username;

    if (!username) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    const post = await Post.findById(postId);

    if (post) {
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
    } else {
        res.status(404).json({ error: 'Post not found' });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
