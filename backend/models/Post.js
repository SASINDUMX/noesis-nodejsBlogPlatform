const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  content: { type: String, required: true, maxlength: 500 },
  username: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const PostSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50000,
    },
    username: {
      type: String,
      required: true,
      index: true, // Speeds up /pub/user queries
    },
    image: {
      type: String,
      required: false,
    },
    likes: {
      type: Number,
      required: true,
      default: 0,
      min: 0, // Database-level floor — likes can never be negative
    },
    likedBy: {
      type: [String],
      default: [],
    },
    comments: [CommentSchema],
  },
  { timestamps: true }
);


PostSchema.index({ title: "text" });

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
