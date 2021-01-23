const express = require("express");
const app = express();
const tweetRoutes = require("./routes/TweetRoutes");
const adminRouter = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");
app.use(express.json());

app.use("/api/admin", adminRouter);
app.use("/api/superAdmin", superAdminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/tweets", tweetRoutes);

module.exports = app;
