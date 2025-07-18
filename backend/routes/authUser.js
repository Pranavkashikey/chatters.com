const express = require("express");
const { userRegister,userLogin,userLogout, googleLogin } = require("../routeControlers/userrouteControler");

console.log("userRegister function:", userRegister); // Debug log to check import

const router = express.Router();

router.post("/register", userRegister);
router.post("/login",userLogin);
router.post("/logout",userLogout);
router.post("/google",googleLogin);

// Example for Google OAuth callback route in backend
router.get("/google/callback", (req, res) => {
    // Handle Google OAuth callback logic
    res.send("Google OAuth Callback Handler");
  });
  

module.exports = router;
