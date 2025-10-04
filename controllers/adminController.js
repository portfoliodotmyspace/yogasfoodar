const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
const logger = require("../utils/logger");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Name, email, and password are required",
        data: null,
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Invalid email format",
        data: null,
      });
    }

    if (!validator.isLength(password, { min: 6 })) {
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Password must be at least 6 characters",
        data: null,
      });
    }

    const existingAdmin = await Admin.findByEmail(email);
    if (existingAdmin) {
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Admin already exists",
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create(name, email, hashedPassword);

    res.status(201).json({
      isSuccess: true,
      status: 201,
      message: "Admin registered successfully",
      data: newAdmin,
    });
  } catch (err) {
    logger.error("Error registering admin: %s", err.message);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "Failed to register admin",
      data: null,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Email and password are required",
        data: null,
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Invalid email format",
        data: null,
      });
    }

    const admin = await Admin.findByEmail(email);
    if (!admin) {
      return res.status(401).json({
        isSuccess: false,
        status: 401,
        message: "Invalid email or password",
        data: null,
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        isSuccess: false,
        status: 401,
        message: "Invalid email or password",
        data: null,
      });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      isSuccess: true,
      status: 200,
      message: "Login successful",
      data: { token },
    });
  } catch (err) {
    logger.error("Error logging in admin: %s", err.message);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "Failed to login",
      data: null,
    });
  }
};
