const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const register = async (req, res) => {
  try {
    const { name, email, password, role, managerId } = req.body;
    console.log(`register: email=${email}, role=${role}`);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      managerId
    });

    await axios.post("http://localhost:3002/api/leave-balance/init", {
      employeeId: user._id,
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('register error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`login attempt: email=${email}`);

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );

    res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const profile = async (req, res) => {
  console.log(`profile: userId=${req.user && req.user.userId}`);
  res.json({
    success: true,
    user: req.user,
  });
};

module.exports = {
  register,
  login,
  profile,
};
