// Controllers for job flows
const Job = require('../models/Job');
const Submission = require('../models/Submission');
const Review = require('../models/Review');
const aiService = require('../services/aiService');
const contractService = require('../services/contractService');

// Create a job record in DB. Actual on-chain funding should be done by front-end calling the contract.
exports.createJob = async (req, res) => {
  try {
    const { title, metadataUri, freelancer, clientAddress, escrowAmount, txHash } = req.body;
    const job = await Job.create({ title, metadataUri, freelancer, clientAddress, escrowAmount, txHash });
    return res.status(201).json(job);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create job' });
  }
};

exports.getJobs = async (req, res) => {
  const jobs = await Job.find().lean();
  res.json(jobs);
};

exports.getJobById = async (req, res) => {
  const id = req.params.id;
  const job = await Job.findById(id).lean();
  if (!job) return res.status(404).json({ error: 'Not found' });
  res.json(job);
};

// Freelancer submits work; triggers AI review
exports.submitWork = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { submissionUri, freelancerAddress } = req.body;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Save submission
    const submission = await Submission.create({ job: job._id, submissionUri, freelancerAddress });

    // Update job
    job.latestSubmission = submission._id;
    job.status = 'submitted';
    await job.save();

    // Call AI review
    const aiResult = await aiService.review(job.metadataUri, submissionUri);

    // Save review
    const review = await Review.create({ job: job._id, submission: submission._id, decision: aiResult.decision, confidence: aiResult.confidence, reason: aiResult.reason, automated: true });

    // Act based on AI decision
    if (aiResult.decision === 'APPROVED') {
      // Call contract to release funds - contractService wraps ethers.js
      if (contractService.canAct()) {
        await contractService.releasePayment(job.chainJobId || job.onchainJobId);
      }
      job.status = 'approved';
      await job.save();
    } else if (aiResult.decision === 'REJECTED') {
      job.status = 'rejected';
      await job.save();
    } else {
      // UNCERTAIN -> escalate
      job.status = 'escalated';
      await job.save();
    }

    return res.json({ submission, review, aiResult });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to submit work' });
  }
};

// Manual escalation endpoint (caller would be client or freelancer)
exports.escalate = async (req, res) => {
  try {
    const id = req.params.id;
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    job.status = 'escalated';
    await job.save();

    // Optionally, call on-chain escalateDispute if front-end didn't
    if (contractService.canAct()) {
      await contractService.escalateDispute(job.onchainJobId);
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to escalate' });
  }
};

// Human reviewer resolves case
exports.humanReview = async (req, res) => {
  try {
    const id = req.params.id;
    const { approve, reviewerAddress, notes } = req.body;
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const review = await Review.create({ job: job._id, decision: approve ? 'APPROVED' : 'REJECTED', notes, reviewer: reviewerAddress, automated: false });

    if (approve) {
      if (contractService.canAct()) {
        await contractService.resolveDispute(job.onchainJobId, true);
      }
      job.status = 'approved';
    } else {
      if (contractService.canAct()) {
        await contractService.resolveDispute(job.onchainJobId, false);
      }
      job.status = 'rejected';
    }

    await job.save();
    res.json({ ok: true, review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Review failed' });
  }
};
