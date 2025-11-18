import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, log } = hre.deployments;
  const networkName = hre.network.name;

  const deployed = await deploy("GoalVault", {
    from: deployer,
    log: true,
    args: [],
    waitConfirmations: networkName === "localhost" ? 0 : 2,
  });

  log(`GoalVault contract deployed to ${networkName} at: ${deployed.address}`);
  
  if (networkName !== "localhost" && deployed.newlyDeployed) {
    log(`Verifying contract on ${networkName}...`);
    try {
      await hre.run("verify:verify", {
        address: deployed.address,
        constructorArguments: [],
      });
    } catch (error) {
      log(`Verification failed: ${error}`);
    }
  }
};

export default func;
func.id = "deploy_goalvault"; // id required to prevent reexecution
func.tags = ["GoalVault"];

