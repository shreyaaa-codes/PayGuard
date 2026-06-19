// Contract service wraps ethers.js interactions for backend-signed actions like release/refund/resolve

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

let provider = null;
let wallet = null;
let contract = null;
let ready = false;

function init() {
  const rpc = process.env.MONAD_RPC_URL || 'http://127.0.0.1:8545';
  const pk = process.env.BACKEND_PRIVATE_KEY || '';
  const contractAddress = process.env.CONTRACT_ADDRESS || '';
  try {
    provider = new ethers.providers.JsonRpcProvider(rpc);
    if (pk) wallet = new ethers.Wallet(pk, provider);
    if (contractAddress) {
      const abiPath = path.join(__dirname, '..', '..', 'contracts', 'artifacts', 'Escrow.json');
      const raw = fs.readFileSync(abiPath, 'utf8');
      const abi = JSON.parse(raw).abi;
      const signer = wallet || provider.getSigner();
      contract = new ethers.Contract(contractAddress, abi, signer);
    }

    ready = true;
  } catch (err) {
    console.warn('Contract service not initialized fully:', err.message);
  }
}

init();

function canAct() {
  return ready && contract && wallet;
}

async function releasePayment(jobId) {
  if (!canAct()) throw new Error('Contract service not ready or private key missing');
  const tx = await contract.releasePayment(jobId);
  return tx.wait();
}

async function refundClient(jobId) {
  if (!canAct()) throw new Error('Contract service not ready or private key missing');
  const tx = await contract.refundClient(jobId);
  return tx.wait();
}

async function escalateDispute(jobId) {
  if (!canAct()) throw new Error('Contract service not ready or private key missing');
  const tx = await contract.escalateDispute(jobId);
  return tx.wait();
}

async function resolveDispute(jobId, approve) {
  if (!canAct()) throw new Error('Contract service not ready or private key missing');
  const tx = await contract.resolveDispute(jobId, approve);
  return tx.wait();
}

module.exports = { canAct, releasePayment, refundClient, escalateDispute, resolveDispute };
