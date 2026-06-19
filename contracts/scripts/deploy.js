const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log('Deploying contracts with the account:', deployer.address);

  const Escrow = await hre.ethers.getContractFactory('Escrow');
  // pass a reviewer address placeholder (set after deploy with setReviewer)
  const escrow = await Escrow.deploy(deployer.address);
  await escrow.deployed();

  console.log('Escrow deployed to:', escrow.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
