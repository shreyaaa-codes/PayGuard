require('@nomiclabs/hardhat-ethers');

module.exports = {
  solidity: '0.8.19',
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545'
    }
    // Add Monad testnet config here when available
  }
};
