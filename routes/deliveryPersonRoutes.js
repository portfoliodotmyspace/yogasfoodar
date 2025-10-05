const express = require("express");
const router = express.Router();
const deliveryPersonController = require("../controllers/deliveryPersonController");
const { verifyAdmin } = require("../middlewares/authMiddleware");

router.post(
  "/create-person",
  verifyAdmin,
  deliveryPersonController.createDeliveryPerson
);
router.get(
  "/get-persons",
  verifyAdmin,
  deliveryPersonController.getAllDeliveryPersons
);

module.exports = router;
