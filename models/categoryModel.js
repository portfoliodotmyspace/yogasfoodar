const db = require("../config/db");

const Category = {
  getAll: async () => {
    const [rows] = await db.query("SELECT id, name FROM categories");
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query("SELECT * FROM categories WHERE id = ?", [
      id,
    ]);
    return rows[0];
  },

  create: async (name) => {
    const [result] = await db.query(
      "INSERT INTO categories (name) VALUES (?)",
      [name]
    );
    return { id: result.insertId, name };
  },

  update: async (id, name) => {
    await db.query("UPDATE categories SET name = ? WHERE id = ?", [name, id]);
    return { id, name };
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
