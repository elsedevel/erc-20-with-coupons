require("dotenv").config();
module.exports = [    
	process.env.FOUNDATION_TOKENS, 
	process.env.TOKEN_TREASURY,
	process.env.INVESTOR_DAO, 
	process.env.COUPON_SIGNER
  ];