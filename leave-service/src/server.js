const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const leaveBalanceRoutes = require("./routes/leaveBalanceRoutes");

const app = express();
const crypto = require("crypto");

if (!global.crypto) {
  global.crypto = crypto.webcrypto;
}

app.use(express.json());

// Logging middleware - BEFORE routes
app.use((req, res, next) => {
  console.log("LEAVE SERVICE HIT:", req.method, req.url);
  res.on('finish', () => {
    console.log(`LEAVE SERVICE RESPONSE: ${req.method} ${req.url} -> ${res.statusCode}`);
  });
  next();
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// Health Check
app.get("/", (req, res) => {
  res.send("Leave Service Running");
});

// Routes
app.use("/api/leave", leaveBalanceRoutes);

// 404 handler
app.use((req, res) => {
  console.log(`404 NOT FOUND: ${req.method} ${req.url}`);
  res.status(404).json({
    message: "Route not found",
    method: req.method,
    path: req.url
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});