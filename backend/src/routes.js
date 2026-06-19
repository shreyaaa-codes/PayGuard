const express = require('express');
const router = express.Router();
const jobController = require('./controllers/jobController');

// Jobs
router.post('/jobs', jobController.createJob); // Create job record (frontend handles on-chain funding)
router.get('/jobs', jobController.getJobs);
router.get('/jobs/:id', jobController.getJobById);

// Submissions
router.post('/jobs/:id/submit', jobController.submitWork);

// AI review (can be called by backend cron or webhook) - here exposed for testing
router.post('/review', jobController.reviewSubmission);

// Escalation / reviewer endpoints
router.post('/jobs/:id/escalate', jobController.escalate);
router.post('/jobs/:id/review', jobController.humanReview);

module.exports = router;
