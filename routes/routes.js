// news99-backend/routes.js

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const User = require("../models/User");
const Job = require("../models/Job");
const Article = require("../models/Article");
const JobApplication = require("../models/JobApplication");
const Message = require("../models/Message");

const {
  getJobs,
  addJob,
  applyForJob,
  applyForJobWithFile,
  getAllApplications,
  updateApplicationStatus,
  deleteApplication,
} = require("../controllers/jobController");

const {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
  approveNews,
  rejectNews,
  getMySubmissions,
  getAllNewsAdmin,
} = require("../controllers/newsController");

const {
  applyForReporter,
  getAllReporterRequests,
  approveReporterRequest,
  rejectReporterRequest,
  deleteReporterRequest,
} = require("../controllers/reporterRequestController");

const {
  createTask,
  getAllTasks,
  updateTaskStatus,
  deleteTask,
  getReporterTasks,
  updateTaskByReporter,
} = require("../controllers/taskController");

const { createComment, getComments } = require("../controllers/commentController");

const SiteConfig = require("../models/SiteConfig");
const upload = require("../uploads/multerConfig");
require("dotenv").config();

const router = express.Router();

// ----------------------------------
// MIDDLEWARES
// ----------------------------------
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

const verifyReporter = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.user.role === "reporter" || req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Access denied. Reporters or Admins only." });
};

// Allows a token but doesn't require it, e.g. for public news access
function optionalVerifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // ignore invalid token
    }
  }
  next();
}

// ----------------------------------
// USER AUTH ROUTES
// ----------------------------------
router.post("/register", async (req, res) => {
  const { username, email, password, role = "reporter", bio = "" } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, role, bio });
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully.",
      user: { id: newUser._id, username, email, role },
    });
  } catch (err) {
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: "Login successful.",
      token,
      role: user.role,
      userId: user._id,
      username: user.username,
    });
  } catch (err) {
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: `Failed to fetch user profile: ${err.message}` });
  }
});

// ----------------------------------
// ADMIN ROUTES
// ----------------------------------
router.get("/admin/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "username email role");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: `Failed to fetch users: ${err.message}` });
  }
});

router.get("/admin/jobs", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const jobs = await Job.find({}, "title company createdAt");
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: `Failed to fetch jobs: ${err.message}` });
  }
});

router.put("/admin/jobs/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, description, requirements, postedBy, location, company } = req.body;
    if (!title || !description || !requirements || !postedBy || !location || !company) {
      return res.status(400).json({
        message:
          "All fields (title, description, requirements, location, company, postedBy) are required"
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { title, description, requirements, postedBy, location, company },
      { new: true }
    );
    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found." });
    }
    res.status(200).json(updatedJob);
  } catch (err) {
    res.status(500).json({ message: `Failed to update job: ${err.message}` });
  }
});

router.delete("/admin/jobs/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }
    res.status(200).json({ message: "Job deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: `Failed to delete job: ${err.message}` });
  }
});

router.get("/admin/applications", verifyToken, verifyAdmin, getAllApplications);
router.put("/admin/applications/:id", verifyToken, verifyAdmin, updateApplicationStatus);
router.delete("/admin/applications/:id", verifyToken, verifyAdmin, deleteApplication);

// Reporter Requests
// Note: the user can pass phoneNumber, reason, experience, areaOfInterest, etc. in the body
router.post("/apply-reporter", verifyToken, async (req, res) => {
  if (req.user.role !== "user") {
    return res
      .status(400)
      .json({ message: "Only users can apply to become a reporter." });
  }
  applyForReporter(req, res);
});

router.get("/admin/reporter-requests", verifyToken, verifyAdmin, getAllReporterRequests);
router.patch("/admin/reporter-requests/:id/approve", verifyToken, verifyAdmin, approveReporterRequest);
router.patch("/admin/reporter-requests/:id/reject", verifyToken, verifyAdmin, rejectReporterRequest);
router.delete("/admin/reporter-requests/:id", verifyToken, verifyAdmin, deleteReporterRequest);

// Admin news route to get all news submissions (pending, approved, rejected)
router.get("/admin/news", verifyToken, verifyAdmin, getAllNewsAdmin);

