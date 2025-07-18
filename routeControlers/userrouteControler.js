const User = require("../Models/userModels");
const bcryptjs = require("bcryptjs");
const { jwtToken } = require("../utils/jwtwebToken");
const { OAuth2Client } = require("google-auth-library");

const client=new OAuth2Client(process.env.GOOGLE_ID);

const userRegister = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Debug incoming data

    const { fullname, username, email, gender, password, profilepic } = req.body;

    // Check if username or email already exists
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
      return res.status(400).send({
        success: false,
        message: "Username or Email already exists",
      });
    }

    // Hash password
    const hashedPassword = bcryptjs.hashSync(password, 10);

    // Set profile picture based on gender
    const profileBoy = profilepic || `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const profileGirl = profilepic || `https://avatar.iran.liara.run/public/girl?username=${username}`;

    const newUser = new User({
      fullname,
      username,
      email,
      password: hashedPassword,
      gender,
      profilepic: gender === "male" ? profileBoy : profileGirl,
    });

    console.log("New User Object Before Save:", newUser); // Debug user object

    // Save user to database
    const savedUser = await newUser.save();
    jwtToken(newUser._id, res);
    console.log("Saved User:", savedUser); // Debug saved user

    // Return the newly created user data
    res.status(201).send({
      success: true,
      _id: savedUser._id,
      fullname: savedUser.fullname,
      username: savedUser.username,
      profilepic: savedUser.profilepic,
      email: savedUser.email,
      gender: savedUser.gender,
    });
  } catch (error) {
    console.error("Error during user registration:", error.message);
    res.status(500).send({
      success: false,
      message: "An error occurred while registering the user",
    });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Email does not exist",
      });
    }

    const comparePass = bcryptjs.compareSync(password, user.password || "");
    if (!comparePass) {
      return res.status(400).send({
        success: false,
        message: "Email or password doesn't match",
      });
    }

    const token=jwtToken(user._id, res);

    res.status(200).send({
      success: true,
      token,
      _id: user._id,
      fullname: user.fullname,
      username: user.username,
      profilepic: user.profilepic,
      email: user.email,
      gender: user.gender,
      isAdmin: user.isAdmin,
      message: "Successfully logged in",
    });
  } catch (error) {
    console.error("Error during user login:", error.message);
    res.status(500).send({
      success: false,
      message: "An error occurred while logging in",
    });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "No token provided" });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({ success: false, message: "Invalid Google token" });
    }

    const { sub, name, email, picture } = payload;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with default values for gender and password
      user = new User({
        fullname: name,
        username: email.split("@")[0],
        email,
        profilepic: picture,
        password: "", // No password for Google users
        gender: "Not Provided", // Default value for gender
      });

      await user.save();
    }

    // Generate JWT and set it in a cookie
    jwtToken(user._id, res);

    res.status(200).json({
      success: true,
      _id: user._id,
      fullname: user.fullname,
      username: user.username,
      profilepic: user.profilepic,
      email: user.email,
      gender: user.gender || "Not Provided",
      isAdmin: user.isAdmin,  // Ensure gender is set
      message: "Google login successful",
    });

  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ success: false, message: "Google login failed" });
  }
};

console.log("GOOGLE CLIENT ID:", process.env.GOOGLE_CLIENT_ID);


const userLogout = async (req, res) => {
  try {
    // Clear the JWT cookie
    res.cookie("jwt", "", {
      httpOnly: true, // Ensure the cookie is only accessible by the server
      secure: process.env.NODE_ENV === "production", // Send cookie over HTTPS only in production
      maxAge: 0, // Expire the cookie immediately
    });

    // Send success response
    res.status(200).send({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("Error during user logout:", error.message);

    // Send error response
    res.status(500).send({
      success: false,
      message: "Error during logout. Please try again.",
    });
  }
};


module.exports = { userRegister, userLogin ,userLogout,googleLogin};
