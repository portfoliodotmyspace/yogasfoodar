const db = require("../config/db");

const Category = {
  getAll: async () => {
    const [rows] = await db.query("SELECT id, name, image FROM categories");
    return rows; // DO NOT prepend /uploads/ here
  },

  getById: async (id) => {
    const [rows] = await db.query("SELECT * FROM categories WHERE id = ?", [
      id,
    ]);
    if (!rows[0]) return null;
    return rows[0]; // leave image as stored in DB
  },

  create: async (name, imageFilename) => {
    const [result] = await db.query(
      "INSERT INTO categories (name, image) VALUES (?, ?)",
      [name, imageFilename || null]
    );
    return { id: result.insertId, name, image: imageFilename || null };
  },

  update: async (id, name, imageFilename) => {
    await db.query("UPDATE categories SET name = ?, image = ? WHERE id = ?", [
      name,
      imageFilename || null,
      id,
    ]);
    return { id, name, image: imageFilename || null };
  },

  remove: async (id) => {
    await db.query("DELETE FROM categories WHERE id = ?", [id]);
    return { message: "Category deleted" };
  },

  isUsedInMenuItems: async (id) => {
    const [rows] = await db.query(
      "SELECT COUNT(*) AS count FROM menu_items WHERE category_id = ?",
      [id]
    );
    return rows[0].count > 0;
  },
};

module.exports = Category;

module.exports = Category;
