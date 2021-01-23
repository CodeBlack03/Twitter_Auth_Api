const express = require("express");
const userController = require("../controllers/userController");
const superAdminController = require("../controllers/superAdminController");
const Log = require("../models/Logs");
const advancedResults = require("../middleware/advancedResults");
const router = express.Router();

router
  .route("/getInsights")
  .get(
    userController.protect,
    advancedResults(Log),
    superAdminController.getInsights
  );

router
  .route("/adminPostRequestCount")
  .get(userController.protect, superAdminController.getAdminPostRequestCount);

router
  .route("/postFrequency")
  .get(userController.protect, superAdminController.getPostFrequency);

module.exports = router;
