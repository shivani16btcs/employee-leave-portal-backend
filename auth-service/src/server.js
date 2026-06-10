const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const crypto = require("crypto");

if (!global.crypto) {
  global.crypto = crypto.webcrypto;
}
app.use(express.json());

// Request/response logging
app.use((req, res, next) => {
  console.log("AUTH SERVICE HIT:", req.method, req.url);
  res.on('finish', () => {
    console.log(`AUTH SERVICE RESPONSE: ${req.method} ${req.url} -> ${res.statusCode}`);
  });
  next();
});

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

app.get("/", (req, res) => {
  res.send("Auth Service Running");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});