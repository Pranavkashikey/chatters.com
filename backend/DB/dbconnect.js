const mongoose = require("mongoose");

const dbconnect = async () => {
  try {
    const uri = process.env.MONGODB_CONNECT; // Load the connection string from .env
    if (!uri) {
      throw new Error("MONGO_URI is not defined in the environment variables");
    }
    await mongoose.connect(uri);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error; // Re-throw the error for the caller to handle
  }
};

module.exports = dbconnect;
