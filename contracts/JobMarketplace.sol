// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title JobMarketplace — USDC Escrow for GPU Compute & Storage Jobs
/// @notice Two-sided marketplace with full job lifecycle: create → assign → complete → payout.
/// @dev 4% platform fee. Uses SafeERC20. Integrates with NodeRegistry for reputation.

interface INodeRegistry {
    struct Node {
        address operator;
        uint8 nodeType;
        uint8 status;
        uint256 stakedAmount;
        uint256 registeredAt;
        uint256 jobsCompleted;
        uint256 jobsFailed;
        uint256 totalUptime;
        uint256 lastHeartbeat;
        string metadataURI;
        uint256 reputationScore;
    }
    function getNode(address operator) external view returns (Node memory);
    function recordJobCompleted(address operator) external;
    function recordJobFailed(address operator) external;
}

contract JobMarketplace is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ── ENUMS ──
    enum JobType { GPU_COMPUTE, STORAGE }
    enum JobStatus { OPEN, ASSIGNED, COMPLETED, CANCELLED, DISPUTED }

    // ── STRUCTS ──
    struct Job {
        uint256 id;
        address client;
        address assignedNode;
        JobType jobType;
        JobStatus status;
        uint256 payment;
        uint256 createdAt;
        uint256 deadline;
        string inputCID;
        string outputCID;
        bytes32 resultHash;
        uint256 minRepScore;
    }

    // ── CONSTANTS ──
    uint256 public constant PLATFORM_FEE_BPS = 400;
    uint256 public constant DISPUTE_WINDOW = 1 hours;

    // ── STATE ──
    IERC20 public immutable usdc;
    INodeRegistry public nodeRegistry;
    uint256 public jobCount;
    address public treasury;

    mapping(uint256 => Job) public jobs;
    mapping(address => uint256[]) public clientJobs;
    mapping(address => uint256[]) public nodeJobs;

    // ── CUSTOM ERRORS ──
    error InvalidPayment();
    error JobNotOpen();
    error JobNotAssigned();
    error DeadlinePassed();
    error NotJobClient();
    error NotAssignedNode();
    error InsufficientReputation(uint256 required, uint256 actual);
    error InvalidJobStatus();

    // ── EVENTS ──
    event JobCreated(uint256 indexed jobId, address indexed client, JobType jobType, uint256 payment, string inputCID);
    event JobAssigned(uint256 indexed jobId, address indexed node);
    event JobCompleted(uint256 indexed jobId, address indexed node, string outputCID, bytes32 resultHash);
    event JobCancelled(uint256 indexed jobId, address indexed client, uint256 refundAmount);
    event JobDisputed(uint256 indexed jobId, address indexed client);
    event FeeCollected(uint256 indexed jobId, uint256 feeAmount, address treasury);

    constructor(address _usdc, address _nodeRegistry, address _treasury) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        nodeRegistry = INodeRegistry(_nodeRegistry);
        treasury = _treasury;
    }

    function createJob(
        JobType _type, uint256 _payment, uint256 _deadline,
        string calldata _inputCID, uint256 _minRep
    ) external nonReentrant {
        if (_payment == 0) revert InvalidPayment();
        jobCount++;
        uint256 jobId = jobCount;
        jobs[jobId] = Job({
            id: jobId, client: msg.sender, assignedNode: address(0),
            jobType: _type, status: JobStatus.OPEN, payment: _payment,
            createdAt: block.timestamp, deadline: _deadline, inputCID: _inputCID,
            outputCID: "", resultHash: bytes32(0), minRepScore: _minRep
        });
        clientJobs[msg.sender].push(jobId);
        usdc.safeTransferFrom(msg.sender, address(this), _payment);
        emit JobCreated(jobId, msg.sender, _type, _payment, _inputCID);
    }

    function acceptJob(uint256 _jobId) external nonReentrant {
        Job storage job = jobs[_jobId];
        if (job.status != JobStatus.OPEN) revert JobNotOpen();
        if (block.timestamp > job.deadline) revert DeadlinePassed();
        INodeRegistry.Node memory node = nodeRegistry.getNode(msg.sender);
        if (node.reputationScore < job.minRepScore)
            revert InsufficientReputation(job.minRepScore, node.reputationScore);
        job.assignedNode = msg.sender;
        job.status = JobStatus.ASSIGNED;
        nodeJobs[msg.sender].push(_jobId);
        emit JobAssigned(_jobId, msg.sender);
    }

    function submitResult(uint256 _jobId, string calldata _outputCID, bytes32 _resultHash) external nonReentrant {
        Job storage job = jobs[_jobId];
        if (job.status != JobStatus.ASSIGNED) revert JobNotAssigned();
        if (msg.sender != job.assignedNode) revert NotAssignedNode();
        job.outputCID = _outputCID;
        job.resultHash = _resultHash;
        job.status = JobStatus.COMPLETED;
        _releasePayout(job);
        emit JobCompleted(_jobId, msg.sender, _outputCID, _resultHash);
    }

    function _releasePayout(Job storage job) internal {
        uint256 fee = (job.payment * PLATFORM_FEE_BPS) / 10000;
        uint256 nodePayout = job.payment - fee;
        usdc.safeTransfer(treasury, fee);
        usdc.safeTransfer(job.assignedNode, nodePayout);
        nodeRegistry.recordJobCompleted(job.assignedNode);
        emit FeeCollected(job.id, fee, treasury);
    }

    function cancelJob(uint256 _jobId) external nonReentrant {
        Job storage job = jobs[_jobId];
        if (msg.sender != job.client) revert NotJobClient();
        if (job.status != JobStatus.OPEN) revert JobNotOpen();
        job.status = JobStatus.CANCELLED;
        usdc.safeTransfer(msg.sender, job.payment);
        emit JobCancelled(_jobId, msg.sender, job.payment);
    }

    function disputeJob(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        if (msg.sender != job.client) revert NotJobClient();
        if (job.status != JobStatus.COMPLETED) revert InvalidJobStatus();
        job.status = JobStatus.DISPUTED;
        emit JobDisputed(_jobId, msg.sender);
    }

    function setTreasury(address _treasury) external onlyOwner { treasury = _treasury; }
    function setNodeRegistry(address _nr) external onlyOwner { nodeRegistry = INodeRegistry(_nr); }

    function getJob(uint256 _jobId) external view returns (Job memory) { return jobs[_jobId]; }
    function getClientJobs(address _client) external view returns (uint256[] memory) { return clientJobs[_client]; }
    function getNodeJobs(address _node) external view returns (uint256[] memory) { return nodeJobs[_node]; }

    function openJobCount() external view returns (uint256 count) {
        for (uint256 i = 1; i <= jobCount; i++) {
            if (jobs[i].status == JobStatus.OPEN) count++;
        }
    }
}
