// Contract service wraps ethers.js interactions for backend-signed actions like release/refund/resolve
// This service supports a "mock" mode when blockchain configuration is missing so the backend
// can run without throwing runtime errors. When mock mode is active, actions return a resolved
// Promise with a diagnostic object instead of attempting an on-chain transaction.

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

let provider = null;
let wallet = null;
let contract = null;
let isMock = false; // when true, on-chain actions are mocked

function init() {
  const rpc = process.env.MONAD_RPC_URL || '';
  const pk = process.env.BACKEND_PRIVATE_KEY || '';
  const contractAddress = process.env.CONTRACT_ADDRESS || '';
  const forceMock = process.env.CONTRACT_MOCK === 'true';

  try {
    // If forced mock, skip initialization
    if (forceMock) {
      isMock = true;
      console.warn('CONTRACT_MOCK=true: contractService running in mock mode');
      return;
    }

    if (!rpc || !contractAddress || !pk) {
      console.warn('Blockchain config incomplete: MONAD_RPC_URL, CONTRACT_ADDRESS, or BACKEND_PRIVATE_KEY is missing. contractService will run in mock mode.');
      isMock = true;
      return;
    }

    provider = new ethers.providers.JsonRpcProvider(rpc);
    wallet = new ethers.Wallet(pk, provider);

    // The contracts directory is expected at the repo root. From backend/src/services, go up three levels.
    const abiPath = path.join(__dirname, '..', '..', '..', 'contracts', 'artifacts', 'Escrow.json');

    if (!fs.existsSync(abiPath)) {
      console.warn('Escrow ABI not found at expected path:', abiPath, '\ncontractService will run in mock mode');
      isMock = true;
      return;
    }

    const raw = fs.readFileSync(abiPath, 'utf8');
    const abi = JSON.parse(raw).abi;
    contract = new ethers.Contract(contractAddress, abi, wallet);

    // If we reach here, we have provider, wallet, and contract.
    isMock = false;
    console.log('contractService initialized: connected to contract at', contractAddress);
  } catch (err) {
    console.warn('Contract service failed to initialize, entering mock mode:', err.message);
    isMock = true;
  }
}

init();

function canAct() {
  // Returns true only when the service is connected with a signer capable of sending txs
  return !isMock && !!contract && !!wallet;
}

// Helper to return a resolved mock response for actions
function mockResponse(action, payload = {}) {
  return Promise.resolve({
    mock: true,
    action,
    payload,
    timestamp: Date.now(),
    message: 'Mock response: no on-chain transaction performed'
  });
}

async function releasePayment(jobId) {
  if (isMock || !canAct()) {
    console.warn('releasePayment called while contractService in mock mode or not ready. Returning mock response.');
    return mockResponse('releasePayment', { jobId });
  }

  try {
    const tx = await contract.releasePayment(jobId);
    return tx.wait();
  } catch (err) {
    console.error('releasePayment error:', err.message);
    // Fallback to mock response instead of throwing to callers
    return mockResponse('releasePayment_error', { jobId, error: err.message });
  }
}

async function refundClient(jobId) {
  if (isMock || !canAct()) {
    console.warn('refundClient called while contractService in mock mode or not ready. Returning mock response.');
    return mockResponse('refundClient', { jobId });
  }

  try {
    const tx = await contract.refundClient(jobId);
    return tx.wait();
  } catch (err) {
    console.error('refundClient error:', err.message);
    return mockResponse('refundClient_error', { jobId, error: err.message });
  }
}

async function escalateDispute(jobId) {
  if (isMock || !canAct()) {
    console.warn('escalateDispute called while contractService in mock mode or not ready. Returning mock response.');
    return mockResponse('escalateDispute', { jobId });
  }

  try {
    const tx = await contract.escalateDispute(jobId);
    return tx.wait();
  } catch (err) {
    console.error('escalateDispute error:', err.message);
    return mockResponse('escalateDispute_error', { jobId, error: err.message });
  }
}

async function resolveDispute(jobId, approve) {
  if (isMock || !canAct()) {
    console.warn('resolveDispute called while contractService in mock mode or not ready. Returning mock response.');
    return mockResponse('resolveDispute', { jobId, approve });
  }

  try {
    const tx = await contract.resolveDispute(jobId, approve);
    return tx.wait();
  } catch (err) {
    console.error('resolveDispute error:', err.message);
    return mockResponse('resolveDispute_error', { jobId, approve, error: err.message });
  }
}

module.exports = { canAct, releasePayment, refundClient, escalateDispute, resolveDispute };
