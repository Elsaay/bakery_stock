const express = require("express");
const cors = require("cors");
require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

const ordersRoutes = require("./modules/orders/orders.routes");
app.use("/orders", ordersRoutes);

app.get("/", (_, res) => res.send("Orders service running"));

module.exports = app;
