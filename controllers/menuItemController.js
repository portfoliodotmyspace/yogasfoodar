const validator = require("validator");
const MenuItem = require("../models/menuItemModel");
const logger = require("../utils/logger");
const fs = require("fs");
const path = require("path");

exports.getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.getAll();

    if (!items || items.length === 0) {
      return res.json({
        isSuccess: true,
        status: 200,
        message: "No menu items found",
        data: [],
      });
    }

    res.json({
      isSuccess: true,
      status: 200,
      message: "Menu items fetched successfully",
      data: items,
    });
  } catch (err) {
    logger.error("Error fetching menu items: %s", err.message);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "Failed to fetch menu items",
      data: null,
    });
  }
};

exports.getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.getById(req.params.id);

    if (!item) {
      return res.status(404).json({
        isSuccess: false,
        status: 404,
        message: "Menu item not found",
        data: null,
      });
    }

    res.json({
      isSuccess: true,
      status: 200,
      message: "Menu item fetched successfully",
      data: item,
    });
  } catch (err) {
    logger.error("Error fetching menu item: %s", err.message);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "Failed to fetch menu item",
      data: null,
    });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const { name, price, currency, category_id, description } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || validator.isEmpty(name))
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Name is required",
        data: null,
      });

    if (!price || !validator.isDecimal(price.toString()))
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Valid price required",
        data: null,
      });

    if (!currency || !validator.isLength(currency, { min: 1, max: 10 }))
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Currency is required",
        data: null,
      });

    const newItem = await MenuItem.create({
      name,
      price,
      currency,
      category_id,
      description: description || null,
      image,
    });

    res.status(201).json({
      isSuccess: true,
      status: 201,
      message: "Menu item created successfully",
      data: newItem,
    });
  } catch (err) {
    logger.error("Error creating menu item: %s", err.message);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "Failed to create menu item",
      data: null,
    });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const { name, price, currency, category_id, description } = req.body;

    if (!name || validator.isEmpty(name))
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Name is required",
        data: null,
      });

    if (!price || !validator.isDecimal(price.toString()))
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Valid price required",
        data: null,
      });

    const updatedData = {
      name,
      price,
      currency,
      category_id,
      description: description || null,
    };

    if (req.file) {
      updatedData.image = `/uploads/${req.file.filename}`;
    }

    const updatedItem = await MenuItem.update(req.params.id, updatedData);

    if (!updatedItem)
      return res.status(404).json({
        isSuccess: false,
        status: 404,
        message: "Menu item not found",
        data: null,
      });

    res.json({
      isSuccess: true,
      status: 200,
      message: "Menu item updated successfully",
      data: updatedItem,
    });
  } catch (err) {
    logger.error("Error updating menu item: %s", err.message);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "Failed to update menu item",
      data: null,
    });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.getById(req.params.id);
    if (!item) {
      return res.status(404).json({
        isSuccess: false,
        status: 404,
        message: "Menu item not found",
        data: null,
      });
    }

    // Delete image file if exists
    if (item.image) {
      const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        path.basename(item.image)
      );
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          logger.error("Failed to delete image file: %s", err.message);
        }
      }
    }

    await MenuItem.remove(req.params.id);

    res.json({
      isSuccess: true,
      status: 200,
      message: "Menu item deleted successfully",
      data: null,
    });
  } catch (err) {
    logger.error("Error deleting menu item: %s", err.message);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "Failed to delete menu item",
      data: null,
    });
  }
};
