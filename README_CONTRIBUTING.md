# PayGuard - Full-stack AI escrow (contracts/backend/frontend)

This scaffold includes a Solidity escrow contract, an Express backend using MongoDB, and a React + Vite frontend with MetaMask support.

Features implemented in this scaffold:
- Solidity Escrow contract with createJob, submitWork, releasePayment, refundClient, escalateDispute, resolveDispute
- Hardhat config and deploy script for local development
- Express backend with Job, Submission, Review models (Mongoose)
- AI review service (mock if CLAUDE_API_KEY missing)
- Contract service for backend to call owner-signed actions
- Frontend with pages: Home, Client, Freelancer, Reviewer, Job details
- Wallet connect & create job flow (frontend funds contract directly)

Next steps to run locally are in the root README.md.
