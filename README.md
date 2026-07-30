# VoteChain — Decentralized Voting System

A blockchain-based e-voting platform that enables transparent, tamper-proof elections using Ethereum smart contracts, with a MERN stack backend/frontend for user management and UX.

**Live demo:** [votechain-peach.vercel.app](https://votechain-peach.vercel.app)

## Tech Stack

- **Smart Contracts:** Solidity, Hardhat
- **Blockchain Interaction:** ethers.js
- **Frontend:** React
- **Backend:** Node.js, Express, MongoDB
- **Testing:** Hardhat/Mocha/Chai

## Project Structure

```
Decentralized-Voting-System/
├── backend/           # Express API server, DB models, auth
├── contracts/         # Solidity smart contracts
├── frontend/          # React client application
├── scripts/           # Hardhat deployment scripts
├── test/              # Smart contract test suite
├── hardhat.config.cjs # Hardhat network/compiler config
└── package.json
```

## Features

- Wallet-based voter authentication
- On-chain vote casting with immutable, auditable results
- Admin controls for candidate/election setup
- Real-time result tallying
- Protection against double voting via smart contract logic

## Prerequisites

- Node.js v18+
- MetaMask (or another injected Web3 wallet)
- MongoDB instance (local or Atlas)

## Setup

### 1. Clone and install root dependencies (Hardhat/contracts)

```bash
git clone https://github.com/Jaimin-chavda/Decentralized-Voting-System.git
cd Decentralized-Voting-System
npm install
```

### 2. Compile and test contracts

```bash
npx hardhat compile
npx hardhat test
```

### 3. Deploy contracts (local Hardhat network)

```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

Update the deployed contract address/ABI in the frontend config after deployment.

### 4. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
```

```bash
npm start
```

### 5. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address
```

```bash
npm start
```

## Deploying to a Testnet

Add network config (e.g. Sepolia) to `hardhat.config.cjs` with your RPC URL and private key (via `.env`, never hardcoded), then:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## License

MIT

## Author

**Jaimin Chavda** — [GitHub](https://github.com/Jaimin-chavda) · [LinkedIn](https://linkedin.com/in/jaimin-chavda-7600b23a8)
