// Controllers for job flows
const Job = require('../models/Job');
const Submission = require('../models/Submission');
const Review = require('../models/Review');
const aiService = require('../services/aiService');
const contractService = require('../services/contractService');

// Create a job record in DB. Actual on-chain funding should be done by front-end calling the contract.
exports.createJob = async (req, res) => {
  try {
    const { title, metadataUri, freelancer, clientAddress, escrowAmount, txHash, onchainJobId } = req.body;
    // Persist onchainJobId if provided so backend can correlate with on-chain contract
    const job = await Job.create({ title, metadataUri, freelancer, clientAddress, escrowAmount, txHash, onchainJobId });
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
    // Use job.metadataUri as requirements; if metadataUri is a remote URI, backend should fetch content in a later enhancement.
    const requirements = job.metadataUri || '';
    const aiResult = await aiService.review(requirements, submissionUri);

    // Save review
    const review = await Review.create({ job: job._id, submission: submission._id, decision: aiResult.decision, confidence: aiResult.confidence, reason: aiResult.reason, automated: true });

    // Act based on AI decision
    if (aiResult.decision === 'APPROVED') {
      // Call contract to release funds - contractService wraps ethers.js
      if (contractService.canAct()) {
        // Ensure we have an onchainJobId; otherwise cannot call contract
        const onchainId = job.onchainJobId || job.chainJobId;
        if (typeof onchainId === 'number' || typeof onchainId === 'string') {
          await contractService.releasePayment(Number(onchainId));
        } else {
          console.warn('No onchainJobId present for job', job._id);
        }
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
      const onchainId = job.onchainJobId || job.chainJobId;
      if (typeof onchainId === 'number' || typeof onchainId === 'string') {
        await contractService.escalateDispute(Number(onchainId));
      } else {
        console.warn('No onchainJobId for escalate on job', job._id);
      }
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
        const onchainId = job.onchainJobId || job.chainJobId;
        if (typeof onchainId === 'number' || typeof onchainId === 'string') {
          await contractService.resolveDispute(Number(onchainId), true);
        } else {
          console.warn('No onchainJobId present for job', job._id);
        }
      }
      job.status = 'approved';
    } else {
      if (contractService.canAct()) {
        const onchainId = job.onchainJobId || job.chainJobId;
        if (typeof onchainId === 'number' || typeof onchainId === 'string') {
          await contractService.resolveDispute(Number(onchainId), false);
        } else {
          console.warn('No onchainJobId present for job', job._id);
        }
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

// New: reviewSubmission - trigger AI review manually (used by POST /api/review)
exports.reviewSubmission = async (req, res) => {
  try {
    // Accept either: { jobId } to review the latest submission for a job
    // or { requirements, submission } to run an ad-hoc review
    const { jobId, requirements, submission } = req.body;

    if (jobId) {
      // Populate latestSubmission if it's stored as an ObjectId; if already populated the result will be a doc
      const job = await Job.findById(jobId).populate('latestSubmission').exec();
      if (!job) return res.status(404).json({ error: 'Job not found' });
      if (!job.latestSubmission) return res.status(400).json({ error: 'No submission found for this job' });

      // Support both populated submission doc and ObjectId
      let submissionDoc = null;
      if (typeof job.latestSubmission === 'object' && job.latestSubmission.submissionUri) {
        submissionDoc = job.latestSubmission;
      } else {
        submissionDoc = await Submission.findById(job.latestSubmission);
      }

      if (!submissionDoc) return res.status(400).json({ error: 'Submission record not found' });

      const reqText = job.metadataUri || requirements || '';
      const submissionText = submission || submissionDoc.submissionUri;
      const aiResult = await aiService.review(reqText, submissionText);

      const review = await Review.create({ job: job._id, submission: submissionDoc._id, decision: aiResult.decision, confidence: aiResult.confidence, reason: aiResult.reason, automated: true });

      // Optionally act on AI result (but do not change core flow): mirror the behavior of submitWork
      if (aiResult.decision === 'APPROVED') {
        if (contractService.canAct()) {
          const onchainId = job.onchainJobId || job.chainJobId;
          if (typeof onchainId === 'number' || typeof onchainId === 'string') {
            await contractService.releasePayment(Number(onchainId));
          } else {
            console.warn('No onchainJobId present for job', job._id);
          }
        }
        job.status = 'approved';
      } else if (aiResult.decision === 'REJECTED') {
        job.status = 'rejected';
      } else {
        job.status = 'escalated';
      }

      await job.save();

      return res.json({ aiResult, review });
    }

    if (requirements && submission) {
      const aiResult = await aiService.review(requirements, submission);
      // Do not persist any DB state — this is an ad-hoc review
      return res.json({ aiResult });
    }

    return res.status(400).json({ error: 'Provide jobId or requirements+submission' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to run review' });
  }
};
