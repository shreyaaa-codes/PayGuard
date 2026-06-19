// AI service integrates with Claude. If CLAUDE_API_KEY is missing, returns a mock decision.

const axios = require('axios');

async function callClaudeMock(requirements, submission) {
  // Very small heuristic mock: if submission shares some words with requirements, approve.
  const rWords = requirements.toLowerCase().split(/\W+/).filter(Boolean);
  const sWords = submission.toLowerCase().split(/\W+/).filter(Boolean);
  const overlap = rWords.filter((w) => sWords.includes(w));
  const score = overlap.length / Math.max(rWords.length, 1);

  if (score > 0.6) return { decision: 'APPROVED', confidence: Math.min(0.99, score), reason: 'High overlap between requirements and submission (mock).' };
  if (score > 0.2) return { decision: 'UNCERTAIN', confidence: score, reason: 'Partial overlap; suggest human review (mock).' };
  return { decision: 'REJECTED', confidence: Math.max(0.05, score), reason: 'Low overlap; submission does not match requirements (mock).' };
}

async function review(requirements, submission) {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return callClaudeMock(requirements, submission);
  }

  // Placeholder for real Claude API usage - implement vendor contract and endpoint as needed
  // For now, fallback to mock
  return callClaudeMock(requirements, submission);
}

module.exports = { review };
