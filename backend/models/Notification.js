const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {
    // Who receives this notification
    recipient: {
      type: String,
      required: true,
      index: true,
    },
    // Who triggered it
    sender: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "comment", "follow"],
      required: true,
    },
    // Optional reference to the related post
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    postTitle: {
      type: String,
      default: "",
    },
    senderAvatar: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index for fetching a user's unread notifications efficiently
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification;
