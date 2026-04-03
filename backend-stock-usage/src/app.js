const express = require("express");
const cors = require("cors");
require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

const stockUsageRoutes = require("./modules/stockUsage/stockUsage.routes");
app.use("/stock-usage", stockUsageRoutes);

app.get("/", (_, res) => res.send("Stock usage service running"));

module.exports = app;
