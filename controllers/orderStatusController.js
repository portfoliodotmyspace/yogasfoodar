const OrderStatusModel = require("../models/orderStatusModel");

exports.getAllOrderStatuses = async (req, res) => {
  try {
    const statuses = await OrderStatusModel.getAll();
    res.json({
      isSuccess: true,
      status: 200,
      message: "Order statuses fetched",
      data: statuses,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        isSuccess: false,
        status: 500,
        message: "Failed to fetch order statuses",
      });
  }
};
