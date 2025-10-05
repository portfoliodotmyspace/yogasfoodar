const PaymentStatusModel = require("../models/paymentStatusModel");

exports.getAllPaymentStatuses = async (req, res) => {
  try {
    const statuses = await PaymentStatusModel.getAll();
    res.json({
      isSuccess: true,
      status: 200,
      message: "Payment statuses fetched",
      data: statuses,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        isSuccess: false,
        status: 500,
        message: "Failed to fetch payment statuses",
      });
  }
};
