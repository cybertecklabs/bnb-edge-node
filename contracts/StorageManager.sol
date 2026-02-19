// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title StorageManager — IPFS File Registry with Monthly USDC Payments
/// @notice $1/GB/month pricing with prorated refunds and node reassignment

contract StorageManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum FileStatus { STORED, REASSIGNING, DELETED }

    struct StoredFile {
        bytes32 fileId; string cid; address owner; address storageNode;
        FileStatus status; uint256 sizeBytes; uint256 storedAt; uint256 expiresAt;
        uint256 monthlyFee; string encryptedKey;
    }

    uint256 public constant PLATFORM_FEE_BPS = 400;
    uint256 public constant BYTES_PER_GB = 1_073_741_824;
    uint256 public constant PRICE_PER_GB_MONTHLY = 1_000_000;

    IERC20 public immutable usdc;
    address public reputationOracle;
    address public treasury;

    mapping(bytes32 => StoredFile) public files;
    mapping(address => bytes32[]) public ownerFiles;
    mapping(address => bytes32[]) public nodeFiles;

    error InvalidFileSize();
    error InvalidDuration();
    error FileNotStored();
    error NotFileOwner();
    error UnauthorizedReassigner();

    event FileStored(bytes32 indexed fileId, string cid, address indexed owner, address indexed storageNode, uint256 sizeBytes, uint256 totalCost);
    event FileReassigned(bytes32 indexed fileId, address indexed oldNode, address indexed newNode);
    event FileDeleted(bytes32 indexed fileId, address indexed owner, uint256 refundAmount);
    event PaymentReleased(bytes32 indexed fileId, address indexed storageNode, uint256 amount);

    constructor(address _usdc, address _treasury) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        treasury = _treasury;
    }

    function storeFile(
        string calldata cid, address storageNode, uint256 sizeBytes,
        uint256 durationMonths, string calldata encryptedKey
    ) external nonReentrant {
        if (sizeBytes == 0) revert InvalidFileSize();
        if (durationMonths == 0) revert InvalidDuration();
        uint256 sizeGB = (sizeBytes + BYTES_PER_GB - 1) / BYTES_PER_GB;
        uint256 monthlyFee = PRICE_PER_GB_MONTHLY * sizeGB;
        uint256 totalCost = monthlyFee * durationMonths;
        bytes32 fileId = keccak256(abi.encodePacked(cid, msg.sender, block.timestamp));

        files[fileId] = StoredFile({
            fileId: fileId, cid: cid, owner: msg.sender, storageNode: storageNode,
            status: FileStatus.STORED, sizeBytes: sizeBytes, storedAt: block.timestamp,
            expiresAt: block.timestamp + (durationMonths * 30 days),
            monthlyFee: monthlyFee, encryptedKey: encryptedKey
        });
        ownerFiles[msg.sender].push(fileId);
        nodeFiles[storageNode].push(fileId);
        usdc.safeTransferFrom(msg.sender, address(this), totalCost);
        emit FileStored(fileId, cid, msg.sender, storageNode, sizeBytes, totalCost);
    }

    function reassignFile(bytes32 fileId, address newNode) external nonReentrant {
        StoredFile storage file = files[fileId];
        if (msg.sender != reputationOracle && msg.sender != file.owner) revert UnauthorizedReassigner();
        if (file.status != FileStatus.STORED) revert FileNotStored();
        address oldNode = file.storageNode;
        file.storageNode = newNode;
        nodeFiles[newNode].push(fileId);
        emit FileReassigned(fileId, oldNode, newNode);
    }

    function deleteFile(bytes32 fileId) external nonReentrant {
        StoredFile storage file = files[fileId];
        if (msg.sender != file.owner) revert NotFileOwner();
        if (file.status != FileStatus.STORED) revert FileNotStored();
        uint256 totalDuration = file.expiresAt - file.storedAt;
        uint256 elapsed = block.timestamp - file.storedAt;
        uint256 refund = 0;
        if (elapsed < totalDuration) {
            uint256 remaining = totalDuration - elapsed;
            uint256 totalMonths = totalDuration / 30 days;
            uint256 totalPaid = file.monthlyFee * totalMonths;
            refund = (totalPaid * remaining) / totalDuration;
        }
        file.status = FileStatus.DELETED;
        if (refund > 0) { usdc.safeTransfer(msg.sender, refund); }
        emit FileDeleted(fileId, msg.sender, refund);
    }

    function storagePriceQuote(uint256 sizeBytes, uint256 months) external pure returns (uint256 totalCost) {
        uint256 sizeGB = (sizeBytes + BYTES_PER_GB - 1) / BYTES_PER_GB;
        totalCost = PRICE_PER_GB_MONTHLY * sizeGB * months;
    }

    function setReputationOracle(address _oracle) external onlyOwner { reputationOracle = _oracle; }
    function setTreasury(address _treasury) external onlyOwner { treasury = _treasury; }

    function getFile(bytes32 fileId) external view returns (StoredFile memory) { return files[fileId]; }
    function getOwnerFiles(address _owner) external view returns (bytes32[] memory) { return ownerFiles[_owner]; }
    function getNodeFileCount(address node) external view returns (uint256) { return nodeFiles[node].length; }
}
