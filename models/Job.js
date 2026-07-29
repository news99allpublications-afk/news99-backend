// news99-backend/models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    requirements: { type: String, required: true, trim: true },
    location: { type: String, default: '', trim: true }, // New field for location
    company: { type: String, default: '', trim: true },  // New field for company
    postedBy: { type: String, required: true, trim: true }, // Admin's name or ID
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

module.exports = mongoose.model('Job', jobSchema);
