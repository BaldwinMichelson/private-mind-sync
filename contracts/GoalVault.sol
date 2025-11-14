// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, euint64, externalEuint8, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title GoalVault - Encrypted goal management with FHE
/// @notice Stores user goals with encrypted details, deadlines, priorities, and progress
/// @dev Uses client-side encryption for descriptions and FHE for numeric values
contract GoalVault is SepoliaConfig {
    modifier onlyGoalOwner(uint256 id) {
        require(id < _goals.length, "Goal does not exist");
        require(_goals[id].owner == msg.sender, "Not goal owner");
        _;
    }

    modifier goalNotCompleted(uint256 id) {
        require(!_goals[id].isCompleted, "Goal already completed");
        _;
    }

    struct Goal {
        address owner;
        string title; // Plaintext title for listing
        bytes encryptedDescription; // Client-side encrypted description (ChaCha20)
        euint64 encryptedDeadline; // FHE-encrypted deadline timestamp
        euint8 encryptedPriority; // FHE-encrypted priority (1-5)
        euint8 encryptedProgress; // FHE-encrypted progress (0-100)
        euint64 encryptedCompletedAt; // FHE-encrypted completion timestamp (0 if not completed)
        bool isCompleted; // Plaintext completion status
        uint64 createdAt; // Plaintext creation timestamp
    }

    Goal[] private _goals;
    mapping(address => uint256[]) private _goalsOf;

    event GoalCreated(uint256 indexed id, address indexed owner, string title, uint64 indexed createdAt);
    event GoalProgressUpdated(uint256 indexed id, address indexed owner, uint64 indexed updatedAt);
    event GoalCompleted(uint256 indexed id, address indexed owner, uint64 indexed completedAt);

    /// @notice Create a new goal
    /// @param title Plaintext title for listing
    /// @param encryptedDescription Client-side encrypted description bytes
    /// @param encryptedDeadline FHE-encrypted deadline timestamp
    /// @param encryptedPriority FHE-encrypted priority (1-5)
    /// @param deadlineProof Proof for encrypted deadline
    /// @param priorityProof Proof for encrypted priority
    function createGoal(
        string calldata title,
        bytes calldata encryptedDescription,
        externalEuint64 encryptedDeadline,
        externalEuint8 encryptedPriority,
        bytes calldata deadlineProof,
        bytes calldata priorityProof
    ) external {
        euint64 deadline = FHE.fromExternal(encryptedDeadline, deadlineProof);
        euint8 priority = FHE.fromExternal(encryptedPriority, priorityProof);
        euint8 zeroProgress = FHE.asEuint8(0);
        euint64 zeroTimestamp = FHE.asEuint64(0);

        Goal memory goal;
        goal.owner = msg.sender;
        goal.title = title;
        goal.encryptedDescription = encryptedDescription;
        goal.encryptedDeadline = deadline;
        goal.encryptedPriority = priority;
        goal.encryptedProgress = zeroProgress;
        goal.encryptedCompletedAt = zeroTimestamp;
        goal.isCompleted = false;
        goal.createdAt = uint64(block.timestamp);

        _goals.push(goal);
        uint256 id = _goals.length - 1;
        _goalsOf[msg.sender].push(id);

        // ACL: allow contract and user to access encrypted fields
        FHE.allowThis(_goals[id].encryptedDeadline);
        FHE.allow(_goals[id].encryptedDeadline, msg.sender);
        FHE.allowThis(_goals[id].encryptedPriority);
        FHE.allow(_goals[id].encryptedPriority, msg.sender);
        FHE.allowThis(_goals[id].encryptedProgress);
        FHE.allow(_goals[id].encryptedProgress, msg.sender);
        FHE.allowThis(_goals[id].encryptedCompletedAt);
        FHE.allow(_goals[id].encryptedCompletedAt, msg.sender);

        emit GoalCreated(id, msg.sender, title, goal.createdAt);
    }

    /// @notice Update goal progress
    /// @param id Goal ID
    /// @param encryptedProgress FHE-encrypted progress value (0-100)
    /// @param progressProof Proof for encrypted progress
    function updateProgress(
        uint256 id,
        externalEuint8 encryptedProgress,
        bytes calldata progressProof
    ) external onlyGoalOwner(id) goalNotCompleted(id) {
        Goal storage goal = _goals[id];

        euint8 progress = FHE.fromExternal(encryptedProgress, progressProof);
        goal.encryptedProgress = progress;

        // Re-authorize access
        FHE.allowThis(goal.encryptedProgress);
        FHE.allow(goal.encryptedProgress, msg.sender);

        emit GoalProgressUpdated(id, msg.sender, uint64(block.timestamp));
    }

    /// @notice Mark goal as completed
    /// @param id Goal ID
    /// @param encryptedCompletedAt FHE-encrypted completion timestamp
    /// @param completedAtProof Proof for encrypted completion timestamp
    function completeGoal(
        uint256 id,
        externalEuint64 encryptedCompletedAt,
        bytes calldata completedAtProof
    ) external onlyGoalOwner(id) goalNotCompleted(id) {
        Goal storage goal = _goals[id];

        euint64 completedAt = FHE.fromExternal(encryptedCompletedAt, completedAtProof);
        goal.encryptedCompletedAt = completedAt;
        goal.isCompleted = true;

        // Re-authorize access
        FHE.allowThis(goal.encryptedCompletedAt);
        FHE.allow(goal.encryptedCompletedAt, msg.sender);

        emit GoalCompleted(id, msg.sender, uint64(block.timestamp));
    }

    /// @notice Get goal count for an owner
    /// @param owner The address to query for
    /// @return count Number of goals
    function getGoalCountByOwner(address owner) external view returns (uint256 count) {
        return _goalsOf[owner].length;
    }

    /// @notice Get goal IDs for an owner
    /// @param owner The address to query for
    /// @return ids Array of goal IDs
    function getGoalIdsByOwner(address owner) external view returns (uint256[] memory ids) {
        return _goalsOf[owner];
    }

    /// @notice Get metadata for a goal (public fields)
    /// @param id The goal ID
    /// @return owner Owner address
    /// @return title Title string
    /// @return createdAt Creation timestamp
    /// @return isCompleted Completion status
    function getGoalMeta(uint256 id)
        external
        view
        returns (
            address owner,
            string memory title,
            uint64 createdAt,
            bool isCompleted
        )
    {
        Goal storage goal = _goals[id];
        return (goal.owner, goal.title, goal.createdAt, goal.isCompleted);
    }

    /// @notice Get encrypted description for a goal
    /// @param id The goal ID
    /// @return encryptedDescription The encrypted description bytes
    function getEncryptedDescription(uint256 id) external view returns (bytes memory encryptedDescription) {
        return _goals[id].encryptedDescription;
    }

    /// @notice Get encrypted deadline for a goal
    /// @param id The goal ID
    /// @return encryptedDeadline The FHE-encrypted deadline
    function getEncryptedDeadline(uint256 id) external view returns (euint64 encryptedDeadline) {
        return _goals[id].encryptedDeadline;
    }

    /// @notice Get encrypted priority for a goal
    /// @param id The goal ID
    /// @return encryptedPriority The FHE-encrypted priority
    function getEncryptedPriority(uint256 id) external view returns (euint8 encryptedPriority) {
        return _goals[id].encryptedPriority;
    }

    /// @notice Get encrypted progress for a goal
    /// @param id The goal ID
    /// @return encryptedProgress The FHE-encrypted progress
    function getEncryptedProgress(uint256 id) external view returns (euint8 encryptedProgress) {
        return _goals[id].encryptedProgress;
    }

    /// @notice Get encrypted completion timestamp for a goal
    /// @param id The goal ID
    /// @return encryptedCompletedAt The FHE-encrypted completion timestamp
    function getEncryptedCompletedAt(uint256 id) external view returns (euint64 encryptedCompletedAt) {
        return _goals[id].encryptedCompletedAt;
    }

    /// @notice Get total number of goals in the vault
    /// @return count Total number of goals
    function getTotalGoals() external view returns (uint256 count) {
        return _goals.length;
    }

    /// @notice Check if a goal exists
    /// @param id The goal ID
    /// @return exists True if goal exists
    function goalExists(uint256 id) external view returns (bool exists) {
        return id < _goals.length;
    }
}

