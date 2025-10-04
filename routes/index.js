const express = require("express");
const router = express.Router();

// Admin, category, menu items
const adminRoutes = require("./adminRoutes");
const categoryRoutes = require("./categoryRoutes");
const foodRoutes = require("./menuItemRoutes");

// User routes
const userRoutes = require("./userRoutes");

router.use("/admin", adminRoutes);
router.use("/categories", categoryRoutes);
router.use("/menuItems", foodRoutes);
router.use("/user", userRoutes);

module.exports = router;
