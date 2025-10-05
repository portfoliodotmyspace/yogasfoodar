const db = require("../config/db");

const PaymentStatusModel = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM payment_statuses");
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      "SELECT * FROM payment_statuses WHERE id = ?",
      [id]
    );
    return rows[0];
  },
};

module.exports = PaymentStatusModel;
