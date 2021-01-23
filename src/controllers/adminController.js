const express = require("express");
const factory = require("./factory");
const User = require("../models/Users");
const catchAsync = require("../utils/catchAsync");
const superAdmin = require("./superAdminController");
const AppError = require("../../../Bonny-Basket/backend/utils/AppError");
exports.getUsers = factory.getAll(User);
exports.getUserById = factory.getOne(User);
exports.DeleteUser = factory.deleteOne(User);
exports.CreateUser = factory.createOne(User);

exports.updateUser = catchAsync(async (req, res, next) => {
  const updates = req.body;
  await superAdmin.approveUpdates(req.user);

  const user = await User.findById(req.body.id);
  if (user) {
    const l = {
      type: "action",
      user: req.user._id,
      time: Date.now,
      entry: `Admin ${req.user.name} requested an update of user ${user.name}`,
      request: `AdminUpdateUser`,
      status: 200,
    };
    const log = new Log(l);

    await log.save();
    if (req.user.approval) {
      req.user.approval = false;
      if (req.body.password) {
        return next(
          new AppError("You are not allowed to change the password", 400)
        );
      }

      const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!user) {
        return next(new AppError(`No ${User} found`, 404));
      }

      if (user.password) {
        user.password = undefined;
      }

      res.status(200).json(user);
    } else {
      return next(
        new AppError("Super Admin didn't authorize you for this action")
      );
    }
  }
});

exports.updateTweets = catchAsync(async (req, res, next) => {
  const updates = req.body;
  superAdmin.approveUpdates(updates);
  const tweetStored = await Tweet.findById(req.params.id);
  if (tweetStored) {
    const l = {
      type: "action",
      user: req.user._id,
      time: Date.now,
      entry: `Admin ${req.user.name} requested an update of tweet ${tweetStored.tweet}`,
      request: `AdminUpdateTweet`,
      status: 200,
    };
    const log = new Log(l);

    await log.save();
    if (req.user.approval) {
      req.user.approval = false;
      const tweet = await Tweet.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      res.status(200).json(tweet);
    } else {
      return next(
        new AppError("Super Admin didn't authorize you for this action")
      );
    }
    res.json(tweet);
  }
});
