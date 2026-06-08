const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const leaveBalanceRoutes = require("./routes/leaveBalanceRoutes");

const app = express();

app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// Health Check
app.get("/", (req, res) => {
  res.send("Leave Service Running");
});


app.use((req, res, next) => {
  console.log("LEAVE SERVICE HIT:", req.method, req.url);
  next();
});

// Routes
app.use("/api/leave", leaveBalanceRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});