const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

const Task = require("./Task");
const User = require("./User");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));


// ================= ROUTES ================= //

// Home Route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// 🔐 AUTH ROUTES

// Signup
app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.json({ success: false, message: "User already exists" });
    }

    const user = new User({ email, password });
    await user.save();

    res.json({ success: true });
  } catch (err) {
    res.json({ success: false });
  }
});


// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });

    if (user) {
      res.json({ success: true, user });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    res.json({ success: false });
  }
});

// 📋 TASK ROUTES

// Add Task
app.post("/add-task", async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Tasks
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Task
app.put("/task/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accuracy
app.get("/accuracy", async (req, res) => {
  try {
    const email = req.query.email;

    const tasks = await Task.find({ email });

    const total = tasks.length;

    const onTime = tasks.filter(t => t.completedOnTime === true).length;

    const accuracy = total === 0 ? 0 : (onTime / total) * 100;

    res.json({ accuracy: accuracy.toFixed(2) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/task/:id/progress", async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (task.progressDays < task.plannedDays) {
    task.progressDays += 1;
    await task.save();
  }

  res.json(task);
});
// ================= SERVER ================= //

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});