// ----------------------------------
// JOB ROUTES
// ----------------------------------
router.get("/jobs", getJobs);
router.post("/jobs", verifyToken, verifyAdmin, addJob);
router.post("/jobs/:id/apply", verifyToken, applyForJob);
router.post("/jobs/:id/apply-file", verifyToken, upload.single("resumeFile"), applyForJobWithFile);

// ----------------------------------
// ARTICLE ROUTES
// ----------------------------------
router.get("/articles", async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/articles", verifyToken, async (req, res) => {
  const { title, content, category } = req.body;
  try {
    const article = new Article({
      title,
      content,
      category,
      author: req.user.id,
    });
    const savedArticle = await article.save();
    res.status(201).json({
      message: "Article created",
      article: savedArticle
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------------------------
// NEWS ROUTES
// ----------------------------------
router.get("/news", getAllNews);
router.get("/news/my-submissions", verifyToken, verifyReporter, getMySubmissions);
router.get("/news/:id", optionalVerifyToken, getNewsById);

// Accept image and video in form-data
router.post(
  "/news",
  verifyToken,
  verifyReporter,
  upload.fields([{ name: "image" }, { name: "video" }]),
  createNews
);

router.put(
  "/news/:id",
  verifyToken,
  verifyAdmin,
  upload.fields([{ name: "image" }, { name: "video" }]),
  updateNews
);

router.delete("/news/:id", verifyToken, verifyAdmin, deleteNews);
router.patch("/news/:id/approve", verifyToken, verifyAdmin, approveNews);
router.patch("/news/:id/reject", verifyToken, verifyAdmin, rejectNews);

// ----------------------------------
// COMMENTS
// ----------------------------------
router.post("/news/:newsId/comments", verifyToken, createComment);
router.get("/news/:newsId/comments", getComments);

// ----------------------------------
// TASK ROUTES
// ----------------------------------
router.post("/admin/tasks", verifyToken, verifyAdmin, createTask);
router.get("/admin/tasks", verifyToken, verifyAdmin, getAllTasks);
router.put("/admin/tasks/:id", verifyToken, verifyAdmin, updateTaskStatus);
router.delete("/admin/tasks/:id", verifyToken, verifyAdmin, deleteTask);

// Reporter can get or update tasks
router.get("/reporter/tasks", verifyToken, verifyReporter, getReporterTasks);
router.put("/reporter/tasks/:id", verifyToken, verifyReporter, updateTaskByReporter);

// ----------------------------------
// SITE CONFIG
// ----------------------------------
router.get("/site-config", async (req, res) => {
  try {
    let config = await SiteConfig.findOne({});
    if (!config) {
      config = await SiteConfig.create({});
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put(
  "/site-config",
  verifyToken,
  verifyAdmin,
  upload.single("heroImage"),
  async (req, res) => {
    const heroImagePath = req.file ? `/uploads/${req.file.filename}` : req.body.heroImage;
    try {
      let config = await SiteConfig.findOne({});
      if (!config) {
        config = await SiteConfig.create({ heroImage: heroImagePath });
      } else {
        config.heroImage = heroImagePath;
        await config.save();
      }
      res.json(config);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ----------------------------------
// CATEGORIES
// ----------------------------------
router.get("/categories", (req, res) => {
  const categories = [
    "National",
    "International",
    "Business",
    "Sports",
    "Entertainment",
    "Technology",
    "General"
  ];
  res.json(categories);
});

// ----------------------------------
// CONTACT FORM
// ----------------------------------
router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }
  try {
    const newMsg = new Message({ name, email, message });
    await newMsg.save();
    res.status(201).json({ message: "Your message has been received." });
  } catch (err) {
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

// ----------------------------------
// ADMIN MESSAGES
// ----------------------------------
router.get("/admin/messages", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res
      .status(500)
      .json({ message: `Failed to fetch messages: ${err.message}` });
  }
});

router.delete("/admin/messages/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const msg = await Message.findByIdAndDelete(req.params.id);
    if (!msg) {
      return res.status(404).json({ message: "Message not found." });
    }
    res.json({ message: "Message deleted successfully." });
  } catch (err) {
    res
      .status(500)
      .json({ message: `Failed to delete message: ${err.message}` });
  }
});

module.exports = router;
