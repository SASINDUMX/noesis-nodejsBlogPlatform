const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require('express-session');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Post = require('./models/Post');



const app = express();

app.use(express.static("public"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'yourSecretKey', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
  }));

const authRoute = require('./routes/authRoute');
const pubRoute = require('./routes/pubRoute');

app.use("/auth", authRoute);
app.use("/pub", pubRoute);




app.get("/", (req, res) => {
    res.render('login');
});

app.get("/signup", (req, res) => {
    res.render('signup');
});

app.get('/home', async (req, res) => {
    try {
      const posts = await Post.find().sort({ updatedAt: -1 }).populate('comments');
      res.render('home', { username: req.session.username, posts });
    } catch (err) {
      console.error('Error fetching posts:', err);
      res.status(500).send('Internal Server Error');
    }
  });
  

app.get('/create', async (req, res) => {
    try {
        res.render('create', { isUpdate: false, post: {}, username: req.session.username });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
app.get('/search', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/');
    }
    res.render('search', { posts: [] }); 
});

app.get('/account', async (req, res) => {
    try {
      const posts = await Post.find().sort({ updatedAt: -1 });
      res.render('account', {username: req.session.username , posts});
    } catch (err) {
      console.error('Error fetching posts:', err);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/search', (req, res) => {
    res.render('search', { posts: [] });
});

app.post('/search', async (req, res) => {
    const searchQuery = req.body.search;
    try {
        const posts = await Post.find({ title: { $regex: searchQuery, $options: 'i' } });
        res.render('search', { posts });
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).json(err);
    }
});

const port = 5000;
app.listen(port, () => {
    console.log("Backend is running on port", port);
});

mongoose.connect('mongodb://localhost:27017/Blog').then(() => {
    console.log('MongoDB Connected');
}).catch((error) => {
    console.log(error);
});
