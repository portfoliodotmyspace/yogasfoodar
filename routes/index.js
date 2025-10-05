const express = require("express");
const router = express.Router();

// Admin, category, menu items
const adminRoutes = require("./adminRoutes");
const categoryRoutes = require("./categoryRoutes");
const foodRoutes = require("./menuItemRoutes");
const orderStatusRoutes = require("./orderStatusRoutes");
const deliveryPersonRoutes = require("./deliveryPersonRoutes");
const paymentStatusRoutes = require("./paymentStatusRoutes");
const orderRoutes = require("./orderRoutes");

// User routes
const userRoutes = require("./userRoutes");

router.use("/admin", adminRoutes);
router.use("/categories", categoryRoutes);
router.use("/menuItems", foodRoutes);
router.use("/user", userRoutes);
router.use("/order", orderStatusRoutes);
router.use("/delivery", deliveryPersonRoutes);
router.use("/payment", paymentStatusRoutes);
router.use("/userorder", orderRoutes);

module.exports = router;
