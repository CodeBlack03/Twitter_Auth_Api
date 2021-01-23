const express = require("express");
const Tweet = require("../models/Tweets");
const userController = require("../controllers/userController");
const tweetController = require("../controllers/tweetsController");
const router = express.Router();

router
  .route("/")
  .post(userController.protect, tweetController.createTweet)
  .get(userController.protect, tweetController.getMyTweets);

router
  .route("/:id")
  .get(userController.protect, tweetController.getTweetById)
  .patch(userController.protect, tweetController.updateTweet)
  .delete(userController.protect, tweetController.deleteTweet);

module.exports = router;
