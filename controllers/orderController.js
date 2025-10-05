const OrderModel = require("../models/orderModel");
const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");
const sendMail = require("../utils/sendEmail");
const fs = require("fs");
const path = require("path");

// Generate order ID like ORD-YYYYMMDD-RANDOM
const generateOrderId = () => {
  const date = new Date();
  const ymd = date.toISOString().split("T")[0].replace(/-/g, "");
  const random = uuidv4().slice(0, 6).toUpperCase();
  return `ORD-${ymd}-${random}`;
};

const formatCurrency = (amount, currency) => {
  const formattedAmount = Number(amount).toFixed(2);
  return `${formattedAmount} ${currency}`;
};

const TEMPLATE_PATH = path.join(
  __dirname,
  "..",
  "utils",
  "emailTemplates",
  "orderconfirmation.html"
);
const ORDER_CONFIRMATION_TEMPLATE = fs.readFileSync(TEMPLATE_PATH, "utf8");

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { payment_id, payment_status_id, total_amount, currency, items } =
      req.body;

    const orderId = generateOrderId();
    const finalCurrency = currency || "CHF";

    let itemsRowsHtml = "";

    if (Array.isArray(items)) {
      itemsRowsHtml = items
        .map(
          (item) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td style="text-align: right;">${formatCurrency(
            item.price,
            finalCurrency
          )}</td>
          <td style="text-align: right;">${formatCurrency(
            item.subtotal,
            finalCurrency
          )}</td>
        </tr>
      `
        )
        .join("");
    }

    const order = await OrderModel.create({
      order_id: orderId,
      user_id: userId,
      payment_id,
      payment_status_id,
      order_status_id: 25,
      total_amount,
      currency: finalCurrency,
      items: JSON.stringify(items),
      delivery_person_id: null,
    });

    const [userRows] = await db.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    if (userRows.length) {
      const user = userRows[0];
      const fullName = `${user.firstname || "Kunde"} ${user.lastname || ""}`;

      const replacements = {
        "{{fullName}}": fullName,
        "{{orderId}}": order.order_id,
        "{{totalAmount}}": formatCurrency(order.total_amount, order.currency),
        "{{currency}}": order.currency,
        "{{itemsRows}}": itemsRowsHtml,
      };

      let emailHtml = ORDER_CONFIRMATION_TEMPLATE;
      for (const key in replacements) {
        const regex = new RegExp(key, "g");
        emailHtml = emailHtml.replace(regex, replacements[key]);
      }

      await sendMail({
        to: user.contact_email,
        subject: `Ihre Bestellbestätigung - ${order.order_id}`,
        text: `Ihre Bestellung ${order.order_id} wurde bestätigt.`,
        html: emailHtml,
      });
    }

    res.json({
      isSuccess: true,
      status: 200,
      message: "Order created successfully",
      data: order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "Failed to create order",
    });
  }
};

// exports.createOrder = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { payment_id, payment_status_id, total_amount, currency, items } =
//       req.body;

//     const orderId = generateOrderId();

//     const order = await OrderModel.create({
//       order_id: orderId,
//       user_id: userId,
//       payment_id,
//       payment_status_id,
//       order_status_id: 25, // Pending
//       total_amount,
//       currency: currency || "CHF",
//       items,
//       delivery_person_id: null,
//     });

//     // Fetch user email
//     const [userRows] = await db.query("SELECT * FROM users WHERE id = ?", [
//       userId,
//     ]);

//     if (userRows.length) {
//       const user = userRows[0];
//       const fullName = `${user.firstname} ${user.lastname}`;
//       const emailHtml = `
//         <h2>Order Confirmation</h2>
//         <p>Hello ${fullName},</p>
//         <p>Thank you for your order. Here are your order details:</p>
//         <ul>
//           <li><b>Order ID:</b> ${order.order_id}</li>
//           <li><b>Total Amount:</b> ${order.total_amount} ${order.currency}</li>
//         </ul>
//         <p>Items:</p>
//         <pre>${JSON.stringify(JSON.parse(order.items), null, 2)}</pre>
//       `;

//       await sendMail({
//         to: user.contact_email,
//         subject: `Your Order Confirmation - ${order.order_id}`,
//         text: `Your order ${order.order_id} has been confirmed.`,
//         html: emailHtml,
//       });
//     }

//     res.json({
//       isSuccess: true,
//       status: 200,
//       message: "Order created successfully",
//       data: order,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       isSuccess: false,
//       status: 500,
//       message: "Failed to create order",
//     });
//   }
// };

// ✅ Get only current (not delivered) orders for the logged-in user
exports.getUserOrderById = async (req, res) => {
  try {
    const { order_id } = req.params;
    const userId = req.user.id;

    const order = await OrderModel.getUserOrderByOrderId(userId, order_id);

    if (!order) {
      return res.status(404).json({
        isSuccess: false,
        status: 404,
        message: "Order not found or already delivered",
      });
    }

    res.json({
      isSuccess: true,
      status: 200,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "Failed to fetch order",
    });
  }
};

// ✅ Admin: get all current (not delivered) orders
exports.getCurrentAdminOrders = async (req, res) => {
  try {
    const orders = await OrderModel.getCurrentOrders();
    res.json({
      isSuccess: true,
      status: 200,
      message: "Current orders fetched successfully",
      data: orders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "Failed to fetch current orders",
    });
  }
};

// ✅ Admin: get all delivered orders
exports.getDeliveredAdminOrders = async (req, res) => {
  try {
    const orders = await OrderModel.getDeliveredOrders();
    res.json({
      isSuccess: true,
      status: 200,
      message: "Delivered orders fetched successfully",
      data: orders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "Failed to fetch delivered orders",
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { order_status_id, delivery_person_id } = req.body;

    const order = await OrderModel.updateStatus(
      order_id,
      order_status_id,
      delivery_person_id
    );

    res.json({
      isSuccess: true,
      status: 200,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "Failed to update order status",
    });
  }
};
