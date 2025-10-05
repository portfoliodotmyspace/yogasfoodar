const db = require("../config/db");

const OrderModel = {
  create: async (data) => {
    const fields = [
      "order_id",
      "user_id",
      "payment_id",
      "payment_status_id",
      "order_status_id",
      "total_amount",
      "currency",
      "items",
      "delivery_person_id",
    ];

    const values = fields.map((f) => {
      if (f === "items" && data[f]) return JSON.stringify(data[f]);
      if (f === "delivery_person_id") return data[f] || null;
      return data[f] || null;
    });

    const [result] = await db.query(
      `INSERT INTO orders (${fields.join(",")}) VALUES (${fields
        .map(() => "?")
        .join(",")})`,
      values
    );

    const [rows] = await db.query("SELECT * FROM orders WHERE id = ?", [
      result.insertId,
    ]);

    return rows[0];
  },

  getCurrentByUserId: async (userId) => {
    const [rows] = await db.query(
      `SELECT o.*, p.name AS payment_status, s.name AS order_status, 
              d.name AS delivery_person_name, d.phone AS delivery_person_phone
       FROM orders o
       LEFT JOIN payment_statuses p ON o.payment_status_id = p.id
       LEFT JOIN order_statuses s ON o.order_status_id = s.id
       LEFT JOIN delivery_persons d ON o.delivery_person_id = d.id
       WHERE o.user_id = ? AND s.name != 'Delivered'`,
      [userId]
    );
    return rows;
  },

  getCurrentOrders: async () => {
    const [rows] = await db.query(
      `SELECT o.*, CONCAT(u.firstname, ' ', u.lastname) AS user_name, u.contact_email, 
            p.name AS payment_status, s.name AS order_status, 
            d.name AS delivery_person_name, d.phone AS delivery_person_phone
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     LEFT JOIN payment_statuses p ON o.payment_status_id = p.id
     LEFT JOIN order_statuses s ON o.order_status_id = s.id
     LEFT JOIN delivery_persons d ON o.delivery_person_id = d.id
     WHERE s.name != 'Delivered'
     ORDER BY o.created_at DESC`
    );
    return rows;
  },

  getDeliveredOrders: async () => {
    const [rows] = await db.query(
      `SELECT o.*, CONCAT(u.firstname, ' ', u.lastname) AS user_name, u.contact_email, 
            p.name AS payment_status, s.name AS order_status, 
            d.name AS delivery_person_name, d.phone AS delivery_person_phone
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     LEFT JOIN payment_statuses p ON o.payment_status_id = p.id
     LEFT JOIN order_statuses s ON o.order_status_id = s.id
     LEFT JOIN delivery_persons d ON o.delivery_person_id = d.id
     WHERE s.name = 'Delivered'
     ORDER BY o.created_at DESC`
    );
    return rows;
  },

  updateStatus: async (orderId, statusId, deliveryPersonId = null) => {
    await db.query(
      "UPDATE orders SET order_status_id = ?, delivery_person_id = ? WHERE order_id = ?",
      [statusId, deliveryPersonId, orderId]
    );

    const [rows] = await db.query(
      `SELECT o.*, p.name AS payment_status, s.name AS order_status, 
              d.name AS delivery_person_name, d.phone AS delivery_person_phone
       FROM orders o
       LEFT JOIN payment_statuses p ON o.payment_status_id = p.id
       LEFT JOIN order_statuses s ON o.order_status_id = s.id
       LEFT JOIN delivery_persons d ON o.delivery_person_id = d.id
       WHERE o.order_id = ?`,
      [orderId]
    );
    return rows[0];
  },

  getUserOrderByOrderId: async (userId, orderId) => {
    const [rows] = await db.query(
      `SELECT o.*, p.name AS payment_status, s.name AS order_status, 
            d.name AS delivery_person_name, d.phone AS delivery_person_phone
     FROM orders o
     LEFT JOIN payment_statuses p ON o.payment_status_id = p.id
     LEFT JOIN order_statuses s ON o.order_status_id = s.id
     LEFT JOIN delivery_persons d ON o.delivery_person_id = d.id
     WHERE o.user_id = ? AND o.order_id = ? AND s.name != 'Delivered'`,
      [userId, orderId]
    );
    return rows[0];
  },
};

module.exports = OrderModel;
