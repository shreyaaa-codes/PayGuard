# PayGuard

AI-powered escrow platform for freelancers and clients using Monad blockchain.

This repository contains three main components:

- contracts/ — Solidity smart contract (Hardhat project)
- backend/ — Node.js + Express API, MongoDB models, Claude AI integration (mockable)
- frontend/ — React + Vite + Tailwind dApp with MetaMask wallet connect

See each subdirectory README and the root README.md for setup and usage.

## Quick start (developer)

1. Clone the repo
   git clone https://github.com/shreyaaa-codes/PayGuard.git

2. Install dependencies per subproject:
   - contracts: cd contracts && npm install
   - backend: cd backend && npm install
   - frontend: cd frontend && npm install

3. Start local services:
   - Start a local blockchain (Hardhat): npx hardhat node
   - Deploy contract: cd contracts && npx hardhat run scripts/deploy.js --network localhost
   - Start backend: cd backend && npm run dev
   - Start frontend: cd frontend && npm run dev

See each subfolder for detailed instructions.
