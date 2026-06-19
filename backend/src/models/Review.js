const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
  decision: { type: String },
  confidence: { type: Number },
  reason: { type: String },
  automated: { type: Boolean, default: true },
  notes: { type: String },
  reviewer: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', ReviewSchema);
