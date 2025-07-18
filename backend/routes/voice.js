const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Message = require("../Models/messageSchema");
const User = require("../Models/userModels");
const { isLogin } = require("../middleware/isLogin");

// Ensure upload folder exists
const voiceUploadDir = path.join(__dirname, "./uploads/voice");
fs.mkdirSync(voiceUploadDir, { recursive: true });

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, voiceUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".webm";
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

// 🎤 Route: Send voice message
router.post("/sendVoice/:receiverId", isLogin, upload.single("voice"), async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user._id; // from isLogin middleware

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No voice file uploaded" });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      type: "voice",
      voiceUrl: `uploads/voice/${req.file.filename}`,
    });

    await newMessage.save();

    // Emit real-time event if using socket.io
    req.app.get("io")?.to(receiverId)?.emit("newMessage", newMessage);

    res.status(201).json({ success: true, message: "Voice message sent", data: newMessage });
  } catch (error) {
    console.error("Error sending voice message:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
