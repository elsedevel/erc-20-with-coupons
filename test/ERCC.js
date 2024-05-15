const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { BigNumber } = require('ethers');
const { ethers } = require("hardhat");
const WAD = BigNumber.from(10).pow(18);


describe("ERCC Token", function () {
  async function deployERCCToken() {
    const ERCC = await ethers.getContractFactory("ERC20WithCoupons");
    const [owner, foundationTokens, ERCCTokenTreasury, investorDao, signerChanger, alice ] = await ethers.getSigners();

    const ERC721 = await ethers.getContractFactory("ERC721PresetMinterPauserAutoId");

    const testNFT = await ERC721.deploy("Test", "TST", "http://test.dev");

    const ERCC = await ERCC.deploy(foundationTokens.address, ERCCTokenTreasury.address, investorDao.address, signerChanger.address, testNFT.address);
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const deploymentTimetamp = blockBefore.timestamp;


    return { ERCC, owner, foundationTokens, ERCCTokenTreasury, investorDao, signerChanger, testNFT, alice, deploymentTimetamp };
  }

  describe("ERCC Token", function () {
    it("Should have correct decimals", async function () {
      const { ERCC } = await loadFixture(deployERCCToken);
      expect(await ERCC.decimals()).to.be.equal(18);
    });

    it("Should have correct name", async function () {
      const { ERCC } = await loadFixture(deployERCCToken);
      expect(await ERCC.name()).to.be.equal("ERCC Foundation Token");
    });

    it("Should have correct symbol", async function () {
      const { ERCC } = await loadFixture(deployERCCToken);
      expect(await ERCC.symbol()).to.be.equal("ERCC");
    });

    it("Should have 793.6M tokens initially minted", async function () {
      const { ERCC } = await loadFixture(deployERCCToken);
      expect(await ERCC.totalSupply()).to.be.equal(BigNumber.from(7936000000).mul(WAD));
    });

    it("Should have 200M tokens for foundation", async function () {
      const { ERCC, foundationTokens } = await loadFixture(deployERCCToken);
      expect(await ERCC.balanceOf(foundationTokens.address)).to.be.equal(BigNumber.from(150000000).mul(WAD));
    });

    it("Should have 493.6M tokens for treasury", async function () {
      const { ERCC, ERCCTokenTreasury } = await loadFixture(deployERCCToken);
      expect(await ERCC.balanceOf(ERCCTokenTreasury.address)).to.be.equal(BigNumber.from(493600000).mul(WAD));
    });

    it("Should have 100M tokens for DAO", async function () {
      const { ERCC, investorDao } = await loadFixture(deployERCCToken);
      expect(await ERCC.balanceOf(investorDao.address)).to.be.equal(BigNumber.from(100000000).mul(WAD));
    });


    it("Claiming non-existing NFT should fail", async function () {
      const { ERCC } = await loadFixture(deployERCCToken);
      await expect(ERCC.claim(1)).to.be.revertedWith("ERC721: invalid token ID");
    });

    it("Claiming without NFT should fail", async function () {
      const { ERCC, testNFT, alice } = await loadFixture(deployERCCToken);
      await testNFT.mint(alice.address);
      await testNFT.mint(alice.address);
      await expect(ERCC.claim(1)).to.be.revertedWith("Only callable by token owner");
    });
    it("Claiming with founder NFT should work correctly", async function () {
      const { ERCC, testNFT, alice, deploymentTimetamp } = await loadFixture(deployERCCToken);
      await testNFT.mint(alice.address);
      await testNFT.mint(alice.address);
      await ERCC.connect(alice).claim(1);
      const blockNumBefore = await ethers.provider.getBlockNumber();
      const blockBefore = await ethers.provider.getBlock(blockNumBefore);
      const now = blockBefore.timestamp;
      const expectedBalance = BigNumber.from(38000).mul(WAD).add(BigNumber.from(now - deploymentTimetamp).mul(316880878140290));
      expect(await ERCC.balanceOf(alice.address)).to.be.equal(expectedBalance);
    });
    it("Claiming with special NFT should work correctly", async function () {
      const { ERCC, testNFT, alice, owner, deploymentTimetamp } = await loadFixture(deployERCCToken);
      for (let i = 0; i <= 1000; i++) {
        await testNFT.mint(owner.address);
      }
      await testNFT.mint(alice.address);
      await ERCC.connect(alice).claim(1001);
      const blockNumBefore = await ethers.provider.getBlockNumber();
      const blockBefore = await ethers.provider.getBlock(blockNumBefore);
      const now = blockBefore.timestamp;
      const expectedBalance = BigNumber.from(18000).mul(WAD).add(BigNumber.from(now - deploymentTimetamp).mul(158440439070145));
      expect(await ERCC.balanceOf(alice.address)).to.be.equal(expectedBalance);
    });
  });

  describe("setCouponSigner", function () {
    it("Should revert if called by an account without the SIGNER_CHANGER role", async function () {
      await expect(myContract.connect(addr1).setCouponSigner(addr2.address))
        .to.be.revertedWith("AccessControl: account " + addr1.address.toLowerCase() + " is missing role " + SIGNER_CHANGER_ROLE);
    });

    it("Should update couponSigner when called by an account with the SIGNER_CHANGER role", async function () {
      await myContract.connect(signerChanger).setCouponSigner(addr2.address);
      expect(await myContract.couponSigner()).to.equal(addr2.address);
    });

    it("Should revert if trying to set couponSigner to the zero address", async function () {
      await expect(myContract.connect(signerChanger).setCouponSigner(ethers.constants.AddressZero))
        .to.be.revertedWith("Wrong address");
    });
  });
});