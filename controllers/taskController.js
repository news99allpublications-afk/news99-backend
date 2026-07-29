const Task = require("../models/Task");

// Admin creates a new task for a reporter
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo } = req.body;
    if (!title || !assignedTo) {
      return res.status(400).json({ message: "Title and assignedTo are required." });
    }
    const newTask = await Task.create({ title, description, assignedTo });
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin gets all tasks (to manage them)
exports.getAllTasks = async (req, res) => {
  try {
    // Populate to see which reporter is assigned
    const tasks = await Task.find().populate("assignedTo", "username email");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin updates task status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("assignedTo", "username email");

    if (!updated) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin can delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Task.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reporter fetches only tasks assigned to them
exports.getReporterTasks = async (req, res) => {
  try {
    const reporterId = req.user.id;
    const tasks = await Task.find({ assignedTo: reporterId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reporter updates the status of a task assigned to them
exports.updateTaskByReporter = async (req, res) => {
  try {
    const reporterId = req.user.id;   // from verifyReporter
    const { id } = req.params;        // Task ID
    const { status } = req.body;      // e.g. "in-progress" or "completed"

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Ensure the reporter is the one assigned to this task
    if (task.assignedTo.toString() !== reporterId) {
      return res.status(403).json({ message: "This task is not assigned to you." });
    }

    task.status = status;
    await task.save();

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
