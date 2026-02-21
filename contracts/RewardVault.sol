// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardVault is Ownable {
    IERC20 public immutable usdc;
    uint256 public epochId;
    mapping(uint256 => bytes32) public epochRoots;
    // claimKey = keccak256(epoch, worker) — prevents replay across epochs
    mapping(bytes32 => bool)    public claimed;

    event EpochSubmitted(uint256 indexed id, bytes32 root);
    event RewardClaimed(address indexed worker, uint256 epoch, uint256 amount);

    constructor(address _usdc) Ownable(msg.sender) { usdc = IERC20(_usdc); }

    /// @notice Owner submits the Merkle root for a new epoch
    function submitEpochRoot(bytes32 _root) external onlyOwner {
        epochRoots[++epochId] = _root;
        emit EpochSubmitted(epochId, _root);
    }

    /// @notice Fund the vault with USDC so workers can claim
    function fund(uint256 _amt) external {
        usdc.transferFrom(msg.sender, address(this), _amt);
    }

    /// @notice Worker claims their reward for a given epoch using a Merkle proof
    function claim(uint256 _epoch, uint256 _amount, bytes32[] calldata _proof) external {
        bytes32 root     = epochRoots[_epoch];
        require(root != bytes32(0), "Epoch not found");

        bytes32 leaf     = keccak256(abi.encodePacked(msg.sender, _amount));
        bytes32 claimKey = keccak256(abi.encodePacked(_epoch, msg.sender));

        require(!claimed[claimKey], "Already claimed");
        require(_verify(_proof, root, leaf), "Invalid proof");

        claimed[claimKey] = true;
        usdc.transfer(msg.sender, _amount);
        emit RewardClaimed(msg.sender, _epoch, _amount);
    }

    /// @dev Standard Merkle proof verifier — sorts pairs to match MerkleTree.js sortPairs:true
    function _verify(bytes32[] memory proof, bytes32 root, bytes32 leaf)
        internal pure returns (bool)
    {
        bytes32 h = leaf;
        for (uint i; i < proof.length; i++)
            h = h < proof[i]
                ? keccak256(abi.encodePacked(h, proof[i]))
                : keccak256(abi.encodePacked(proof[i], h));
        return h == root;
    }
}
