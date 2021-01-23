const express = require("express");
const AppError = require("../utils/AppError");
const Tweet = require("../models/Tweets");
const catchAsync = require("../utils/catchAsync");
exports.createTweet = catchAsync(async (req, res, next) => {
  const tweet = new Tweet(req.body);
  tweet.user = req.user._id;
  const l = {
    type: "audit",
    user: req.user._id,
    time: Date.now,
    entry: `User ${req.user.name} tweets ${tweet.tweet}`,
    request: `TweetPost`,
    status: 201,
  };
  const log = new Log(l);

  await log.save();
  await tweet.save();
  res.status(201).json(tweet);
});

exports.updateTweet = catchAsync(async (req, res, next) => {
  const tweet = await Tweet.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  const l = {
    type: "audit",
    user: req.user._id,
    time: Date.now,
    entry: `User ${req.user.name} updated tweet ${tweet.tweet}`,
    request: `TweetUpdate`,
    status: 200,
  };
  const log = new Log(l);

  await log.save();
  res.status(200).json(tweet);
});

exports.getTweetById = catchAsync(async (req, res, next) => {
  const tweet = await Tweet.findById(req.params.id);
  res.status(200).json(tweet);
});
exports.getMyTweets = catchAsync(async (req, res, next) => {
  const tweets = await Tweet.find(req.user._id);
  if (!tweets) {
    return next(new AppError("No tweets Found!", 404));
  }

  res.status(200).json(tweets);
});
exports.deleteTweet = catchAsync(async (req, res, next) => {
  const tweet = await Tweet.findById(req.params.id);
  const l = {
    type: "audit",
    user: req.user._id,
    time: Date.now,
    entry: `User ${req.user.name} deleted tweet ${tweet.tweet}`,
    request: `TweetDelete`,
    status: 200,
  };
  const log = new Log(l);

  await log.save();
  await tweet.remove();
  res.status(200).json("Tweet Successfully Deleted");
});
