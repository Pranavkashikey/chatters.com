const jwt = require("jsonwebtoken");
const User = require("../Models/userModels");

const isLogin = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token from Authorization header:", token);
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
      console.log("Token from Cookie:", token);
    } else {
      console.log("No token found in headers or cookies");
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "User unauthorized - Token not found",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded JWT payload:", decoded);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }
};

module.exports = { isLogin };
