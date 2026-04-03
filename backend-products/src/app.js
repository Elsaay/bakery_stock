const express = require("express");
const cors = require("cors");
require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

const productsRoutes = require("./modules/products/products.routes");
app.use("/products", productsRoutes);

app.get("/", (_, res) => res.send("Products service running"));

module.exports = app;
