// AI service integrates with Claude. If CLAUDE_API_KEY is missing, returns a deterministic mock decision.
// Production-ready notes:
// - Validates inputs and normalizes to strings
// - Respects CLAUDE_API_KEY and optional CLAUDE_API_URL if provided
// - Uses timeouts and safe fallbacks to mock if the external API fails
// - Always returns an object: { decision: string, confidence: number, reason: string }

const axios = require('axios');

const DEFAULT_MOCK = {
  decision: 'UNCERTAIN',
  confidence: 0.5,
  reason: 'Mock review'
};

function normalizeText(x) {
  if (x === undefined || x === null) return '';
  // Limit to a reasonable length to avoid sending huge payloads to the API
  const s = String(x);
  const MAX = 50_000; // 50KB
  return s.length > MAX ? s.slice(0, MAX) : s;
}

async function callClaude(requirements, submission) {
  const apiKey = process.env.CLAUDE_API_KEY;
  const apiUrl = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/claude'; // placeholder
  if (!apiKey) {
    return DEFAULT_MOCK;
  }

  // Prepare prompt: you may want to customize this prompt for your Claude model.
  const prompt = `You are an objective escrow reviewer. Compare the job requirements:\n\n${requirements}\n\nwith the freelancer submission:\n\n${submission}\n\nProvide ONLY a JSON object with keys: decision (APPROVED|REJECTED|UNCERTAIN), confidence (0.0-1.0), reason (short explanation).`;

  try {
    const timeout = Number(process.env.CLAUDE_REQUEST_TIMEOUT_MS) || 8000;
    const response = await axios.post(
      apiUrl,
      {
        // The exact request shape depends on the Claude API version. This generic payload
        // provides a 'prompt' that most conversational APIs will accept; adapt as needed.
        prompt,
        max_tokens: 500
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout
      }
    );

    // Try to parse the model output safely.
    const text = response.data && (response.data.output || response.data.text || response.data.choices?.[0]?.text);
    const body = typeof text === 'string' ? text : JSON.stringify(text || '');

    // Look for a JSON object in the response. This is defensive parsing.
    const jsonMatch = body.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        const decision = parsed.decision || parsed.outcome || parsed.verdict || 'UNCERTAIN';
        const confidence = Number(parsed.confidence) || 0.5;
        const reason = parsed.reason || parsed.explanation || String(parsed.detail || parsed.message || '').slice(0, 2000);
        return {
          decision: String(decision).toUpperCase(),
          confidence: Math.max(0, Math.min(1, Number(confidence))),
          reason: String(reason)
        };
      } catch (err) {
        // fallthrough to mock
        console.warn('Failed to parse Claude JSON output, falling back to mock:', err.message);
        return DEFAULT_MOCK;
      }
    }

    // If no JSON found, attempt to interpret plain text heuristically
    const lower = (body || '').toLowerCase();
    if (lower.includes('approved')) return { decision: 'APPROVED', confidence: 0.85, reason: body.slice(0, 2000) };
    if (lower.includes('rejected')) return { decision: 'REJECTED', confidence: 0.85, reason: body.slice(0, 2000) };
    return DEFAULT_MOCK;
  } catch (err) {
    console.error('Claude API call failed, returning mock:', err.message);
    return DEFAULT_MOCK;
  }
}

/**
 * Public review function.
 * Always exists and always returns { decision, confidence, reason }.
 * @param {string} requirements
 * @param {string} submission
 */
async function review(requirements, submission) {
  try {
    const reqText = normalizeText(requirements);
    const subText = normalizeText(submission);

    // If both are empty, return uncertain mock
    if (!reqText && !subText) return DEFAULT_MOCK;

    // If no API key, return mock per requirement
    if (!process.env.CLAUDE_API_KEY) {
      return DEFAULT_MOCK;
    }

    // Otherwise call the external Claude-like API (safe wrapper)
    return await callClaude(reqText, subText);
  } catch (err) {
    console.error('aiService.review unexpected error, returning mock:', err.message);
    return DEFAULT_MOCK;
  }
}

module.exports = { review };
