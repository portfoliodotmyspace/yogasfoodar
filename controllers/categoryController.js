const Category = require("../models/categoryModel");
const logger = require("../utils/logger");

exports.getCategories = async (req, res, next) => {
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

exports.getCategory = async (req, res, next) => {
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

exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Name is required",
        data: null,
      });
    }

    // Check for duplicate
    const existing = await Category.getAll();
    if (existing.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Category name already exists",
        data: null,
      });
    }

    const newCategory = await Category.create(name);
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

exports.updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Name is required",
        data: null,
      });
    }

    // Check for duplicate (exclude current category)
    const existing = await Category.getAll();
    if (
      existing.some(
        (c) =>
          c.name.toLowerCase() === name.toLowerCase() && c.id != req.params.id
      )
    ) {
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Category name already exists",
        data: null,
      });
    }

    const updated = await Category.update(req.params.id, name);
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

exports.deleteCategory = async (req, res, next) => {
  try {
    await Category.remove(req.params.id);
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
