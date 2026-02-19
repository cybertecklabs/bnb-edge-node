// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ReputationOracle — On-Chain AI Node Health Predictor
/// @notice Score formula: (successRate × 70) + (uptimeScore × 25) + (stakeBonus × 5)

interface INodeReg {
    struct Node {
        address operator; uint8 nodeType; uint8 status; uint256 stakedAmount;
        uint256 registeredAt; uint256 jobsCompleted; uint256 jobsFailed;
        uint256 totalUptime; uint256 lastHeartbeat; string metadataURI; uint256 reputationScore;
    }
    function getNode(address operator) external view returns (Node memory);
    function updateReputation(address operator, uint256 score) external;
}

contract ReputationOracle is Ownable {
    struct ScoreSnapshot { uint256 score; uint256 timestamp; bool alertTriggered; }

    uint256 public constant WEIGHT_SUCCESS = 70;
    uint256 public constant WEIGHT_UPTIME = 25;
    uint256 public constant WEIGHT_STAKE = 5;
    uint256 public constant ALERT_THRESHOLD = 70;
    uint256 public constant CRITICAL_THRESHOLD = 40;
    uint256 public constant MIN_STAKE_BONUS = 0.05 ether;

    INodeReg public nodeRegistry;
    mapping(address => ScoreSnapshot[]) public scoreHistory;
    mapping(address => bool) public criticalNodes;

    error NodeNotCritical();
    error InsufficientHistory();

    event ScoreComputed(address indexed node, uint256 score, uint256 timestamp);
    event AlertTriggered(address indexed node, uint256 score, string severity);
    event AutoReassignmentSignaled(address indexed failingNode, uint256 affectedJobs);

    constructor(address _nodeRegistry) Ownable(msg.sender) {
        nodeRegistry = INodeReg(_nodeRegistry);
    }

    function predictNodeReliability(address node) public view returns (uint256 score) {
        INodeReg.Node memory n = nodeRegistry.getNode(node);
        uint256 totalJobs = n.jobsCompleted + n.jobsFailed;
        uint256 successComponent;
        if (totalJobs > 0) { successComponent = (n.jobsCompleted * WEIGHT_SUCCESS) / totalJobs; }
        else { successComponent = 35; }

        uint256 timeSinceHeartbeat = block.timestamp - n.lastHeartbeat;
        uint256 uptimeScore;
        if (timeSinceHeartbeat < 5 minutes) { uptimeScore = 100; }
        else if (timeSinceHeartbeat < 15 minutes) { uptimeScore = 70; }
        else if (timeSinceHeartbeat < 1 hours) { uptimeScore = 40; }
        else if (timeSinceHeartbeat < 6 hours) { uptimeScore = 10; }
        else { uptimeScore = 0; }
        uint256 uptimeComponent = (uptimeScore * WEIGHT_UPTIME) / 100;

        uint256 stakeBonus;
        if (n.stakedAmount >= 3 * MIN_STAKE_BONUS) { stakeBonus = WEIGHT_STAKE; }
        else if (n.stakedAmount >= 2 * MIN_STAKE_BONUS) { stakeBonus = (WEIGHT_STAKE * 70) / 100; }
        else if (n.stakedAmount >= MIN_STAKE_BONUS) { stakeBonus = (WEIGHT_STAKE * 40) / 100; }
        else { stakeBonus = 0; }

        score = successComponent + uptimeComponent + stakeBonus;
        if (score > 100) score = 100;
    }

    function updateScore(address node) external returns (uint256 score) {
        score = predictNodeReliability(node);
        nodeRegistry.updateReputation(node, score);
        bool isAlert = score < ALERT_THRESHOLD;
        scoreHistory[node].push(ScoreSnapshot({ score: score, timestamp: block.timestamp, alertTriggered: isAlert }));
        if (score < CRITICAL_THRESHOLD) {
            criticalNodes[node] = true;
            emit AlertTriggered(node, score, "CRITICAL");
        } else if (score < ALERT_THRESHOLD) {
            emit AlertTriggered(node, score, "WARNING");
        }
        if (score >= CRITICAL_THRESHOLD) { criticalNodes[node] = false; }
        emit ScoreComputed(node, score, block.timestamp);
    }

    function batchUpdateScores(address[] calldata _nodes) external {
        for (uint256 i = 0; i < _nodes.length; i++) { this.updateScore(_nodes[i]); }
    }

    function signalReassignment(address failingNode, uint256 affectedJobs) external {
        if (!criticalNodes[failingNode]) revert NodeNotCritical();
        emit AutoReassignmentSignaled(failingNode, affectedJobs);
    }

    function getScoreHistory(address node) external view returns (ScoreSnapshot[] memory) { return scoreHistory[node]; }
    function isCritical(address node) external view returns (bool) { return criticalNodes[node]; }

    function scoreTrend(address node) external view returns (int256 trend) {
        ScoreSnapshot[] storage history = scoreHistory[node];
        if (history.length < 2) revert InsufficientHistory();
        trend = int256(history[history.length - 1].score) - int256(history[history.length - 2].score);
    }
}
