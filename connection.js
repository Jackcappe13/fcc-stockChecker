const mongoose = require("mongoose");
const uri = process.env.MONGO_URI;

mongoose
  .connect(uri)
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log("Database connection error:", err));

module.exports = mongoose;
