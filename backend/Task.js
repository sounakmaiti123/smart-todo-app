const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  plannedDays: Number,

  progressDays: { type: Number, default: 0 }, // ✅ how many days completed

  started: { type: Boolean, default: false },

  email: String
});

module.exports = mongoose.model("Task", taskSchema);