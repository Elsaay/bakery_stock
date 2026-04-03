const express = require("express");
const router = express.Router();

const stockUsageController = require("./stockUsage.controller");


router.post("/", stockUsageController.useStock);

module.exports = router;
