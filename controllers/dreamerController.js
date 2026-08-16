const DreamerApplication = require("../models/DreamerApplication");

// ----------------------------------
// SUBMIT DREAMER APPLICATION
// ----------------------------------
exports.createDreamerApplication = async (req, res) => {
  try {
    const {
      fullName,
      mobile,
      email,
      city,
      state,
      age,
      education,
      lifeDream,
      dreamReason,
      dreamJourney,
      dreamCommitment,
      skills,
      contribution,
      preferredRoles,
      otherRole,
    } = req.body;

    // Required fields
    if (
      !fullName ||
      !mobile ||
      !email ||
      !city ||
      !state ||
      !lifeDream ||
      !dreamReason ||
      !dreamJourney ||
      !dreamCommitment
    ) {
      return res.status(400).json({
        message: "Please fill all required fields.",
      });
    }

    const application = new DreamerApplication({
      fullName,
      mobile,
      email,
      city,
      state,
      age,
      education,
      lifeDream,
      dreamReason,
      dreamJourney,
      dreamCommitment,
      skills,
      contribution,
      preferredRoles: Array.isArray(preferredRoles)
        ? preferredRoles
        : [],
      otherRole,
    });

    await application.save();

    res.status(201).json({
      message:
        "Your Dreamer application has been submitted successfully. Our team will review your application.",
      application,
    });
  } catch (err) {
    console.error("Dreamer application error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};

// ----------------------------------
// ADMIN - GET ALL DREAMER APPLICATIONS
// ----------------------------------
exports.getAllDreamerApplications = async (req, res) => {
  try {
    const applications = await DreamerApplication.find().sort({
      createdAt: -1,
    });

    res.json(applications);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// ----------------------------------
// ADMIN - GET ONE APPLICATION
// ----------------------------------
exports.getDreamerApplicationById = async (req, res) => {
  try {
    const application = await DreamerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Dreamer application not found.",
      });
    }

    res.json(application);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// ----------------------------------
// ADMIN - APPROVE DREAMER
// ----------------------------------
exports.approveDreamerApplication = async (req, res) => {
  try {
    const application = await DreamerApplication.findById(
      req.params.id
    );

    if (!application) {
      return res.status(404).json({
        message: "Dreamer application not found.",
      });
    }

    application.status = "approved";
    application.adminRemarks = req.body.adminRemarks || "";
    application.reviewedAt = new Date();

    await application.save();

    res.json({
      message: "Dreamer application approved successfully.",
      application,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// ----------------------------------
// ADMIN - REJECT DREAMER
// ----------------------------------
exports.rejectDreamerApplication = async (req, res) => {
  try {
    const application = await DreamerApplication.findById(
      req.params.id
    );

    if (!application) {
      return res.status(404).json({
        message: "Dreamer application not found.",
      });
    }

    application.status = "rejected";
    application.adminRemarks = req.body.adminRemarks || "";
    application.reviewedAt = new Date();

    await application.save();

    res.json({
      message: "Dreamer application rejected.",
      application,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// ----------------------------------
// ADMIN - DELETE APPLICATION
// ----------------------------------
exports.deleteDreamerApplication = async (req, res) => {
  try {
    const application = await DreamerApplication.findByIdAndDelete(
      req.params.id
    );

    if (!application) {
      return res.status(404).json({
        message: "Dreamer application not found.",
      });
    }

    res.json({
      message: "Dreamer application deleted successfully.",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};