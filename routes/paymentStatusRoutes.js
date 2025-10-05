const express = require("express");
const router = express.Router();
const paymentStatusController = require("../controllers/paymentStatusController");
const { verifyAdmin } = require("../middlewares/authMiddleware");

router.get("/payment-statuses", verifyAdmin, paymentStatusController.getAllPaymentStatuses);

module.exports = router;
