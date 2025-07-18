const express = require("express");
const router = express.Router();
const upload = require("../middleware/voice"); // import multer
const { isLogin } = require("../middleware/isLogin");
const {
  sendMessage,
  getMessages,
  markAsSeen,
  editMessage,
  deleteMessage
} = require("../routeControlers/messagerouteControler");

// Use multer only on POST send route

router.get("/:id", isLogin, getMessages);
router.post("/send/:id",isLogin,sendMessage);
router.put("/seen/:id", isLogin, markAsSeen);
router.put("/edit/:id", isLogin, editMessage);
router.delete("/delete/:id", isLogin, deleteMessage);

module.exports = router;
