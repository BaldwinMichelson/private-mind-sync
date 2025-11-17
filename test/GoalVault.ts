import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { GoalVault, GoalVault__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("GoalVault")) as GoalVault__factory;
  const goalVaultContract = (await factory.deploy()) as GoalVault;
  const goalVaultContractAddress = await goalVaultContract.getAddress();

  return { goalVaultContract, goalVaultContractAddress };
}

describe("GoalVault", function () {
  let signers: Signers;
  let goalVaultContract: GoalVault;
  let goalVaultContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ goalVaultContract, goalVaultContractAddress } = await deployFixture());
    await fhevm.initializeCLIApi();
  });

  it("should reject invalid goal ID in updateProgress", async function () {
    const invalidId = 999999;
    const progress = 50;
    const { encryptedProgress, progressProof } = await fhevm.encrypt8(progress, goalVaultContractAddress);
    await expect(
      goalVaultContract.updateProgress(invalidId, encryptedProgress, progressProof)
    ).to.be.revertedWith("Goal does not exist");
  });

  it("should reject non-owner updateProgress", async function () {
    const title = "Test Goal";
    const encryptedDescription = ethers.toUtf8Bytes("Test description");
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60);
    const priority = 3;
    const { encryptedDeadline, deadlineProof } = await fhevm.encrypt64(deadline, goalVaultContractAddress);
    const { encryptedPriority, priorityProof } = await fhevm.encrypt8(priority, goalVaultContractAddress);
    
    await goalVaultContract.createGoal(
      title,
      encryptedDescription,
      encryptedDeadline,
      encryptedPriority,
      deadlineProof,
      priorityProof
    );
    
    const { encryptedProgress, progressProof } = await fhevm.encrypt8(50, goalVaultContractAddress);
    await expect(
      goalVaultContract.connect(signers.bob).updateProgress(0, encryptedProgress, progressProof)
    ).to.be.revertedWith("Not goal owner");
  });

  it("should create a goal with encrypted data", async function () {
    const title = "Learn Solidity";
    const description = "Master Solidity programming";
    // Simulate encrypted description (in real app, this would be client-side encrypted)
    const encryptedDescription = ethers.toUtf8Bytes(description);
    
    // Get future timestamp (30 days from now)
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60);
    const priority = 3; // Priority 1-5

    // Encrypt deadline and priority
    const encryptedDeadline = await fhevm
      .createEncryptedInput(goalVaultContractAddress, signers.alice.address)
      .add64(deadline)
      .encrypt();

    const encryptedPriority = await fhevm
      .createEncryptedInput(goalVaultContractAddress, signers.alice.address)
      .add8(priority)
      .encrypt();

    const tx = await goalVaultContract
      .connect(signers.alice)
      .createGoal(
        title,
        encryptedDescription,
        encryptedDeadline.handles[0],
        encryptedPriority.handles[0],
        encryptedDeadline.inputProof,
        encryptedPriority.inputProof
      );
    await tx.wait();

    const goalIds = await goalVaultContract.getGoalIdsByOwner(signers.alice.address);
    expect(goalIds.length).to.eq(1);

    const meta = await goalVaultContract.getGoalMeta(goalIds[0]);
    expect(meta[0]).to.eq(signers.alice.address);
    expect(meta[1]).to.eq(title);
    expect(meta[3]).to.eq(false); // isCompleted

    // Verify encrypted fields are stored
    const encDeadline = await goalVaultContract.getEncryptedDeadline(goalIds[0]);
    expect(encDeadline).to.not.eq(ethers.ZeroHash);

    const encPriority = await goalVaultContract.getEncryptedPriority(goalIds[0]);
    expect(encPriority).to.not.eq(ethers.ZeroHash);
  });

  it("should update goal progress", async function () {
    // First create a goal
    const title = "Build DApp";
    const encryptedDescription = ethers.toUtf8Bytes("Build a decentralized application");
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60);
    const priority = 4;

    const encryptedDeadline = await fhevm
      .createEncryptedInput(goalVaultContractAddress, signers.alice.address)
      .add64(deadline)
      .encrypt();

    const encryptedPriority = await fhevm
      .createEncryptedInput(goalVaultContractAddress, signers.alice.address)
      .add8(priority)
      .encrypt();

    let tx = await goalVaultContract
      .connect(signers.alice)
      .createGoal(
        title,
        encryptedDescription,
        encryptedDeadline.handles[0],
        encryptedPriority.handles[0],
        encryptedDeadline.inputProof,
        encryptedPriority.inputProof
      );
    await tx.wait();

    const goalIds = await goalVaultContract.getGoalIdsByOwner(signers.alice.address);
    const goalId = goalIds[0];

    // Update progress to 50%
    const progress = 50;
    const encryptedProgress = await fhevm
      .createEncryptedInput(goalVaultContractAddress, signers.alice.address)
      .add8(progress)
      .encrypt();

    tx = await goalVaultContract
      .connect(signers.alice)
      .updateProgress(goalId, encryptedProgress.handles[0], encryptedProgress.inputProof);
    await tx.wait();

    // Decrypt and verify progress
    const encProgress = await goalVaultContract.getEncryptedProgress(goalId);
    const clearProgress = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encProgress,
      goalVaultContractAddress,
      signers.alice,
    );

    expect(clearProgress).to.eq(progress);
  });

  it("should complete a goal", async function () {
    // Create a goal
    const title = "Complete Project";
    const encryptedDescription = ethers.toUtf8Bytes("Finish the project");
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60);
    const priority = 5;

    const encryptedDeadline = await fhevm
      .createEncryptedInput(goalVaultContractAddress, signers.alice.address)
      .add64(deadline)
      .encrypt();

    const encryptedPriority = await fhevm
      .createEncryptedInput(goalVaultContractAddress, signers.alice.address)
      .add8(priority)
      .encrypt();

    let tx = await goalVaultContract
      .connect(signers.alice)
      .createGoal(
        title,
        encryptedDescription,
        encryptedDeadline.handles[0],
        encryptedPriority.handles[0],
        encryptedDeadline.inputProof,
        encryptedPriority.inputProof
      );
    await tx.wait();

    const goalIds = await goalVaultContract.getGoalIdsByOwner(signers.alice.address);
    const goalId = goalIds[0];

    // Complete the goal
    const completedAt = BigInt(Math.floor(Date.now() / 1000));
    const encryptedCompletedAt = await fhevm
      .createEncryptedInput(goalVaultContractAddress, signers.alice.address)
      .add64(completedAt)
      .encrypt();

    tx = await goalVaultContract
      .connect(signers.alice)
      .completeGoal(goalId, encryptedCompletedAt.handles[0], encryptedCompletedAt.inputProof);
    await tx.wait();

    // Verify goal is completed
    const meta = await goalVaultContract.getGoalMeta(goalId);
    expect(meta[3]).to.eq(true); // isCompleted

    // Verify completed timestamp
    const encCompletedAt = await goalVaultContract.getEncryptedCompletedAt(goalId);
    const clearCompletedAt = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encCompletedAt,
      goalVaultContractAddress,
      signers.alice,
    );

    expect(clearCompletedAt).to.be.gte(completedAt);
  });

  it("should prevent updating completed goal", async function () {
    // Create and complete a goal
    const title = "Test Goal";
    const encryptedDescription = ethers.toUtf8Bytes("Test description");
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60);
    const priority = 2;

    const encryptedDeadline = await fhevm
      .createEncryptedInput(goalVaultContractAddress, signers.alice.address)
      .add64(deadline)
      .encrypt();

    const encryptedPriority = await fhevm
      .createEncryptedInput(goalVaultContractAddress, signers.alice.address)
      .add8(priority)
      .encrypt();

    let tx = await goalVaultContract
      .connect(signers.alice)
      .createGoal(
        title,
        encryptedDescription,
        encryptedDeadline.handles[0],
        encryptedPriority.handles[0],
        encryptedDeadline.inputProof,
        encryptedPriority.inputProof
      );
    await tx.wait();

    const goalIds = await goalVaultContract.getGoalIdsByOwner(signers.alice.address);
    const goalId = goalIds[0];

    // Complete the goal
    const completedAt = BigInt(Math.floor(Date.now() / 1000));
    const encryptedCompletedAt = await fhevm
      .createEncryptedInput(goalVaultContractAddress, signers.alice.address)
      .add64(completedAt)
      .encrypt();

    tx = await goalVaultContract
      .connect(signers.alice)
      .completeGoal(goalId, encryptedCompletedAt.handles[0], encryptedCompletedAt.inputProof);
    await tx.wait();

    // Try to update progress - should fail
    const progress = 75;
    const encryptedProgress = await fhevm
      .createEncryptedInput(goalVaultContractAddress, signers.alice.address)
      .add8(progress)
      .encrypt();

    await expect(
      goalVaultContract
        .connect(signers.alice)
        .updateProgress(goalId, encryptedProgress.handles[0], encryptedProgress.inputProof)
    ).to.be.revertedWith("Goal already completed");
  });
});

