const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");

const bcrypt = require("bcrypt");

router.post("/signup", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPass,
    });

    const user = await newUser.save();
    res.status(200).json({
      message: "Signup successful"
    });

  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).json({ error: "Wrong credentials!" });

    const validated = await bcrypt.compare(req.body.password, user.password);
    if (!validated) return res.status(400).json({ error: "Wrong credentials!" });

    req.session.username = req.body.username;

    res.status(200).json({
      message: "Login successful",
      username: user.username
    });

  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Logged out" });
  });
});


router.get("/delete", async (req, res) => {
  try {
    const username = req.session.username;


    await Post.deleteMany({ username });


    const user = await User.findOneAndDelete({ username });

    if (!user) {
      return res.status(404).send('User not found');
    }


    req.session.destroy();
    res.json({ message: "User deleted" });

  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json(err);
  }
});

module.exports = router;
