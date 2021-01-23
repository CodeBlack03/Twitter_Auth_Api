const express = require("express");
const User = require("../models/Users");
const userController = require("../controllers/userController");
const router = express.Router();

router.route("/signup").post(userController.signUp);
router.route("/login").post(userController.login);
router
  .route("/profile")
  .get(userController.protect, userController.getProfile)
  .patch(userController.protect, userController.updateProfile)
  .delete(userController.protect, userController.deleteProfile);

module.exports = router;
