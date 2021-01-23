const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const User = require("../models/Users");
exports.getAll = (Model, populate) => {
  return catchAsync(async (req, res, next) => {
    //console.log("aya");
    res.send(res.advancedResults);
  });
};

exports.getOne = (Model, populate) => {
  return catchAsync(async (req, res, next) => {
    const document = Model.findById(req.params.id).populate(populate);
    const object = await document;

    if (!object) {
      return next(new AppError("No document found!", 404));
    }
    if (object.password) {
      object.password = undefined;
    }
    res.status(200).json(object);
  });
};

exports.updateOne = (Model, populate) => {
  return catchAsync(async (req, res, next) => {
    if (req.body.password) {
      return next(
        new AppError("You are not allowed to change the password", 400)
      );
    }

    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!document) {
      return next(new AppError(`No ${Model} found`, 404));
    }

    if (document.password) {
      document.password = undefined;
    }
    res.status(200).json(document);
  });
};

exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    if (req.body.user) {
      let isPresent = await Model.findOne(req.body.user.email);
      if (isPresent) {
        return next(new AppError(`${Model} already present`, 400));
      }
    }

    const document = new Model(req.body);

    await document.save();
    if (document.password) {
      document.password = undefined;
    }
    res.status(201).json(document);
  });
};

exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const document = await Model.findById(req.params.id);
    if (!document) {
      return next(new AppError(`No ${Model} found!`, 404));
    }
    await document.remove();
    res.json({ message: `${Model} Removed` });
  });
};
