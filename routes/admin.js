const express = require("express");
const router = express.Router();
const User = require("../Models/userModels");
const Message = require("../Models/messageSchema");
const Report = require("../Models/reportModel");
const { isLogin } = require("../middleware/isLogin");
const { isAdmin } = require("../middleware/isAdmin");

// Get dashboard stats
router.get("/stats", isLogin, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const distinctChats = await Message.distinct("conversationId");
    const totalChats = distinctChats.length;
    const activeUsers = await User.countDocuments({ isOnline: true });

    res.json({ totalUsers, totalChats, activeUsers });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ message: "Failed to get stats" });
  }
});

// Block / Unblock User
router.put("/user/:userId", isLogin,isAdmin, async (req, res) => {
  const { action } = req.body;
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (action === "block") {
      user.isBlocked = true;
    } else if (action === "activate") {
      user.isBlocked = false;
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await user.save();
    res.status(200).json({ message: `User ${action}ed successfully.` });
  } catch (error) {
    console.error("Block/Unblock Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// Get reports
router.get("/reports", isLogin, isAdmin, async (req, res) => {
  try {
    const reports = await Report.find().populate("reportedBy reportedUser", "username fullname profilepic");
    res.json({ reports });
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ message: "Error fetching reports" });
  }
});


router.get("/user/all",isLogin, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // exclude password field
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
