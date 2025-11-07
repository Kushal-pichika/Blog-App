require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const postRoutes = require("./routes/postRoutes");

const app = express();
app.use(express.json());
app.use(cors());

const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true, // 🔒 Required for MongoDB Atlas
  serverSelectionTimeoutMS: 10000, // ⏱ Prevent long hangs if DNS fails
};

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, mongoOptions)
  .then(() => console.log("✅ MongoDB Atlas connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:");
    console.error(err.message);
    process.exit(1);
  });

// API routes
app.use("/api/posts", postRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
