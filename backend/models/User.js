const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    password: {
      type: String,
      required: true,
    },
    // ─── Profile fields ──────────────────────────────────────────────────────
    bio: {
      type: String,
      default: "",
      maxlength: 300,
      trim: true,
    },
    avatar: {
      type: String,        // Cloudinary URL
      default: "",
    },
    // ─── Social graph ────────────────────────────────────────────────────────
    followers: {
      type: [String],      // array of usernames who follow this user
      default: [],
    },
    following: {
      type: [String],      // array of usernames this user follows
      default: [],
    },
  },
  { timestamps: true }
);

// Indexes for social graph lookups
UserSchema.index({ followers: 1 });
UserSchema.index({ following: 1 });

const User = mongoose.model("User", UserSchema);
module.exports = User;
