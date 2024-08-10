// backend/config/db.js
const mongoose = require('mongoose');
require('dotenv').config();
console.log(process.env.DBURL);

const connectDB = async () => { 
  try {
    await mongoose.connect(process.env.DBURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
