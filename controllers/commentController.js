// news99-backend/controllers/commentController.js

const Comment = require("../models/Comment");
const News = require("../models/News");

// POST /news/:newsId/comments => create a new comment
exports.createComment = async (req, res) => {
  try {
    const { newsId } = req.params;
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }
    // Check if the news item is approved or user is admin/reporter
    const newsItem = await News.findById(newsId);
    if (!newsItem) {
      return res.status(404).json({ message: "News not found" });
    }
    // optionally ensure it's "approved" or user is author/admin
    // otherwise maybe we don't allow comment on unapproved news.

    const comment = new Comment({
      newsId,
      userId: req.user.id, // from token
      text
    });
    await comment.save();
    res.status(201).json({ message: "Comment added", comment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /news/:newsId/comments => fetch comments
exports.getComments = async (req, res) => {
  try {
    const { newsId } = req.params;
    const comments = await Comment.find({ newsId })
      .sort({ createdAt: -1 })
      .populate("userId", "username email"); // get user info
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
