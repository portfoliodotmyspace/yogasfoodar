const db = require("../config/db");

const Category = {
  getAll: async () => {
    const [rows] = await db.query("SELECT id, name, image FROM categories");
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query("SELECT * FROM categories WHERE id = ?", [
      id,
    ]);
    return rows[0];
  },

  create: async (name, image) => {
    const imagePath = image ? `/uploads/${image}` : null; // ✅ store relative path
    const [result] = await db.query(
      "INSERT INTO categories (name, image) VALUES (?, ?)",
      [name, imagePath]
    );
    return { id: result.insertId, name, image: imagePath };
  },

  update: async (id, name, image) => {
    await db.query("UPDATE categories SET name = ?, image = ? WHERE id = ?", [
      name,
      image,
      id,
    ]);
    return { id, name, image };
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
