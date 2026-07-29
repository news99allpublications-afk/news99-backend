const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicantName: { type: String, required: true, trim: true },
    applicantEmail: { type: String, required: true, trim: true },
    resume: { type: String, required: true }, // Link or path to the uploaded resume file
    status: { type: String, default: 'Pending' }, // Status: Pending, Approved, Rejected
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
