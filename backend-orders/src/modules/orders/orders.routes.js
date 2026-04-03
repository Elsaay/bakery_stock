const express = require("express");
const router = express.Router();

const ordersController = require("./orders.controller");


router.post("/", ordersController.createOrder);


router.get("/", ordersController.getOrders);

module.exports = router;
