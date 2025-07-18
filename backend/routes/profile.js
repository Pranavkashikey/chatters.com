const express = require("express");
const User = require("../Models/userModels"); // Ensure correct path
const { isLogin } = require("../middleware/isLogin.js"); // Ensure correct path
const router = express.Router();

// Route to get profile data for the logged-in user
router.get("/", isLogin, async (req, res) => {
  try {
    console.log("Fetching user profile...");

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(req.user._id).select("-password"); // Exclude password field

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
