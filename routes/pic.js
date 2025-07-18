const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { isLogin } = require("../middleware/isLogin");
const User = require("../Models/userModels");

// Ensure upload folder exists
const uploadDir = path.join(__dirname, "../uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.post(
  "/upload-pic",
  isLogin,
  upload.single("profilepic"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }

      const relativePath = "uploads/" + req.file.filename;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { profilepic: relativePath },
        { new: true }
      ).select("-password");

      res.json({ success: true, user });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }
);

module.exports = router;
