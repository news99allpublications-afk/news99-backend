// news99-backend/models/ReporterRequest.js

const mongoose = require("mongoose");

const reporterRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true // so each user can only have one request at a time
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },

    // NEW FIELDS for user-submitted details:
    phoneNumber: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      default: ""
    },
    experience: {
      type: String,
      default: ""
    },
    areaOfInterest: {
      type: String,
      default: ""
    },
    location: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReporterRequest", reporterRequestSchema);
