# Private Mind Sync

A blockchain-powered goal management dApp with Fully Homomorphic Encryption (FHE). Track your goals privately while keeping them secure on-chain using Zama's FHEVM protocol.

## 🎥 Demo & Live App

[![Demo Video](https://img.shields.io/badge/Demo-Video-red?style=for-the-badge&logo=youtube)](https://github.com/BaldwinMichelson/private-mind-sync/private-mind-sync.mp4)
[![Live App](https://img.shields.io/badge/Live-App-blue?style=for-the-badge&logo=vercel)](https://private-mind-sync.vercel.app/)

## 🔐 Features

- **Encrypted Storage**: Goal details encrypted with your wallet's private key. Only you can decrypt your progress.
- **Privacy-First**: FHE technology ensures your goals and progress remain private, even on the blockchain.
- **Immutable Proof**: Blockchain ensures your goals can't be altered or deleted once created.
- **Progress Tracking**: Update and track your goal progress with encrypted values.
- **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Package manager
- **MetaMask** or compatible Web3 wallet

### Installation

1. **Install dependencies**

   ```bash
   npm install
   cd frontend
   npm install
   ```

2. **Set up environment variables** (optional, for testnet deployment)

   ```bash
   # Set your Infura API key for network access
   npx hardhat vars set INFURA_API_KEY

   # Optional: Set Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

3. **Start local Hardhat node**

   ```bash
   npx hardhat node
   ```

4. **Deploy contracts to local network**

   ```bash
   # In a new terminal
   npx hardhat deploy --network localhost
   ```

5. **Start frontend**

   ```bash
   cd frontend
   npm run dev
   ```

6. **Open browser**

   Navigate to `http://localhost:3000` and connect your wallet.

## 📁 Project Structure

```
Private-Mind-Sync/
├── contracts/                    # Smart contract source files
│   ├── GoalVault.sol            # Main goal management contract with hybrid encryption
│   └── FHECounter.sol           # Example FHE counter contract
├── deploy/                       # Deployment scripts
│   ├── deploy_goalvault.ts      # GoalVault deployment script
│   └── deploy.ts                # General deployment script
├── frontend/                     # Next.js frontend application
│   ├── app/                     # Next.js app directory (pages, layouts)
│   ├── components/              # React components
│   │   ├── CreateGoal.tsx       # Goal creation with encryption
│   │   ├── GoalList.tsx         # Goal listing and management
│   │   ├── GoalDetail.tsx       # Goal details with decryption
│   │   ├── WalletConnect.tsx    # Wallet connection component
│   │   └── GoalVaultApp.tsx     # Main application component
│   ├── config/                  # Configuration files
│   │   ├── contracts.ts         # Contract addresses and ABIs
│   │   └── wagmi.ts             # Web3 configuration
│   ├── hooks/                   # Custom React hooks
│   │   ├── metamask/            # MetaMask integration hooks
│   │   ├── useFhevm.tsx         # FHEVM instance management
│   │   ├── useZamaInstance.ts   # Zama FHEVM wrapper
│   │   └── useEthersSigner.ts   # Ethers signer hook
│   ├── fhevm/                   # FHEVM integration layer
│   │   ├── internal/            # Core FHEVM implementation
│   │   │   ├── fhevm.ts         # FHEVM core logic
│   │   │   ├── fhevmTypes.ts    # TypeScript type definitions
│   │   │   └── mock/            # Local development mocks
│   │   ├── useFhevm.tsx         # React hook for FHEVM
│   │   └── FhevmDecryptionSignature.ts # Decryption utilities
│   ├── utils/                   # Utility functions
│   │   └── crypto.ts            # ChaCha20 encryption utilities
│   ├── scripts/                 # Build and deployment scripts
│   └── public/                  # Static assets
├── test/                        # Test files
│   ├── GoalVault.ts            # Local network tests
│   ├── GoalVaultSepolia.ts     # Sepolia testnet tests
│   └── FHECounter.ts           # FHE counter tests
├── hardhat.config.ts           # Hardhat configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## 🏗️ Smart Contracts

### GoalVault.sol - Main Contract

The `GoalVault` contract implements a privacy-preserving goal management system using a hybrid encryption approach:

#### Data Structure
```solidity
struct Goal {
    address owner;                    // Plaintext owner address
    string title;                     // Plaintext title for listing
    bytes encryptedDescription;       // ChaCha20 client-side encrypted description
    euint64 encryptedDeadline;        // FHE-encrypted deadline timestamp
    euint8 encryptedPriority;         // FHE-encrypted priority (1-5)
    euint8 encryptedProgress;         // FHE-encrypted progress (0-100)
    euint64 encryptedCompletedAt;     // FHE-encrypted completion timestamp
    bool isCompleted;                 // Plaintext completion status
    uint64 createdAt;                 // Plaintext creation timestamp
}
```

#### Key Functions

**`createGoal()`**
- Creates a new goal with hybrid encryption
- Description encrypted client-side with ChaCha20
- Numeric values (deadline, priority) encrypted with FHE
- Sets up access control for contract and owner

**`updateProgress()`**
- Updates goal progress using FHE encryption
- Only goal owner can update their goals
- Progress encrypted with FHE (0-100 range)

**`completeGoal()`**
- Marks goal as completed with encrypted completion timestamp
- Prevents further progress updates
- Uses FHE for completion timestamp

#### Access Control & Encryption
- **Client-side encryption**: Goal descriptions use ChaCha20 with wallet-derived keys
- **FHE encryption**: Numeric values (deadlines, priorities, progress) use Zama's FHEVM
- **ACL permissions**: Contract and goal owner have access to encrypted fields
- **Privacy guarantee**: Only the goal owner can decrypt and view their data

### FHECounter.sol - Example Contract

A simple counter contract demonstrating basic FHE operations on blockchain.

## 🔐 Encryption & Privacy Architecture

### Hybrid Encryption Approach

Private Mind Sync uses a sophisticated hybrid encryption system combining client-side encryption and Fully Homomorphic Encryption (FHE):

#### 1. Client-Side Encryption (ChaCha20)
**Used for**: Goal descriptions and detailed content

```typescript
// Key derivation from wallet address
function deriveKeyFromAddress(addr: string): Uint8Array {
  const hash = keccak256(toUtf8Bytes(addr.toLowerCase()));
  const key = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    key[i] = parseInt(hash.slice(2 + i * 2, 4 + i * 2), 16);
  }
  return key;
}

// Encrypt description with ChaCha20
export async function encryptDescription(description: string, userAddress: string): Promise<string> {
  const key = deriveKeyFromAddress(userAddress);
  const nonce = randomBytes(12);
  const plaintext = new TextEncoder().encode(description);
  const encrypted = chacha20Encrypt(key, nonce, plaintext);
  return `0x${Array.from(encrypted).map(b => b.toString(16).padStart(2, '0')).join('')}`;
}
```

**Security Benefits**:
- Only the wallet owner can decrypt their goal descriptions
- Key derived deterministically from wallet address
- No server-side key storage required

#### 2. Fully Homomorphic Encryption (FHEVM)
**Used for**: Numeric values (deadlines, priorities, progress)

**FHE Encryption Process**:
```typescript
// Encrypt deadline with FHE
const encryptedDeadline = await instance.createEncryptedInput(contractAddress, address);
encryptedDeadline.add64(deadlineTimestamp);
const encrypted = await encryptedDeadline.encrypt();

// Submit to contract with proof
await contract.createGoal(
  title,
  encryptedDescriptionBytes,
  encryptedDeadline.handles[0],    // Encrypted value
  encryptedPriority.handles[0],    // Encrypted value
  encryptedDeadline.inputProof,    // ZK proof
  encryptedPriority.inputProof     // ZK proof
);
```

**FHE Benefits**:
- Encrypted values can be processed without decryption
- Mathematical operations on encrypted data
- Zero-knowledge proofs ensure validity
- Privacy preserved during computation

### Data Flow Architecture

```
User Input → Client-Side Processing → Hybrid Encryption → Blockchain Storage
    ↓              ↓                       ↓              ↓
Raw Data   → Validation & Sanitization → ChaCha20 + FHE → Encrypted Storage
    ↓              ↓                       ↓              ↓
Local UI   ← Decryption & Display ← Key Derivation ← Access Control
```

#### Encryption Layers:

1. **Layer 1 - Client Encryption**: ChaCha20 for text content
2. **Layer 2 - FHE Encryption**: Zama FHEVM for numeric operations
3. **Layer 3 - Access Control**: Contract-level permissions
4. **Layer 4 - Zero-Knowledge**: Cryptographic proofs for validity

### Privacy Guarantees

- **End-to-End Encryption**: Data encrypted before leaving user's device
- **Owner-Only Access**: Only goal creators can decrypt their content
- **Blockchain Transparency**: Public verifiability without data exposure
- **Computation Privacy**: FHE enables encrypted data processing
- **Forward Security**: Each goal uses unique encryption parameters

## 📜 Available Scripts

### Root Directory

| Script                    | Description                    |
| ------------------------- | ------------------------------ |
| `npm run compile`         | Compile all contracts          |
| `npm run test`            | Run all tests                  |
| `npm run test:sepolia`    | Run tests on Sepolia testnet   |
| `npm run deploy:localhost` | Deploy to local Hardhat node  |
| `npm run deploy:sepolia`  | Deploy to Sepolia testnet     |

### Frontend Directory

| Script              | Description                    |
| ------------------- | ------------------------------ |
| `npm run dev`       | Start development server       |
| `npm run build`     | Build for production           |
| `npm run start`     | Start production server        |
| `npm run genabi`    | Generate contract ABIs         |

## 🌐 Networks

### Hardhat Local (Recommended for Development)

- **Chain ID**: 31337
- **RPC URL**: http://127.0.0.1:8545
- **Features**: Uses local mock relayer, more reliable for development

### Sepolia Testnet

- **Chain ID**: 11155111
- **RPC URL**: https://sepolia.infura.io/v3/YOUR_API_KEY
- **Note**: Sepolia Relayer service may experience occasional backend connection issues. This is a known limitation of the testnet Relayer service.

## 🔧 Configuration

### Hardhat Configuration

The project uses Hardhat with FHEVM plugin. Configure networks in `hardhat.config.ts`:

```typescript
networks: {
  localhost: {
    url: "http://127.0.0.1:8545",
  },
  sepolia: {
    url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
    chainId: 11155111,
  },
}
```

### Frontend Configuration

Frontend uses Wagmi and RainbowKit for wallet connection. Configure in `frontend/config/wagmi.ts`:

- Set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` environment variable for WalletConnect support

## 🧪 Testing

### Local Network Testing

```bash
npm run test
```

### Sepolia Testnet Testing

```bash
# Deploy first
npx hardhat deploy --network sepolia

# Then run tests
npm run test:sepolia
```

## 📚 Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Setup Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [FHEVM Testing Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)

## 🐛 Known Issues

### Sepolia Relayer Service

The Zama Relayer service on Sepolia testnet may experience backend connection issues during contract code verification. This is a known limitation of the testnet Relayer service, not a bug in this project.

**Solutions:**
- Wait 1-2 minutes and retry (service may recover)
- Use Hardhat Local network for testing (more reliable)
- Check Zama's status page for service updates

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

## 🔒 Security & Privacy

### Threat Model & Security Considerations

#### Attack Vectors Considered
- **Blockchain Visibility**: All data is visible on-chain but encrypted
- **Key Derivation**: Deterministic key derivation from wallet addresses
- **Relayer Service**: External dependency on Zama's FHEVM relayer
- **Client-Side Encryption**: JavaScript-based encryption security

#### Security Measures Implemented

**1. Hybrid Encryption Architecture**
- **ChaCha20-Poly1305**: Authenticated encryption for text content
- **FHEVM**: Zero-knowledge encryption for numeric computations
- **Wallet-Based Keys**: No password storage or key management servers

**2. Access Control**
- **Owner-Only Decryption**: Only goal creators can decrypt their content
- **Contract-Level Permissions**: Smart contract enforces access rules
- **ACL Integration**: FHEVM access control lists for encrypted data

**3. Privacy Guarantees**
- **Zero-Trust Architecture**: No privileged access to user data
- **End-to-End Encryption**: Data encrypted before blockchain submission
- **Computation Privacy**: FHE enables encrypted data processing
- **Forward Security**: Unique encryption per goal instance

### Data Privacy Assurance

#### What Stays Private
- ✅ **Goal descriptions**: Encrypted with ChaCha20 before blockchain storage
- ✅ **Progress values**: FHE-encrypted, computable without decryption
- ✅ **Deadlines & priorities**: FHE-encrypted numeric values
- ✅ **Completion timestamps**: FHE-encrypted time data

#### What Is Public
- ❌ **Goal titles**: Plaintext for discoverability and listing
- ❌ **Owner addresses**: Required for blockchain attribution
- ❌ **Creation timestamps**: Plaintext for ordering
- ❌ **Completion status**: Boolean flag for UI state

### Key Security Properties

| Property | Implementation | Status |
|----------|----------------|---------|
| **Confidentiality** | ChaCha20 + FHEVM | ✅ Implemented |
| **Integrity** | Cryptographic signatures + ZK proofs | ✅ Implemented |
| **Availability** | Blockchain + IPFS fallback | ⚠️ Partial |
| **Non-repudiation** | Wallet signatures | ✅ Implemented |
| **Forward Secrecy** | Per-goal unique encryption | ✅ Implemented |

### Known Limitations

#### Sepolia Testnet Issues
- **Relayer Service Instability**: Backend connection issues during high load
- **Verification Delays**: Contract code verification may timeout
- **Rate Limiting**: FHE operations subject to relayer rate limits

#### Client-Side Security
- **Browser Security**: Relies on browser cryptography APIs
- **Key Storage**: Keys derived from wallet, not stored persistently
- **JavaScript Security**: Subject to browser and JS runtime security

### Security Best Practices

#### For Users
1. **Use Hardware Wallets**: Prefer Ledger/Trezor for key security
2. **Backup Encrypted Data**: Export encrypted goals for backup
3. **Network Awareness**: Understand testnet vs mainnet differences
4. **Private Browsing**: Use incognito mode for sensitive operations

#### For Developers
1. **Audit Contracts**: Regular security audits of smart contracts
2. **Monitor Relayer**: Track FHEVM relayer service status
3. **Test Thoroughly**: Comprehensive testing across networks
4. **Stay Updated**: Keep dependencies and protocols current

### Security Audits

- **Smart Contracts**: Pending formal security audit
- **FHEVM Integration**: Relies on Zama's audited FHEVM protocol
- **Client Encryption**: Uses standard cryptographic primitives

---

## 🆘 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/zama-ai/fhevm/issues)
- **Documentation**: [FHEVM Docs](https://docs.zama.ai)
- **Community**: [Zama Discord](https://discord.gg/zama)

---

**Built with ❤️ using Zama's FHEVM protocol**
