const DeliveryPersonModel = require("../models/deliveryPersonModel");

exports.createDeliveryPerson = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const person = await DeliveryPersonModel.create({ name, phone });
    res.status(200).json({
      isSuccess: true,
      status: 200,
      message: "Delivery person added",
      data: person,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "Failed to add delivery person",
    });
  }
};

exports.getAllDeliveryPersons = async (req, res) => {
  try {
    const persons = await DeliveryPersonModel.getAll();
    res.status(200).json({
      isSuccess: true,
      status: 200,
      message: "Delivery persons fetched",
      data: persons,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      isSuccess: false,
      status: 500,
      message: "Failed to fetch delivery persons",
    });
  }
};
