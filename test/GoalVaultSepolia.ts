import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { GoalVault } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("GoalVaultSepolia", function () {
  let signers: Signers;
  let goalVaultContract: GoalVault;
  let goalVaultContractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const GoalVaultDeployment = await deployments.get("GoalVault");
      goalVaultContractAddress = GoalVaultDeployment.address;
      goalVaultContract = await ethers.getContractAt("GoalVault", GoalVaultDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("should create a goal and update progress on Sepolia", async function () {
    steps = 15;

    this.timeout(4 * 60000);

    progress("Preparing test data...");
    const title = "Sepolia Test Goal";
    const description = "Test goal created on Sepolia";
    const encryptedDescription = ethers.toUtf8Bytes(description);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60);
    const priority = 3;

    progress("Encrypting deadline...");
    const encryptedDeadline = await fhevm
      .createEncryptedInput(goalVaultContractAddress, signers.alice.address)
      .add64(deadline)
      .encrypt();

    progress("Encrypting priority...");
    const encryptedPriority = await fhevm
      .createEncryptedInput(goalVaultContractAddress, signers.alice.address)
      .add8(priority)
      .encrypt();

    progress(`Creating goal: ${title}...`);
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

    progress("Fetching goal IDs...");
    const goalIds = await goalVaultContract.getGoalIdsByOwner(signers.alice.address);
    expect(goalIds.length).to.be.gte(1);

    const goalId = goalIds[goalIds.length - 1];

    progress(`Verifying goal metadata...`);
    const meta = await goalVaultContract.getGoalMeta(goalId);
    expect(meta[0]).to.eq(signers.alice.address);
    expect(meta[1]).to.eq(title);

    progress("Getting encrypted progress...");
    const encProgressBefore = await goalVaultContract.getEncryptedProgress(goalId);
    expect(encProgressBefore).to.not.eq(ethers.ZeroHash);

    progress("Decrypting initial progress...");
    const clearProgressBefore = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encProgressBefore,
      goalVaultContractAddress,
      signers.alice,
    );
    progress(`Initial progress: ${clearProgressBefore}`);

    progress("Encrypting new progress value (50)...");
    const newProgress = 50;
    const encryptedProgress = await fhevm
      .createEncryptedInput(goalVaultContractAddress, signers.alice.address)
      .add8(newProgress)
      .encrypt();

    progress(`Updating progress to ${newProgress}%...`);
    tx = await goalVaultContract
      .connect(signers.alice)
      .updateProgress(goalId, encryptedProgress.handles[0], encryptedProgress.inputProof);
    await tx.wait();

    progress("Getting updated encrypted progress...");
    const encProgressAfter = await goalVaultContract.getEncryptedProgress(goalId);

    progress("Decrypting updated progress...");
    const clearProgressAfter = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encProgressAfter,
      goalVaultContractAddress,
      signers.alice,
    );
    progress(`Updated progress: ${clearProgressAfter}`);

    expect(clearProgressAfter).to.eq(newProgress);
  });
});

