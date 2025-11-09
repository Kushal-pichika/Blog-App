require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const client = require("prom-client"); // ✅ Prometheus metrics
const postRoutes = require("./routes/postRoutes");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Setup Prometheus metrics collection
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

// Optional: Track total HTTP requests
const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests handled by the server",
});

app.use((req, res, next) => {
  httpRequestCounter.inc();
  next();
});

// ✅ Expose /metrics endpoint for Prometheus scraping
app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// ✅ MongoDB Connection
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
  serverSelectionTimeoutMS: 10000,
};

mongoose
  .connect(process.env.MONGO_URI, mongoOptions)
  .then(() => console.log("✅ MongoDB Atlas connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:");
    console.error(err.message);
    process.exit(1);
  });

// ✅ API routes
app.use("/api/posts", postRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
