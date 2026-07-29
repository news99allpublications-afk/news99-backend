// news99-backend/controllers/newsController.js

const News = require("../models/News");
const User = require("../models/User");

// 1) Create a news item (REPORTER or ADMIN), handling both image & video
exports.createNews = async (req, res) => {
  try {
    const { title, description, category, youtubeLink } = req.body;
    const authorId = req.user.id;

    // Basic validation
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required." });
    }

    // If admin => auto-approve; otherwise pending
    const status = req.user.role === "admin" ? "approved" : "pending";

    // If an image was uploaded, store its path
    const imageFile =
      req.files && req.files.image && req.files.image[0]
        ? `/uploads/${req.files.image[0].filename}`
        : "";

    // If a video was uploaded, store its path
    const videoFile =
      req.files && req.files.video && req.files.video[0]
        ? `/uploads/${req.files.video[0].filename}`
        : "";

    // Create & save the new news doc
    const newsItem = new News({
      title,
      description,
      author: authorId,
      category: category || "General",
      youtubeLink: youtubeLink || "",
      image: imageFile,
      video: videoFile,
      status,
    });

    const savedNews = await newsItem.save();
    res.status(201).json({
      message: "News submitted successfully.",
      news: savedNews,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2) Return only approved news to the public
exports.getAllNews = async (req, res) => {
  const { category } = req.query;
  try {
    const query = category
      ? { category, status: "approved" }
      : { status: "approved" };

    const news = await News.find(query)
      .sort({ createdAt: -1 })
      .populate("author", "username email");
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3) Get a single news item by ID
exports.getNewsById = async (req, res) => {
  try {
    const newsItem = await News.findById(req.params.id).populate(
      "author",
      "username email"
    );
    if (!newsItem) {
      return res.status(404).json({ message: "News item not found." });
    }

    // If it’s approved, anyone can view it
    if (newsItem.status === "approved") {
      return res.json(newsItem);
    }

    // Otherwise only admin or the author can view
    if (
      req.user &&
      (req.user.role === "admin" ||
        String(newsItem.author._id) === String(req.user.id))
    ) {
      return res.json(newsItem);
    }

    return res
      .status(403)
      .json({ message: "You don't have permission to view this news item." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4) Update a news item (admin only), handling both image & video
exports.updateNews = async (req, res) => {
  try {
    const { title, description, category, youtubeLink } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required." });
    }

    // Find the existing doc
    const newsItem = await News.findById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ message: "News item not found." });
    }

    // Update text fields
    newsItem.title = title;
    newsItem.description = description;
    newsItem.category = category || "General";
    newsItem.youtubeLink = youtubeLink || newsItem.youtubeLink;

    // If new image was uploaded
    if (req.files && req.files.image && req.files.image[0]) {
      newsItem.image = `/uploads/${req.files.image[0].filename}`;
    }
    // If new video was uploaded
    if (req.files && req.files.video && req.files.video[0]) {
      newsItem.video = `/uploads/${req.files.video[0].filename}`;
    }

    const updatedNews = await newsItem.save();
    res.json(updatedNews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 5) Delete news (admin only)
exports.deleteNews = async (req, res) => {
  try {
    const deletedNews = await News.findByIdAndDelete(req.params.id);
    if (!deletedNews) {
      return res.status(404).json({ message: "News item not found." });
    }
    res.json({ message: "News item deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 6) Approve pending news
exports.approveNews = async (req, res) => {
  try {
    const newsId = req.params.id;
    const newsItem = await News.findById(newsId);
    if (!newsItem) {
      return res.status(404).json({ message: "News item not found." });
    }
    newsItem.status = "approved";
    // Clear any previous rejection reason
    newsItem.rejectionReason = "";
    await newsItem.save();

    res.json({
      message: "News item approved successfully.",
      news: newsItem,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 7) Reject news
exports.rejectNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    if (!rejectionReason) {
      return res
        .status(400)
        .json({ message: "Rejection reason is required." });
    }

    const newsItem = await News.findById(id);
    if (!newsItem) {
      return res.status(404).json({ message: "News item not found." });
    }
    newsItem.status = "rejected";
    newsItem.rejectionReason = rejectionReason;
    await newsItem.save();

    res.json({
      message: "News item rejected.",
      news: newsItem,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 8) Return all news from the current reporter
exports.getMySubmissions = async (req, res) => {
  try {
    const reporterId = req.user.id;
    const myNews = await News.find({ author: reporterId })
      .sort({ createdAt: -1 })
      .populate("author", "username email");
    res.json(myNews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 9) Return ALL news (for admin use)
exports.getAllNewsAdmin = async (req, res) => {
  try {
    const news = await News.find().populate("author", "username email");
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
