// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";


contract ERC20WithCoupons is ERC20, ERC20Burnable, Ownable2Step, AccessControl {
    bytes32 public constant SIGNER_CHANGER = keccak256("SIGNER_CHANGER_ROLE");

    address public couponSigner;
    
    mapping(uint => uint40) public lastClaimed; // Information when the last claim for a token happened (0 when no one happened yet)

    uint40 immutable claimStart; // Set to the current timestamp on deployment

    // Fixed mint amounts per NFT (for NFT holders on first claim)
    uint256 constant private TYPE1_INITIAL_TOKENS = 200_000 * 1e18; //change var name
    uint256 constant private TYPE1_INITIAL_TOKENS = 81_000 * 1e18;

    // Vesting amounts per second
    uint256 constant private TYPE1_TOKENS_PER_SEC = 2_854_779_831_165_868; // 90090 * 10^18 / (365.25 * 24 * 60 * 60)
    uint256 constant private TYPE2_TOKENS_PER_SEC = 1_425_963_951_631_303; // 45000 * 10^18 / (365.25 * 24 * 60 * 60)

    // Fixed mint amounts (distribution in the beginning)
    uint256 constant private FOUNDATION_TOKENS = 200_000_000 * 1e18;
    uint256 constant private TREASURY_TOKENS = 493_600_000 * 1e18;
    uint256 constant private DAO_TOKENS = 100_000_000 * 1e18;
    uint256 chainId = block.chainid;

    constructor(
        address _foundation,
        address _tokenTreasury,
        address _investorDao,
        address _couponSigner
    ) ERC20("ERC 20 tokens with coupons", "ERCC") {
        require(_couponSigner != address(0), "Wrong address");
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SIGNER_CHANGER, msg.sender);
        couponSigner = _couponSigner;
        _mint(_foundation, FOUNDATION_TOKENS);
        _mint(_tokenTreasury, TREASURY_TOKENS);
        _mint(_investorDao, DAO_TOKENS);
        claimStart = uint40(block.timestamp);
    }

    /// @notice Claim for _tokenId, only callable by the owner of the NFT
    function claim(uint _tokenId, uint _deadline, bool _isHigher, uint8 _v, bytes32 _r, bytes32 _s) external {
        require(
            _isVerifiedCoupon(_tokenId, _deadline, _isFounder, _v, _r, _s),
            "Only callable by token owner"
        );
        uint40 lastClaim = lastClaimed[_tokenId];
        if (lastClaim == 0) {
            // First claim, mint initial tokens and use deployment timestamp for following calculation
            if (_isHigher) {
                _mint(msg.sender, TYPE1_INITIAL_TOKENS);
            } else {
                _mint(msg.sender, TYPE2_INITIAL_TOKENS);
            }
            lastClaim = claimStart;
        }
        uint40 timeSinceLastClaim = uint40(block.timestamp) - lastClaim;
        if (_isHigher) {
            _mint(msg.sender, TYPE1_TOKENS_PER_SEC * timeSinceLastClaim);
        } else {
            _mint(msg.sender, TYPE2_TOKENS_PER_SEC * timeSinceLastClaim);
        }
        lastClaimed[_tokenId] = uint40(block.timestamp);
    }

    /// @dev check that the coupon sent was signed by the admin signer
    function _isVerifiedCoupon(
        uint256 _tokenID,
        uint256 _deadline,
        bool _isHigher,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) internal view returns (bool) {
        require(_deadline >= block.timestamp, "Coupon no longer active");
        bytes32 digest = keccak256(abi.encode(_tokenID, msg.sender, _deadline, _isHigher, chainId));
        address signer = ecrecover(digest, _v, _r, _s);
        return signer == couponSigner;
    }
   
    /**
     * @notice Updates couponSigner
     *
     * @param _couponSigner new coupon signer address
     */
    function setCouponSigner(address _couponSigner) external onlyRole(SIGNER_CHANGER) {
        require(_couponSigner != address(0), "Wrong address");
        require(_couponSigner != couponSigner, "Submit new signer");
        couponSigner = _couponSigner;
    }

}
