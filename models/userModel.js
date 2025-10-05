const db = require("../config/db");
const bcrypt = require("bcrypt");

const User = {
  create: async ({ firstname, lastname, email, password, otp, otp_expiry }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (firstname, lastname, email, password, otp, otp_expiry) VALUES (?, ?, ?, ?, ?, ?)",
      [firstname, lastname, email, hashedPassword, otp, otp_expiry]
    );
    return { id: result.insertId, firstname, lastname, email, is_verified: 0 };
  },

  findByEmail: async (email) => {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  },

  verifyOtp: async (email, otp) => {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? AND otp = ? AND otp_expiry > NOW()",
      [email, otp]
    );
    if (!rows[0]) return null;
    await db.query(
      "UPDATE users SET is_verified = 1, otp = NULL, otp_expiry = NULL WHERE email = ?",
      [email]
    );
    return rows[0];
  },

  updateProfile: async (id, data) => {
    const fields = [];
    const values = [];

    const allowedFields = [
      "firstname",
      "lastname",
      "companyname",
      "country",
      "street_address",
      "address_line2",
      "postcode",
      "city",
      "contact_email",
      "phone",
      "ship_to_different_address",
      "order_notes",
    ];

    // Build dynamic update query
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      } else if (
        ["companyname", "address_line2", "order_notes"].includes(field)
      ) {
        // Optional text fields — clear when not sent
        fields.push(`${field} = ?`);
        values.push("");
      } else if (field === "ship_to_different_address") {
        // Optional boolean field — default to 0 (false)
        fields.push(`${field} = ?`);
        values.push(0);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);

    await db.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    const [rows] = await db.query(
      `SELECT 
        id, firstname, lastname, companyname, country, street_address, address_line2,
        postcode, city, email, contact_email, phone, ship_to_different_address, order_notes
       FROM users 
       WHERE id = ?`,
      [id]
    );

    const user = rows[0];
    user.ship_to_different_address = Boolean(user.ship_to_different_address);
    return user;
  },

  resendOtp: async (email) => {
    const user = await User.findByEmail(email);
    if (!user) return null;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    await db.query("UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?", [
      otp,
      otp_expiry,
      email,
    ]);

    return { email, otp };
  },
};

module.exports = User;
