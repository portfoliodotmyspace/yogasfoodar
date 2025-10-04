const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middlewares/authMiddleware");
const menuItemController = require("../controllers/menuItemController");
const { upload, handleUpload } = require("../utils/multer");

// CRUD routes (admin-protected)
router.get("/getMenuItems", verifyAdmin, menuItemController.getMenuItems);
router.get("/getMenuItem/:id", verifyAdmin, menuItemController.getMenuItem);

router.post(
  "/addMenuItem",
  verifyAdmin,
  handleUpload(upload.single("image")),
  menuItemController.createMenuItem
);

router.put(
  "/updateMenuItem/:id",
  verifyAdmin,
  handleUpload(upload.single("image")),
  menuItemController.updateMenuItem
);

router.delete(
  "/deleteMenuItem/:id",
  verifyAdmin,
  menuItemController.deleteMenuItem
);

module.exports = router;
