const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  plannedDays: Number,

  progressDays: { type: Number, default: 0 },

  started: { type: Boolean, default: false },

  email: String,

  // 🔥 REQUIRED
  completedDates: { type: [String], default: [] }
  
});

module.exports = mongoose.model("Task", taskSchema);