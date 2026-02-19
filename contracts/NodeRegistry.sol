// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title NodeRegistry — DePIN Node Registration & Staking
/// @notice Handles node operator registration, BNB staking, heartbeat uptime tracking,
///         reputation updates, and slashing for the BNB Edge DePIN Node protocol.
/// @dev Deployed on opBNB (Chain ID: 204). Uses OpenZeppelin v5 Ownable + ReentrancyGuard.

contract NodeRegistry is Ownable, ReentrancyGuard {

    // ── ENUMS ──

    enum NodeType { GPU, STORAGE }
    enum NodeStatus { INACTIVE, ACTIVE, SLASHED }

    // ── STRUCTS ──

    struct Node {
        address operator;
        NodeType nodeType;
        NodeStatus status;
        uint256 stakedAmount;
        uint256 registeredAt;
        uint256 jobsCompleted;
        uint256 jobsFailed;
        uint256 totalUptime;
        uint256 lastHeartbeat;
        string metadataURI;
        uint256 reputationScore;
    }

    // ── CONSTANTS ──

    uint256 public constant MIN_STAKE_GPU = 0.05 ether;
    uint256 public constant MIN_STAKE_STORAGE = 0.02 ether;
    uint256 public constant SLASH_PERCENT = 10;
    uint256 public constant HEARTBEAT_WINDOW = 5 minutes;

    // ── STATE ──

    mapping(address => Node) public nodes;
    address[] public nodeList;
    address public reputationOracle;
    address public jobMarketplace;
    address public porepVerifier;

    // ── CUSTOM ERRORS ──

    error InsufficientStake(uint256 required, uint256 provided);
    error NodeAlreadyRegistered();
    error NodeNotActive();
    error UnauthorizedCaller();
    error InvalidReputationScore();
    error TransferFailed();

    // ── EVENTS ──

    event NodeRegistered(address indexed operator, NodeType nodeType, uint256 stakedAmount, string metadataURI);
    event NodeSlashed(address indexed operator, uint256 slashAmount, uint256 remainingStake, string reason);
    event NodeDeregistered(address indexed operator, uint256 refundAmount);
    event HeartbeatReceived(address indexed operator, uint256 uptimeAdded, uint256 totalUptime);
    event ReputationUpdated(address indexed operator, uint256 oldScore, uint256 newScore);

    // ── MODIFIERS ──

    modifier onlyActiveNode() {
        if (nodes[msg.sender].status != NodeStatus.ACTIVE) revert NodeNotActive();
        _;
    }

    modifier onlyJobMarketplace() {
        if (msg.sender != jobMarketplace) revert UnauthorizedCaller();
        _;
    }

    modifier onlyReputationOracle() {
        if (msg.sender != reputationOracle) revert UnauthorizedCaller();
        _;
    }

    // ── CONSTRUCTOR ──

    constructor() Ownable(msg.sender) {}

    // ── EXTERNAL FUNCTIONS ──

    /// @notice Register a new node with BNB stake
    /// @param _type The type of node (GPU or STORAGE)
    /// @param _metadata IPFS URI pointing to hardware specs JSON
    function registerNode(NodeType _type, string calldata _metadata) external payable {
        if (nodes[msg.sender].operator != address(0)) revert NodeAlreadyRegistered();

        uint256 minStake = _type == NodeType.GPU ? MIN_STAKE_GPU : MIN_STAKE_STORAGE;
        if (msg.value < minStake) revert InsufficientStake(minStake, msg.value);

        nodes[msg.sender] = Node({
            operator: msg.sender,
            nodeType: _type,
            status: NodeStatus.ACTIVE,
            stakedAmount: msg.value,
            registeredAt: block.timestamp,
            jobsCompleted: 0,
            jobsFailed: 0,
            totalUptime: 0,
            lastHeartbeat: block.timestamp,
            metadataURI: _metadata,
            reputationScore: 75
        });

        nodeList.push(msg.sender);

        emit NodeRegistered(msg.sender, _type, msg.value, _metadata);
    }

    /// @notice Send a heartbeat to prove node liveness
    /// @dev Adds elapsed time to totalUptime if within HEARTBEAT_WINDOW
    function heartbeat() external onlyActiveNode {
        Node storage node = nodes[msg.sender];
        uint256 elapsed = block.timestamp - node.lastHeartbeat;
        uint256 uptimeAdded = 0;

        if (elapsed <= HEARTBEAT_WINDOW) {
            uptimeAdded = elapsed;
            node.totalUptime += elapsed;
        }

        node.lastHeartbeat = block.timestamp;

        emit HeartbeatReceived(msg.sender, uptimeAdded, node.totalUptime);
    }

    /// @notice Deregister node and refund staked BNB
    function deregister() external nonReentrant onlyActiveNode {
        Node storage node = nodes[msg.sender];
        uint256 refund = node.stakedAmount;

        // CEI: state changes before external call
        node.status = NodeStatus.INACTIVE;
        node.stakedAmount = 0;

        (bool success, ) = payable(msg.sender).call{value: refund}("");
        if (!success) revert TransferFailed();

        emit NodeDeregistered(msg.sender, refund);
    }

    /// @notice Record a completed job for a node operator
    /// @param operator The node operator address
    function recordJobCompleted(address operator) external onlyJobMarketplace {
        nodes[operator].jobsCompleted += 1;
    }

    /// @notice Record a failed job and trigger slashing
    /// @param operator The node operator address
    function recordJobFailed(address operator) external onlyJobMarketplace {
        nodes[operator].jobsFailed += 1;
        _slash(operator, "Job failed");
    }

    /// @notice Update a node's reputation score (called by ReputationOracle)
    /// @param operator The node operator address
    /// @param score New reputation score (0-100)
    function updateReputation(address operator, uint256 score) external onlyReputationOracle {
        if (score > 100) revert InvalidReputationScore();

        uint256 oldScore = nodes[operator].reputationScore;
        nodes[operator].reputationScore = score;

        emit ReputationUpdated(operator, oldScore, score);
    }

    /// @notice Set the ReputationOracle contract address
    /// @param _oracle Address of the ReputationOracle contract
    function setReputationOracle(address _oracle) external onlyOwner {
        reputationOracle = _oracle;
    }

    /// @notice Set the JobMarketplace contract address
    /// @param _marketplace Address of the JobMarketplace contract
    function setJobMarketplace(address _marketplace) external onlyOwner {
        jobMarketplace = _marketplace;
    }

    /// @notice Set the PoRep Verifier contract address
    function setPoRepVerifier(address _verifier) external onlyOwner {
        porepVerifier = _verifier;
    }

    function recordVerificationSuccess(address operator) external {
        require(msg.sender == porepVerifier, "Unauthorized");
        nodes[operator].reputationScore = nodes[operator].reputationScore + 10;
        if (nodes[operator].reputationScore > 100) nodes[operator].reputationScore = 100;
    }

    function recordVerificationFailure(address operator) external {
        require(msg.sender == porepVerifier, "Unauthorized");
        _slash(operator, "PoRep hardware verification failed");
    }

    // ── VIEW FUNCTIONS ──

    /// @notice Get full node data for an operator
    /// @param operator The node operator address
    /// @return The Node struct
    function getNode(address operator) external view returns (Node memory) {
        return nodes[operator];
    }

    /// @notice Get all registered node addresses
    /// @return Array of node operator addresses
    function getAllNodes() external view returns (address[] memory) {
        return nodeList;
    }

    /// @notice Count currently active nodes
    /// @return count Number of active nodes
    function activeNodeCount() external view returns (uint256 count) {
        for (uint256 i = 0; i < nodeList.length; i++) {
            if (nodes[nodeList[i]].status == NodeStatus.ACTIVE) {
                count++;
            }
        }
    }

    /// @notice Get the top N nodes by reputation score
    /// @param limit Maximum number of nodes to return
    /// @return topNodes Array of top node addresses (sorted desc by reputation)
    function getTopNodes(uint256 limit) external view returns (address[] memory) {
        uint256 len = nodeList.length;
        if (limit > len) limit = len;

        // Simple selection sort for top nodes
        address[] memory sorted = new address[](len);
        for (uint256 i = 0; i < len; i++) {
            sorted[i] = nodeList[i];
        }

        for (uint256 i = 0; i < limit; i++) {
            for (uint256 j = i + 1; j < len; j++) {
                if (nodes[sorted[j]].reputationScore > nodes[sorted[i]].reputationScore) {
                    (sorted[i], sorted[j]) = (sorted[j], sorted[i]);
                }
            }
        }

        address[] memory topNodes = new address[](limit);
        for (uint256 i = 0; i < limit; i++) {
            topNodes[i] = sorted[i];
        }
        return topNodes;
    }

    // ── INTERNAL FUNCTIONS ──

    /// @dev Slash a percentage of a node's stake and send to treasury
    /// @param operator The node operator to slash
    /// @param reason Human-readable reason for the slash
    function _slash(address operator, string memory reason) internal {
        Node storage node = nodes[operator];
        uint256 slashAmount = (node.stakedAmount * SLASH_PERCENT) / 100;

        // CEI: state change before external call
        node.stakedAmount -= slashAmount;

        uint256 minStake = node.nodeType == NodeType.GPU ? MIN_STAKE_GPU : MIN_STAKE_STORAGE;
        if (node.stakedAmount < minStake / 2) {
            node.status = NodeStatus.SLASHED;
        }

        (bool success, ) = payable(owner()).call{value: slashAmount}("");
        if (!success) revert TransferFailed();

        emit NodeSlashed(operator, slashAmount, node.stakedAmount, reason);
    }
}
