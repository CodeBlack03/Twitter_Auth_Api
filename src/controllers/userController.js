const express = require("express");
const factory = require("./factory");
const User = require("../models/Users");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const jwt = require("jsonwebtoken");
exports.getUsers = factory.getAll(User);
exports.getUserById = factory.getOne(User);
exports.UpdateUser = factory.updateOne(User);
exports.DeleteUser = factory.deleteOne(User);
exports.CreateUser = factory.createOne(User);

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_TOKEN_SECRET, {
    expiresIn: process.env.JWT_TOKEN_EXPIRES,
  });
};

const createSendToken = (status, user, req, res) => {
  const token = signToken(user._id);
  const options = {
    expiresIn: Date.now() * 30 * 24 * 30 * 30 * 1000,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res.status(status).cookie("token", token, options);
  user.password = undefined;

  res.status(status).json({
    token,
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    isSuperAdmin: user.isSuperAdmin,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return next(new AppError("User already exists"));
  }
  user = await User.create(req.body);

  createSendToken(201, user, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const user = await User.findByCredentials(req.body.email, req.body.password);
  if (!user) {
    return next(new AppError("No user Found!", 404));
  }
  createSendToken(200, user, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookie.token) {
    token = req.cookie.token;
  }
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new AppError("User belonging to this token no longer exists", 401)
    );
  }
  req.user = user;
  req.token = token;
  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  let user = await User.findByCredentials(
    req.user.email,
    req.body.currentPassword
  );
  if (!user) {
    return next(new AppError("Current password is invalid!", 400));
  }
  // if (req.body.newPassword !== req.body.confirmNewPassword) {
  //   return next(new AppError("Password does not match", 400));
  // }
  user.password = req.body.newPassword;

  await user.save();
  createSendToken(200, user, req, res);
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email"];
  const isValidOperation = updates.every((update) =>
    update !== "id" ? allowedUpdates.includes(update) : true
  ); //Update allowed or not
  if (!isValidOperation) {
    return res.status(400).send({
      error: "Invalid Updates!",
    });
  }

  updates.forEach((update) => {
    req.user[update] = req.body[update];
  });
  const l = {
    type: "audit",
    user: req.user._id,
    time: req.user.createdAt,
    entry: `User ${req.user.name} updated profile`,
    request: "UserUpdate",
    status: 200,
  };
  const log = new Log(l);

  await log.save();
  await req.user.save();
  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    //isAdmin: req.user.isAdmin,
  });
});

exports.getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
    });
  } else {
    return next(new AppError("User not found", 404));
  }
});
exports.deleteProfile = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.user._id);
  if (!user) {
    return next(new AppError("User not found", 404));
  } else {
    res.json("Profile Successfully Deleted");
  }
});

exports.restrictTo = (user) =>
  catchAsync(async (req, res, next) => {
    if (
      (user === "Admin" && !req.user.isAdmin) ||
      (user === "SuperAdmin" && !req.user.isSuperAdmin)
    ) {
      return next(new AppError("You are not authorized for this request", 401));
    }
    next();
  });
