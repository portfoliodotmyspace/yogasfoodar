const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { verifyAdmin } = require("../middlewares/authMiddleware");
const { upload, handleUpload } = require("../utils/multer");

// ✅ Image upload for create/update
router.get("/getCategories", verifyAdmin, categoryController.getCategories);
router.get("/getCategory/:id", verifyAdmin, categoryController.getCategory);
router.post(
  "/addCategory",
  verifyAdmin,
  handleUpload(upload.single("image")),
  categoryController.createCategory
);
router.put(
  "/updateCategory/:id",
  verifyAdmin,
  handleUpload(upload.single("image")),
  categoryController.updateCategory
);
router.delete(
  "/deleteCategory/:id",
  verifyAdmin,
  categoryController.deleteCategory
);

module.exports = router;
