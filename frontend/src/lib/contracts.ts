import { parseEther } from 'viem'

export const CONTRACT_ADDRESSES = {
    nodeRegistry: process.env.NEXT_PUBLIC_NODE_REGISTRY as `0x${string}`,
    jobMarketplace: process.env.NEXT_PUBLIC_JOB_MARKETPLACE as `0x${string}`,
    storageManager: process.env.NEXT_PUBLIC_STORAGE_MANAGER as `0x${string}`,
    reputationOracle: process.env.NEXT_PUBLIC_REPUTATION_ORACLE as `0x${string}`,
    usdc: process.env.NEXT_PUBLIC_USDC as `0x${string}`,
}

export const NODE_REGISTRY_ABI = [
    "function registerNode(uint8 _type, string calldata _metadata) external payable",
    "function heartbeat() external",
    "function deregister() external",
    "function getNode(address operator) external view returns (tuple(address operator, uint8 nodeType, uint8 status, uint256 stakedAmount, uint256 registeredAt, uint256 jobsCompleted, uint256 jobsFailed, uint256 totalUptime, uint256 lastHeartbeat, string metadataURI, uint256 reputationScore))",
    "function getAllNodes() external view returns (address[])",
    "function activeNodeCount() external view returns (uint256)",
    "event NodeRegistered(address indexed operator, uint8 nodeType, uint256 stakedAmount, string metadataURI)",
    "event HeartbeatReceived(address indexed operator, uint256 uptimeAdded, uint256 totalUptime)",
    "event ReputationUpdated(address indexed operator, uint256 oldScore, uint256 newScore)",
] as const

export const JOB_MARKETPLACE_ABI = [
    "function createJob(uint8 _type, uint256 _payment, uint256 _deadline, string calldata _inputCID, uint256 _minRep) external",
    "function acceptJob(uint256 _jobId) external",
    "function submitResult(uint256 _jobId, string calldata _outputCID, bytes32 _resultHash) external",
    "function cancelJob(uint256 _jobId) external",
    "function getJob(uint256 _jobId) external view returns (tuple(uint256 id, address client, address assignedNode, uint8 jobType, uint8 status, uint256 payment, uint256 createdAt, uint256 deadline, string inputCID, string outputCID, bytes32 resultHash, uint256 minRepScore))",
    "function getClientJobs(address _client) external view returns (uint256[])",
    "event JobCreated(uint256 indexed jobId, address indexed client, uint8 jobType, uint256 payment, string inputCID)",
    "event JobCompleted(uint256 indexed jobId, address indexed node, string outputCID, bytes32 resultHash)",
] as const

export const STORAGE_MANAGER_ABI = [
    "function storeFile(string calldata cid, address storageNode, uint256 sizeBytes, uint256 durationMonths, string calldata encryptedKey) external",
    "function storagePriceQuote(uint256 sizeBytes, uint256 months) external view returns (uint256)",
    "event FileStored(bytes32 indexed fileId, string cid, address indexed owner, address indexed storageNode, uint256 sizeBytes, uint256 totalCost)",
] as const

export const REPUTATION_ORACLE_ABI = [
    "function predictNodeReliability(address node) external view returns (uint256)",
    "function updateScore(address node) external returns (uint256)",
    "function getScoreHistory(address node) external view returns (tuple(uint256 score, uint256 timestamp, bool alertTriggered)[])",
    "event ScoreComputed(address indexed node, uint256 score, uint256 timestamp)",
] as const

export const PLATFORM_FEE_BPS = 400
export const MIN_STAKE_GPU = parseEther("0.05")
export const MIN_STAKE_STORAGE = parseEther("0.02")
