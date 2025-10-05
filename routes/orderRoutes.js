const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middlewares/userAuthMiddleware");
const { verifyAdmin } = require("../middlewares/authMiddleware");

// User creates an order
router.post("/create-order", authMiddleware, orderController.createOrder);

// User: get a specific order by order_id
router.get(
  "/order/:order_id",
  authMiddleware,
  orderController.getUserOrderById
);

// Admin: get all current orders (not delivered)
router.get(
  "/admin/get-current-orders",
  verifyAdmin,
  orderController.getCurrentAdminOrders
);

// Admin: get all delivered orders
router.get(
  "/admin/get-delivered-orders",
  verifyAdmin,
  orderController.getDeliveredAdminOrders
);

// Admin: update order status
router.put(
  "/admin/update-order/:order_id",
  verifyAdmin,
  orderController.updateOrderStatus
);

module.exports = router;
