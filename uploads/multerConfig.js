// news99-backend/uploads/multerConfig.js
const multer = require("multer");
const path = require("path");

// Configure storage settings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save files in the "uploads" folder
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: function (req, file, cb) {
    // Generate a unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

// Updated allowed MIME types to include more common video formats
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/mpeg",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// File filter function
const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(
      new Error(
        "Invalid file type. Only images, MP4/WebM/MPEG videos, PDF, DOC, and DOCX are allowed."
      ),
      false
    );
  }
};

// Create the Multer instance with a 10GB limit
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 * 1024 }, // 10GB limit
  fileFilter,
});

module.exports = upload;
