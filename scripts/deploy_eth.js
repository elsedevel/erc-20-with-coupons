require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const TOKENContract = await ethers.getContractFactory("ERC20WithCoupons");
  const [owner, foundationTokens, TokenTreasury, investorDao, couponSigner, alice] = await ethers.getSigners();

  const deployed = await TOKENContract.deploy(process.env.FOUNDATION_TOKENS, process.env.TOKEN_TREASURY, process.env.INVESTOR_DAO, process.env.COUPON_SIGNER);
  console.log("Contract address:", deployed.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });