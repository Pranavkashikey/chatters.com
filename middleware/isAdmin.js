const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user info" });
    }

    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden: Admins only" });
    }

    next();
  } catch (error) {
    console.error("Error in isAdmin middleware:", error);
    res.status(500).json({ success: false, message: "Server error in admin check" });
  }
};

module.exports = { isAdmin };
