const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  metadataUri: { type: String, required: true },
  freelancer: { type: String, required: true },
  clientAddress: { type: String, required: true },
  escrowAmount: { type: String },
  txHash: { type: String },
  onchainJobId: { type: Number },
  latestSubmission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
  status: { type: String, default: 'funded' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', JobSchema);
