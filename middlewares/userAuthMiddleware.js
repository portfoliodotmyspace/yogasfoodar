const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const db = require("../config/db");

const userAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        isSuccess: false,
        status: 401,
        message: "Authorization token missing",
        data: null,
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // fetch user from DB to verify still exists and active
    const [rows] = await db.query(
      `SELECT 
         id, firstname, lastname, companyname, country, street_address, address_line2, 
         postcode, city, email, phone, ship_to_different_address, order_notes, is_verified
       FROM users 
       WHERE id = ?`,
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        isSuccess: false,
        status: 401,
        message: "User not found",
        data: null,
      });
    }

    req.user = rows[0]; // attach full user info to request
    next();
  } catch (err) {
    logger.error("User auth error: %s", err.message);
    return res.status(401).json({
      isSuccess: false,
      status: 401,
      message: "Invalid or expired token",
      data: null,
    });
  }
};

module.exports = userAuthMiddleware;
