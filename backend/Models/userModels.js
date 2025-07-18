const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { 
    type: String, 
    required: function () { return this.password?.length > 0; } 
  },
  gender: { type: String, required: false },
  profilepic: { type: String, default: " " },
  isAdmin: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
