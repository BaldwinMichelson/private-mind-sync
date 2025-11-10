
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const GoalVaultABI = {
  "abi": [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "completedAt",
          "type": "uint64"
        }
      ],
      "name": "GoalCompleted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "createdAt",
          "type": "uint64"
        }
      ],
      "name": "GoalCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "GoalProgressUpdated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "externalEuint64",
          "name": "encryptedCompletedAt",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "completedAtProof",
          "type": "bytes"
        }
      ],
      "name": "completeGoal",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "bytes",
          "name": "encryptedDescription",
          "type": "bytes"
        },
        {
          "internalType": "externalEuint64",
          "name": "encryptedDeadline",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint8",
          "name": "encryptedPriority",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "deadlineProof",
          "type": "bytes"
        },
        {
          "internalType": "bytes",
          "name": "priorityProof",
          "type": "bytes"
        }
      ],
      "name": "createGoal",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "getEncryptedCompletedAt",
      "outputs": [
        {
          "internalType": "euint64",
          "name": "encryptedCompletedAt",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "getEncryptedDeadline",
      "outputs": [
        {
          "internalType": "euint64",
          "name": "encryptedDeadline",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "getEncryptedDescription",
      "outputs": [
        {
          "internalType": "bytes",
          "name": "encryptedDescription",
          "type": "bytes"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "getEncryptedPriority",
      "outputs": [
        {
          "internalType": "euint8",
          "name": "encryptedPriority",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "getEncryptedProgress",
      "outputs": [
        {
          "internalType": "euint8",
          "name": "encryptedProgress",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "getGoalCountByOwner",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "count",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "getGoalIdsByOwner",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "ids",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "getGoalMeta",
      "outputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "uint64",
          "name": "createdAt",
          "type": "uint64"
        },
        {
          "internalType": "bool",
          "name": "isCompleted",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "protocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "externalEuint8",
          "name": "encryptedProgress",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "progressProof",
          "type": "bytes"
        }
      ],
      "name": "updateProgress",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
} as const;

