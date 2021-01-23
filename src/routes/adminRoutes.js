const express = require("express");
const User = require("../models/Users");
const userController = require("../controllers/userController");
const adminController = require("../controllers/adminController");
const router = express.Router();
const advancedResults = require("../middleware/advancedResults");

router
  .route("/users")
  .post(
    userController.protect,

    adminController.CreateUser
  )
  .get(userController.protect, advancedResults(User), adminController.getUsers)
  .patch(userController.protect, adminController.updateUser)
  .delete(userController.protect, adminController.DeleteUser);

router
  .route("/tweets/:id")
  .patch(userController.protect, adminController.updateTweets);

module.exports = router;
