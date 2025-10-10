const db = require("../config/db");

const MenuItem = {
  getAll: async () => {
    const [rows] = await db.query(
      `SELECT 
        m.id, 
        m.name, 
        m.price, 
        m.currency, 
        m.description, 
        m.image, 
        m.category_id,
        c.name AS category
     FROM menu_items m
     LEFT JOIN categories c ON m.category_id = c.id
     ORDER BY m.created_at DESC`
    );
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      `SELECT m.*, c.name AS category 
       FROM menu_items m 
       LEFT JOIN categories c ON m.category_id = c.id 
       WHERE m.id = ?`,
      [id]
    );
    return rows[0];
  },

  create: async (data) => {
    const { name, price, currency, category_id, description, image } = data;
    const [result] = await db.query(
      `INSERT INTO menu_items (name, price, currency, category_id, description, image)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, price, currency, category_id, description, image]
    );
    return { id: result.insertId, ...data };
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];

    if (data.name !== undefined) {
      fields.push("name = ?");
      values.push(data.name);
    }
    if (data.price !== undefined) {
      fields.push("price = ?");
      values.push(data.price);
    }
    if (data.currency !== undefined) {
      fields.push("currency = ?");
      values.push(data.currency);
    }
    if (data.category_id !== undefined) {
      fields.push("category_id = ?");
      values.push(data.category_id);
    }
    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(data.description);
    }
    if (data.image !== undefined) {
      fields.push("image = ?");
      values.push(data.image);
    }

    if (fields.length === 0) return null;

    const sql = `UPDATE menu_items SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);

    await db.query(sql, values);

    const [rows] = await db.query(
      `SELECT m.*, c.name AS category_name 
     FROM menu_items m 
     LEFT JOIN categories c ON m.category_id = c.id 
     WHERE m.id = ?`,
      [id]
    );

    return rows[0];
  },

  remove: async (id) => {
    await db.query("DELETE FROM menu_items WHERE id=?", [id]);
    return { id };
  },
};

module.exports = MenuItem;
