const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Modern Mongoose versions do not require or support connection option objects
    const conn = await mongoose.connect(process.env.compass);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
