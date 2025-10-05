const db = require("../config/db");

const OrderStatusModel = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM order_statuses");
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query("SELECT * FROM order_statuses WHERE id = ?", [
      id,
    ]);
    return rows[0];
  },
};

module.exports = OrderStatusModel;
