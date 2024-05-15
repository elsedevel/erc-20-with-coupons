# ERC20 Tokens With Coupons (Merkle Tree)

Smart contract that implements the ERC20 token with a fixed initial mint to predetermined addresses and vesting (with an initial amount) for holders of the scecial NFTs. Use Merkle Tree for generating coupons.

## Deployment

The following environment variables need to be set to the address of the correct contract:
- FOUNDATION_TOKENS
- TOKEN_TREASURY
- INVESTOR_DAO
- COUPON_SIGNER
Then, the deployment script `scripts/deploy_eth.js` can be used.

## Testing

```
npx hardhat test
```