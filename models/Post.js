const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema(
  {
    content: { type: String, required: true },
    username: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }
);

const PostSchema = new Schema(
  {
    title: { type: String, required: true,},
    content: { type: String, required: true },
    username: { type: String, required: true },
    image:{type: String, required: false},
	  likes: { type: Number, required: true,default: 0},
    likedBy: { type: [String], default: [] },
    comments: [CommentSchema],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
