const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { verifyAdmin } = require("../middlewares/authMiddleware");

router.get("/getCategories", verifyAdmin, categoryController.getCategories);
router.get("/getCategory/:id", verifyAdmin, categoryController.getCategory);
router.post("/addCategory", verifyAdmin, categoryController.createCategory);
router.put(
  "/updateCategory/:id",
  verifyAdmin,
  categoryController.updateCategory
);
router.delete(
  "/deleteCategory/:id",
  verifyAdmin,
  categoryController.deleteCategory
);

module.exports = router;
