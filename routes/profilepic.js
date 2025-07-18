// routes/pic.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const User = require("../Models/userModels");
const { isLogin } = require('../middleware/isLogin');

// 1. Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profile_pics"); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// 2. Upload route
router.post(
  '/upload-profile-pic',
  isLogin,
  upload.single('profilepic'),
  async (req, res) => {
    console.log('Reached upload-profile-pic route'); 
    try {
      const profilePath = req.file.path;

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { profilepic: profilePath },
        { new: true }
      ).select('-password');

      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error('Error in upload-profile-pic:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

module.exports = router;
