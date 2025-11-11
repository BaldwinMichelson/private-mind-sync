# Private Mind Sync

A blockchain-powered goal management dApp with Fully Homomorphic Encryption (FHE). Track your goals privately while keeping them secure on-chain using Zama's FHEVM protocol.

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
Private Mind Sync/
├── contracts/              # Smart contract source files
�?  ├── Private Mind Sync.sol      # Main goal management contract
�?  └── FHECounter.sol     # Example FHE counter contract
├── deploy/                 # Deployment scripts
�?  └── deploy_Private Mind Sync.ts # Private Mind Sync deployment script
├── frontend/               # Next.js frontend application
�?  ├── app/               # Next.js app directory
�?  ├── components/        # React components
�?  ├── config/            # Configuration files
�?  ├── hooks/             # Custom React hooks
�?  ├── fhevm/             # FHEVM integration
�?  └── utils/             # Utility functions
├── test/                   # Test files
�?  ├── Private Mind Sync.ts      # Local network tests
�?  └── Private Mind SyncSepolia.ts # Sepolia testnet tests
├── hardhat.config.ts      # Hardhat configuration
└── package.json           # Dependencies and scripts
```

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

## 🆘 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/zama-ai/fhevm/issues)
- **Documentation**: [FHEVM Docs](https://docs.zama.ai)
- **Community**: [Zama Discord](https://discord.gg/zama)

---

**Built with ❤️ using Zama's FHEVM protocol**

