const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
const logSchema = new mongoose.Schema(
  {
    type: {
      type: String,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    entry: {
      type: String,
    },
    time: {
      type: Date,
    },
    request: {
      type: String,
    },
    status: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Log", logSchema);
