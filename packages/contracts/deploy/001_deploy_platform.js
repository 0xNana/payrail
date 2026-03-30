function isLocalNetwork(name) {
  return name === "hardhat" || name === "localhost";
}

/** @type {import("hardhat-deploy/types").DeployFunction} */
const func = async (hre) => {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, log } = hre.deployments;
  const networkName = hre.network.name;

  if (isLocalNetwork(networkName)) {
    await deploy("MockERC20", {
      from: deployer,
      log: true,
      contract: "contracts/mocks/MockERC20.sol:MockERC20",
      args: ["Mock USD", "mUSD", 6],
    });
  } else {
    log(`Skipping MockERC20 deployment on ${networkName}; PayrailToken uses its native public ERC20 layer for now.`);
  }

  const token = await deploy("PayrailToken", {
    from: deployer,
    log: true,
    contract: "contracts/PayrailToken.sol:PayrailToken",
    args: ["Confidential Payrail USD", "cpUSD"],
  });

  await deploy("PayrailFactoryRegistry", {
    from: deployer,
    log: true,
    contract: "contracts/PayrailFactoryRegistry.sol:PayrailFactoryRegistry",
    args: [token.address],
  });
};

module.exports = func;
module.exports.id = "deploy_payrail_platform";
module.exports.tags = ["PayrailPlatform", "PayrailToken", "PayrailFactoryRegistry"];
