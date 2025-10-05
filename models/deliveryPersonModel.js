const db = require("../config/db");

const DeliveryPersonModel = {
  create: async ({ name, phone }) => {
    const [result] = await db.query(
      "INSERT INTO delivery_persons (name, phone) VALUES (?, ?)",
      [name, phone]
    );
    const [rows] = await db.query(
      "SELECT * FROM delivery_persons WHERE id = ?",
      [result.insertId]
    );
    return rows[0];
  },

  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM delivery_persons");
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      "SELECT * FROM delivery_persons WHERE id = ?",
      [id]
    );
    return rows[0];
  },
};

module.exports = DeliveryPersonModel;
