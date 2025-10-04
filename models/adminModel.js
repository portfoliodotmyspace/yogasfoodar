const db = require("../config/db");

const Admin = {
  create: async (name, email, hashedPassword) => {
    const [result] = await db.query(
      "INSERT INTO admins (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );
    return { id: result.insertId, name, email };
  },

  findByEmail: async (email) => {
    const [rows] = await db.query("SELECT * FROM admins WHERE email = ?", [
      email,
    ]);
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await db.query(
      "SELECT id, name, email, created_at FROM admins WHERE id = ?",
      [id]
    );
    return rows[0];
  },
};

module.exports = Admin;
