/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();


module.exports = {
  solidity: "0.8.9",
  networks: {
    localhost: {
      url: 'http://localhost:8545',
      accounts: [process.env.PRIVATE_KEY_LOCAL],
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  }
};
