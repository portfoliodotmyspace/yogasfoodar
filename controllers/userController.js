const User = require("../models/userModel");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");
const sendEmail = require("../utils/sendEmail");
const fs = require("fs");
const path = require("path");

// Generate 6-digit OTP
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.register = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || validator.isEmpty(firstname)) {
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Firstname is required",
        data: null,
      });
    }
    if (!lastname || validator.isEmpty(lastname)) {
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Lastname is required",
        data: null,
      });
    }
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Valid email is required",
        data: null,
      });
    }
    if (!password || !validator.isLength(password, { min: 6 })) {
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Password must be at least 6 characters",
        data: null,
      });
    }

    const existing = await User.findByEmail(email);
    if (existing)
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Email already registered",
        data: null,
      });

    const otp = generateOtp();
    const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const newUser = await User.create({
      firstname,
      lastname,
      email,
      password,
      otp,
      otp_expiry,
    });

    // Read the HTML template
    const templatePath = path.join(
      __dirname,
      "../utils/emailTemplates/otptemplate.html"
    );
    let htmlTemplate = fs.readFileSync(templatePath, "utf8");
    // Combine first and last name
    const fullName = `${firstname} ${lastname}`;
    // Replace placeholders
    htmlTemplate = htmlTemplate
      .replace("{{firstname}}", fullName)
      .replace("{{otp}}", otp);

    // Send OTP email
    await sendEmail({
      to: email,
      subject: "Verify Your YogasFood Account",
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
      html: htmlTemplate,
    });

    res.status(200).json({
      isSuccess: true,
      status: 200,
      message: "User registered. OTP sent to email.",
      data: { email },
    });
  } catch (err) {
    logger.error("User registration error: %s", err.message);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "Registration failed",
      data: null,
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Email and OTP required",
        data: null,
      });

    const user = await User.verifyOtp(email, otp);
    if (!user)
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Invalid or expired OTP",
        data: null,
      });

    res.status(200).json({
      isSuccess: true,
      status: 200,
      message: "Email verified successfully",
      data: { email },
    });
  } catch (err) {
    logger.error("OTP verification error: %s", err.message);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "OTP verification failed",
      data: null,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user)
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Invalid credentials",
        data: null,
      });
    if (!user.is_verified)
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Email not verified",
        data: null,
      });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Invalid credentials",
        data: null,
      });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).json({
      isSuccess: true,
      status: 200,
      message: "Login successful",
      data: { token },
    });
  } catch (err) {
    logger.error("Login error: %s", err.message);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "Login failed",
      data: null,
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({
        isSuccess: false,
        status: 404,
        message: "User not found",
        data: null,
      });
    }

    const safeUser = {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      companyname: user.companyname,
      country: user.country,
      street_address: user.street_address,
      address_line2: user.address_line2,
      postcode: user.postcode,
      city: user.city,
      contact_email: user.contact_email,
      phone: user.phone,
      ship_to_different_address: !!user.ship_to_different_address,
      order_notes: user.order_notes,
    };

    res.status(200).json({
      isSuccess: true,
      status: 200,
      message: "Profile fetched",
      data: safeUser,
    });
  } catch (err) {
    logger.error("Get profile error: %s", err.message);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "Failed to fetch profile",
      data: null,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // User-friendly labels for required fields
    const requiredFields = {
      firstname: "First Name",
      lastname: "Last Name",
      country: "Country / Region",
      street_address: "Street Address",
      postcode: "Postcode / ZIP",
      city: "Town / City",
      contact_email: "Contact Email Address",
      phone: "Phone",
    };

    // Check required fields
    const missingFields = [];
    Object.keys(requiredFields).forEach((key) => {
      if (!req.body[key] || req.body[key].toString().trim() === "") {
        missingFields.push(requiredFields[key]);
      }
    });

    if (missingFields.length > 0) {
      const lastField = missingFields.pop();
      const message =
        missingFields.length > 0
          ? `${missingFields.join(", ")}, and ${lastField} is required`
          : `${lastField} is required`;

      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message,
        data: null,
      });
    }

    // Perform update
    const updated = await User.updateProfile(req.user.id, req.body);

    if (!updated) {
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "No valid fields to update",
        data: null,
      });
    }

    // Ensure boolean response
    updated.ship_to_different_address = Boolean(
      updated.ship_to_different_address
    );

    res.status(200).json({
      isSuccess: true,
      status: 200,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (err) {
    logger.error("Update profile error: %s", err.message);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "Failed to update profile",
      data: null,
    });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Email is required",
        data: null,
      });

    const result = await User.resendOtp(email);
    if (!result)
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Email not found",
        data: null,
      });

    // Send OTP email
    await sendEmail({
      to: email,
      subject: "Your New OTP Code",
      text: `Your new OTP is ${result.otp}. It will expire in 10 minutes.`,
      html: `<p>Your new OTP is <b>${result.otp}</b>. It will expire in 10 minutes.</p>`,
    });

    res.status(200).json({
      isSuccess: true,
      status: 200,
      message: "New OTP sent to email",
      data: { email },
    });
  } catch (err) {
    logger.error("Resend OTP error: %s", err.message);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "Failed to resend OTP",
      data: null,
    });
  }
};
