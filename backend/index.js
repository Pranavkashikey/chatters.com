const express = require("express");
const dotenv = require("dotenv");
const dbconnect = require("./DB/dbconnect");
const authRouter = require("./routes/authUser");
const messageRouter=require("./routes/messageRoute");
const profileRouter = require("./routes/profile.js")
const cookieParser = require("cookie-parser");
const userRouter =require("./routes/userRoute");
const cors = require("cors");
const GeminiRoutes=require("./routes/ai.js");

const Pic=require("./routes/pic.js");
const Admin=require("./routes/admin.js");
const Report=require("./routes/report.js");



const path = require("path");




const {app,server}=require('./Socket/socket.js');

// Load environment variables
dotenv.config();

// Middleware
app.use(express.json());

app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Routes
app.use('/api/auth', authRouter);

app.use('/api/message', messageRouter);

app.use('/api/user', userRouter);

app.use("/api/profile",profileRouter );

app.use("/api/v1",GeminiRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/pic", Pic);
app.use("/api/admin",Admin);
app.use("/api/re",Report);










// Define a test route
app.get("/", (req, res) => {
  res.send("It is working");
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  try {
    // Wait for database connection
     dbconnect();
    console.log("Connected to the database");
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  }
});
