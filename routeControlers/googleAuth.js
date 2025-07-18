import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_CONNECT, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  googleId: String,
  name: String,
  email: String,
  picture: String
});
const User = mongoose.model('User', userSchema);

// Google Auth Route
app.post('/auth/google', async (req, res) => {
  try {
    const { sub, name, email, picture } = req.body;

    // Check if user exists
    let user = await User.findOne({ googleId: sub });

    if (!user) {
      user = new User({ googleId: sub, name, email, picture });
      await user.save();
    }

    res.status(200).json({ message: "User saved successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
