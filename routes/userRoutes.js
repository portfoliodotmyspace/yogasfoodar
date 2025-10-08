const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const categoryController = require("../controllers/categoryController");
const menuItemController = require("../controllers/menuItemController");
const userAuth = require("../middlewares/userAuthMiddleware");

// Register & OTP
router.post("/register", userController.register);
router.post("/verify-otp", userController.verifyOtp);
router.post("/resend-otp", userController.resendOtp);
router.get("/getCategories", categoryController.getCategories);
router.get("/getMenuItems", menuItemController.getMenuItems);

// Login
router.post("/login", userController.login);

// Forgot & Reset Password
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

// Profile (protected routes)
router.get("/profile", userAuth, userController.getProfile);
router.put("/updateprofile", userAuth, userController.updateProfile);

module.exports = router;
