const express = require("express");
const router = express.Router();

const productsController = require("./products.controller");


router.get("/", productsController.getAllProducts);

router.post("/", productsController.createProduct);


router.delete("/:id", productsController.deleteProduct);

router.put("/:id", productsController.updateProduct);

module.exports = router;
