const express = require("express");
const router = express.Router();
const orderStatusController = require("../controllers/orderStatusController");
const { verifyAdmin } = require("../middlewares/authMiddleware");

router.get(
  "/order-status",
  verifyAdmin,
  orderStatusController.getAllOrderStatuses
);

module.exports = router;
