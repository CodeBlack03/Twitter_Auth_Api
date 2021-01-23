const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
const tweetSchema = new mongoose.Schema(
  {
    tweet: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
tweetSchema.pre("save", async function (next) {
  const tweet = this;
  const l = {
    type: "action",
    user: req.user._id,
    time: Date.now,
    request: "PostTweet",
    status: 201,
  };
  const log = new Log(l);

  await log.save();
  next();
});

tweetSchema.pre("remove", async function (next) {
  const l = {
    type: "audit",
    user: req.user._id,
    time: Date.now,
    request: "PostDelete",
    status: 200,
  };
  const log = new Log(l);

  await log.save();
});

//Export the model
module.exports = mongoose.model("Tweet", tweetSchema);
