const validator = require("validator");
const MenuItem = require("../models/menuItemModel");
const { deleteOldFile } = require("../utils/multer");
const logger = require("../utils/logger");

// Get all menu items
exports.getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.getAll();
    const formatted = items.map((item) => ({
      ...item,
      image: item.image ? `/uploads/${item.image}` : null,
    }));

    res.status(200).json({
      isSuccess: true,
      status: 200,
      message: "Menu items fetched successfully",
      data: formatted,
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

// Get single menu item
exports.getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.getById(req.params.id);
    if (!item)
      return res.status(404).json({
        isSuccess: false,
        status: 404,
        message: "Menu item not found",
        data: null,
      });

    item.image = item.image ? `/uploads/${item.image}` : null;

    res.status(200).json({
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

// Create menu item
exports.createMenuItem = async (req, res) => {
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

    if (!currency || !validator.isLength(currency, { min: 1, max: 10 }))
      return res.status(400).json({
        isSuccess: false,
        status: 400,
        message: "Currency is required",
        data: null,
      });

    const imageFilename = req.file ? req.file.filename : null;

    const newItem = await MenuItem.create({
      name,
      price,
      currency,
      category_id,
      description: description || null,
      image: imageFilename,
    });

    if (newItem.image) newItem.image = `/uploads/${newItem.image}`;

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

// Update menu item
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

    const oldItem = await MenuItem.getById(req.params.id);
    if (!oldItem)
      return res.status(404).json({
        isSuccess: false,
        status: 404,
        message: "Menu item not found",
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
      updatedData.image = req.file.filename;
      if (oldItem.image) deleteOldFile(oldItem.image);
    }

    const updatedItem = await MenuItem.update(req.params.id, updatedData);

    if (updatedItem.image) updatedItem.image = `/uploads/${updatedItem.image}`;

    res.status(200).json({
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

// Delete menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.getById(req.params.id);
    if (!item)
      return res.status(404).json({
        isSuccess: false,
        status: 404,
        message: "Menu item not found",
        data: null,
      });

    if (item.image) deleteOldFile(item.image);

    await MenuItem.remove(req.params.id);

    res.status(200).json({
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
