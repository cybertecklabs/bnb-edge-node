// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IWorkerRegistry {
    function slashWorker(address operator, uint256 slashAmount) external;
}

/// @title Slashing — Enforces penalties for malicious/offline workers
/// @notice Evaluates worker SLA conditions to trigger collateral slash
contract Slashing is Ownable {

    IWorkerRegistry public workerRegistry;
    address public trustedValidator;

    error Unauthorized();

    event WorkerSlashedAdmin(address indexed operator, uint256 amount, string reason);

    constructor(address _workerRegistry) Ownable(msg.sender) {
        workerRegistry = IWorkerRegistry(_workerRegistry);
        trustedValidator = msg.sender;
    }

    /// @notice Allow external decentralized validators or admin to enforce slash
    function flagMaliciousProof(address operator, uint256 slashAmount) external {
        if (msg.sender != trustedValidator && msg.sender != owner()) revert Unauthorized();
        
        // Triggers the staking penalty in WorkerRegistry
        workerRegistry.slashWorker(operator, slashAmount);
        
        emit WorkerSlashedAdmin(operator, slashAmount, "Fraudulent computational proof");
    }

    /// @notice Slash due to poor uptime limits
    function flagDowntime(address operator, uint256 slashAmount) external {
        if (msg.sender != trustedValidator && msg.sender != owner()) revert Unauthorized();
        
        workerRegistry.slashWorker(operator, slashAmount);
        emit WorkerSlashedAdmin(operator, slashAmount, "Missed heartbeat threshold");
    }

    function setValidator(address _validator) external onlyOwner {
        trustedValidator = _validator;
    }
}
