// news99-backend/controllers/reporterRequestController.js

const ReporterRequest = require("../models/ReporterRequest");
const User = require("../models/User");

// 1) User applies to become a reporter
exports.applyForReporter = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user already has a request
    const existing = await ReporterRequest.findOne({ user: userId });
    if (existing) {
      if (existing.status === "pending") {
        return res
          .status(400)
          .json({ message: "You already have a pending reporter request." });
      } else if (existing.status === "approved") {
        return res
          .status(400)
          .json({ message: "You are already approved as a reporter." });
      } else if (existing.status === "rejected") {
        // If previously rejected, you could allow reapplying or block them
        return res
          .status(400)
          .json({ message: "Your request was rejected. Please contact admin." });
      }
    }

    // NEW: Grab the extra fields from the request body
    const {
      phoneNumber = "",
      reason = "",
      experience = "",
      areaOfInterest = "",
      location= "",
    } = req.body;

    // Create a new reporter request doc
    const newRequest = new ReporterRequest({
      user: userId,
      phoneNumber,
      reason,
      experience,
      areaOfInterest,
      location,
    });
    await newRequest.save();

    res.status(201).json({
      message: "Reporter request submitted. Pending admin approval.",
      request: newRequest,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2) Admin gets all requests (or just pending, optionally)
exports.getAllReporterRequests = async (req, res) => {
  try {
    const statusFilter = req.query.status; // e.g. "/reporter-requests?status=pending"
    let query = {};
    if (statusFilter) {
      query.status = statusFilter;
    }
    // Populate user info (username, email, role)
    const requests = await ReporterRequest.find(query).populate("user", "username email role");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3) Admin approves a request
exports.approveReporterRequest = async (req, res) => {
  try {
    const { id } = req.params; // the request doc ID
    const requestDoc = await ReporterRequest.findById(id).populate("user");
    if (!requestDoc) {
      return res.status(404).json({ message: "Request not found." });
    }

    // Update the user role to 'reporter'
    const user = await User.findById(requestDoc.user._id);
    user.role = "reporter";
    await user.save();

    // Update the request status
    requestDoc.status = "approved";
    await requestDoc.save();

    res.json({
      message: "Request approved. User is now a reporter.",
      request: requestDoc,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4) Admin rejects a request
exports.rejectReporterRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const requestDoc = await ReporterRequest.findById(id).populate("user");
    if (!requestDoc) {
      return res.status(404).json({ message: "Request not found." });
    }

    // Keep user as 'user' or whatever their role was
    requestDoc.status = "rejected";
    await requestDoc.save();

    res.json({
      message: "Request rejected.",
      request: requestDoc,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 5) Admin can delete a request record (optional)
exports.deleteReporterRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ReporterRequest.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Request not found." });
    }
    res.json({ message: "Reporter request deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
