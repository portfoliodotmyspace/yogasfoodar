const Category = require("../models/categoryModel");
const logger = require("../utils/logger");
const fs = require("fs");
const path = require("path");

// 📍 Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.status(200).json({
      isSuccess: true,
      status: 200,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (err) {
    logger.error("Error fetching categories: %s", err.message);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "Failed to fetch categories",
      data: null,
    });
  }
};

// 📍 Get single category
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.getById(req.params.id);
    if (!category) {
      return res.status(404).json({
        isSuccess: false,
        status: 404,
        message: "Category not found",
        data: null,
      });
    }
    res.status(200).json({
      isSuccess: true,
      status: 200,
      message: "Category fetched successfully",
      data: category,
    });
  } catch (err) {
    logger.error("Error fetching category: %s", err.message);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "Failed to fetch category",
      data: null,
    });
  }
};

// 📍 Create category with optional image
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!name) {
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Name is required",
        data: null,
      });
    }

    // Prevent duplicate
    const existing = await Category.getAll();
    if (existing.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Category name already exists",
        data: null,
      });
    }

    const newCategory = await Category.create(name, image);
    res.status(201).json({
      isSuccess: true,
      status: 201,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (err) {
    logger.error("Error creating category: %s", err.message);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "Failed to create category",
      data: null,
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const categoryId = req.params.id;

    if (!name) {
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Name is required",
        data: null,
      });
    }

    // 1️⃣ Check if category exists
    const existingCategory = await Category.getById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({
        isSuccess: false,
        status: 404,
        message: "Category not found",
        data: null,
      });
    }

    // 2️⃣ Check for duplicate name (exclude current)
    const existing = await Category.getAll();
    if (
      existing.some(
        (c) =>
          c.name.toLowerCase() === name.toLowerCase() &&
          c.id != Number(categoryId)
      )
    ) {
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Category name already exists",
        data: null,
      });
    }

    // 3️⃣ Handle new image upload
    let newImage = existingCategory.image; // keep old if not uploading new
    if (req.file) {
      newImage = req.file.filename;

      // 4️⃣ Delete old image safely
      if (existingCategory.image) {
        const oldImagePath = path.join(
          __dirname,
          "../uploads",
          existingCategory.image
        );
        fs.unlink(oldImagePath, (err) => {
          if (err) console.warn("⚠️ Failed to delete old image:", err.message);
        });
      }
    }

    // 5️⃣ Update category record
    const updated = await Category.update(categoryId, name, newImage);

    res.status(200).json({
      isSuccess: true,
      status: 200,
      message: "Category updated successfully",
      data: updated,
    });
  } catch (err) {
    logger.error("Error updating category: %s", err.message);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "Failed to update category",
      data: null,
    });
  }
};

// 📍 Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.getById(categoryId);

    if (!category) {
      return res.status(404).json({
        isSuccess: false,
        status: 404,
        message: "Category not found",
        data: null,
      });
    }

    const isUsed = await Category.isUsedInMenuItems(categoryId);
    if (isUsed) {
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message:
          "Cannot delete category. It is used in one or more menu items.",
        data: null,
      });
    }

    await Category.remove(categoryId);
    res.status(200).json({
      isSuccess: true,
      status: 200,
      message: "Category deleted successfully",
      data: null,
    });
  } catch (err) {
    logger.error("Error deleting category: %s", err.message);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "Failed to delete category",
      data: null,
    });
  }
};
