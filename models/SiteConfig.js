const mongoose = require("mongoose");

const SiteConfigSchema = new mongoose.Schema(
  {
    heroImage: {
      type: String,
      default: "https://via.placeholder.com/1200x500",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteConfig", SiteConfigSchema);
