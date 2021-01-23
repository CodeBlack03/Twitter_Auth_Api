const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require("bcrypt");
const validator = require("validator");
const Log = require("./Logs");
// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is Invalid!".red.inverse);
        }
      },
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date,
    },
    logins: [
      {
        type: Date,
        default: Date.now,
      },
    ],
    updateApproval: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email: email });

  if (!user) {
    throw new Error("Invalid email or Password");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or Password");
  }
  //Entry in Blog
  const log = {
    type: "access",
    user: user._id,
    time: user.createdAt,
    entry: `User ${user.name} logged in`,
    request: "Login",
    status: 200,
  };
  await log.save();
  return user;
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  //Entry in Blog

  next();
});
userSchema.post("save", async function (next) {
  const user = this;

  const l = {
    type: "access",
    user: user._id,
    time: user.createdAt,
    entry: `User ${user.name} created an account`,
    request: "SignUp",
    status: 201,
  };
  const log = new Log(l);
  await log.save();
});
userSchema.pre("remove", async function (next) {
  const user = this;
  const l = {
    type: "audit",
    user: user._id,
    time: user.createdAt,
    entry: `User ${user.name} deleted the account`,
    request: "Delete",
    status: 200,
  };
  const log = new Log(l);

  await log.save();
});
const User = mongoose.model("User", userSchema);

module.exports = User;
