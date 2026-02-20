const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary with env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Post image storage ───────────────────────────────────────────────────────
const postStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "noesis/posts",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [
      { width: 1200, height: 800, crop: "limit" }, // Resize large images
      { quality: "auto" },                          // Auto compress
      { fetch_format: "auto" },                     // Serve WebP where supported
    ],
  },
});

// ─── Avatar storage ───────────────────────────────────────────────────────────
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "noesis/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 200, height: 200, crop: "fill", gravity: "face" }, // Square crop
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  if (allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"));
  }
};

// Upload instances
const uploadPost = multer({
  storage: postStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // Avatars: 2MB max
});

/**
 * Delete an image from Cloudinary by its URL.
 * Extracts the public_id from the URL automatically.
 */
async function deleteFromCloudinary(imageUrl) {
  if (!imageUrl) return;
  try {
    // Extract public_id from URL: ".../noesis/posts/abc123.jpg" → "noesis/posts/abc123"
    const parts = imageUrl.split("/");
    const filename = parts[parts.length - 1].split(".")[0];
    const folder = parts[parts.length - 2];
    const parentFolder = parts[parts.length - 3];
    const publicId = `${parentFolder}/${folder}/${filename}`;
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary delete error:", err.message);
  }
}

module.exports = { uploadPost, uploadAvatar, deleteFromCloudinary, cloudinary };
