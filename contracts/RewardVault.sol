// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardVault is Ownable {
    IERC20 public immutable usdc;
    uint256 public epochId;
    mapping(uint256 => bytes32) public epochRoots;
    mapping(bytes32 => bool) public claimed;
    bytes32 public currentRoot;
    
    event EpochSubmitted(uint256 indexed epochId, bytes32 merkleRoot);
    event RewardClaimed(address indexed worker, uint256 amount);
    
    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
    }
    
    function submitEpochRoot(bytes32 _merkleRoot) external onlyOwner {
        epochRoots[++epochId] = _merkleRoot;
        currentRoot = _merkleRoot;
        emit EpochSubmitted(epochId, _merkleRoot);
    }
    
    function claim(uint256 epoch, uint256 _amount, bytes32[] calldata _proof) external {
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, _amount));
        require(epochRoots[epoch] == currentRoot, "Invalid epoch");
        require(verifyMerkleProof(_proof, currentRoot, leaf), "Invalid proof");
        require(!claimed[leaf], "Already claimed");
        
        claimed[leaf] = true;
        usdc.transfer(msg.sender, _amount);
        emit RewardClaimed(msg.sender, _amount);
    }
    
    function verifyMerkleProof(bytes32[] memory proof, bytes32 root, bytes32 leaf) internal pure returns (bool) {
        bytes32 computedHash = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            computedHash = keccak256(abi.encodePacked(computedHash, proof[i]));
        }
        return computedHash == root;
    }
}
