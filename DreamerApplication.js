const mongoose = require("mongoose");

const dreamerApplicationSchema = new mongoose.Schema(
  {
    fullName: {
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

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    applyingFor: {
      type: String,
      enum: ["Reporter", "Marketing", "Both"],
      default: "Reporter",
    },

    education: {
      type: String,
      trim: true,
      default: "",
    },

    experience: {
      type: String,
      trim: true,
      default: "",
    },

    skills: {
      type: String,
      trim: true,
      default: "",
    },

    lifeDream: {
      type: String,
      required: true,
      trim: true,
    },

    whyNews99: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    rejectionReason: {
      type: String,
      default: "",
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