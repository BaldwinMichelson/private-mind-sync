import { task } from "hardhat/config";

task("account management", "Prints the list of account management", async (_taskArgs, hre) => {
  const account management = await hre.ethers.getSigners();

  for (const account of account management) {
    console.log(`${account.address}`);
  }
});

