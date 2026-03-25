const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");

// Create task
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      userId: req.user.id,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to create task" });
  }
});

// Get analytics/stats
router.get("/stats", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "Done").length;
    const pending = total - completed;

    res.json({
      total,
      completed,
      pending,
      completionRate: total ? (completed / total) * 100 : 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
});

// Filter and search tasks
router.get("/search", auth, async (req, res) => {
  try {
    const { status, priority, title } = req.query;

    const filter = { userId: req.user.id };

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Search failed" });
  }
});

// Get all tasks
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// Update task
router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to update task" });
  }
});

// Delete task
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task" });
  }
});

module.exports = router;