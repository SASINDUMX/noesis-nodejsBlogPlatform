const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require('express-session');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Post = require('./models/Post');
const cors = require("cors");


const app = express();


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


app.use(express.static("public"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


//app.set('view engine', 'ejs');
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
  res.json({ message: "API is running" });
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
