const express = require("express");
const catchAsync = require("../utils/catchAsync");
const factory = require("./factory");
const Log = require("../models/Logs");
exports.approveUpdates = (user) => {
  return catchAsync(async (req, res, next) => {
    //console.log(updates);
    if (req.body.approval) {
      const l = {
        type: "audit",
        user: req.user._id,
        time: Date.now,
        entry: `Super Admin ${req.user.name} approved the update request of admin ${user.name}`,
        request: "AdminUpdate",
        status: 200,
      };
      const log = new Log(l);

      await log.save();
      user.approval = true;
      res.json("Request Approved");
    }
  });
};
exports.getPostFrequency = catchAsync(async (req, res, next) => {
  const user = req.body._id;
  let reqQuery = { ...req.query, user };
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  let timeframe = 1;
  if (req.query.length > 0) {
    timeframe = req.query.gte - req.query.lte;
  }

  ////console.log(JSON.parse(queryStr));
  //.log(timeframe);
  let query = await Log.find(JSON.parse(queryStr));
  //console.log(query.length);
  res.json(query.length / timeframe);
});

exports.getAdminPostRequestCount = catchAsync(async (req, res, next) => {
  const content = req.body;
  let reqQuery = { ...req.query, content, request: "PATCH" };
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  const query = Log.find(JSON.parse(queryStr));
  res.json(`Admin ${user.name} has total ${query.length} requests.`);
});

exports.getInsights = factory.getAll(Log);
