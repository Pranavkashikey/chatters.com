// server/routes/reportRoute.js
const express = require("express");
const router = express.Router();
const Report = require("../Models/reportModel");

// POST /api/re/rep
router.post("/rep", async (req, res) => {
  try {
    const { reportedUser, reason } = req.body;
    const reportedBy = req.user?._id || req.body.reportedBy; // Adjust this based on auth

    if (!reportedUser || !reason || !reportedBy) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const report = new Report({
      reportedBy,
      reportedUser,
      reason,
    });

    await report.save();

    res.status(201).json({ success: true, message: "Report submitted" });
  } catch (error) {
    console.error("Report Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
