const mongoose = require("mongoose");

const dreamerApplicationSchema = new mongoose.Schema(
  {
    // Applicant information
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: String,
      default: "",
    },

    education: {
      type: String,
      default: "",
    },

    // ⭐ Most important section
    lifeDream: {
      type: String,
      required: true,
      trim: true,
    },

    dreamReason: {
      type: String,
      required: true,
      trim: true,
    },

    dreamJourney: {
      type: String,
      required: true,
      trim: true,
    },

    dreamCommitment: {
      type: String,
      required: true,
      trim: true,
    },

    // Skills and contribution
    skills: {
      type: String,
      default: "",
    },

    contribution: {
      type: String,
      default: "",
    },

    // How the person would like to work with News99
    preferredRoles: {
      type: [String],
      default: [],
    },

    otherRole: {
      type: String,
      default: "",
    },

    // Application status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    adminRemarks: {
      type: String,
      default: "",
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "DreamerApplication",
  dreamerApplicationSchema
);