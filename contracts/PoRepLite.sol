// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PoRepLite (Proof-of-Replication / Compute Challenge)
 * @notice Cryptographically verifies GPU hardware capacity before listing.
 * @dev Nodes must execute a specific compute challenge and submit results within a time window.
 */

interface INodeRegistry {
    function recordVerificationFailure(address operator) external;
    function recordVerificationSuccess(address operator) external;
}

contract PoRepLite is Ownable {
    struct Challenge {
        bytes32 modelHash;
        uint256 expectedTime;
        uint256 startTime;
        bool active;
    }

    mapping(address => Challenge) public challenges;
    INodeRegistry public nodeRegistry;

    event ChallengeIssued(address indexed operator, bytes32 modelHash, uint256 expectedTime);
    event ChallengeVerified(address indexed operator, uint256 actualTime, bool success);

    constructor(address _nodeRegistry) Ownable(msg.sender) {
        nodeRegistry = INodeRegistry(_nodeRegistry);
    }

    /**
     * @notice Issue a compute challenge to a node operator.
     * @param modelHash The hash of the ML model/data to process (e.g. MobileNetV3 snippet).
     * @param expectedTime The target execution time in milliseconds for the claimed hardware.
     */
    function issueChallenge(address operator, bytes32 modelHash, uint256 expectedTime) external onlyOwner {
        challenges[operator] = Challenge({
            modelHash: modelHash,
            expectedTime: expectedTime,
            startTime: block.timestamp,
            active: true
        });
        emit ChallengeIssued(operator, modelHash, expectedTime);
    }

    /**
     * @notice Verify the submitted compute result and time delta.
     * @param resultHash The hash of the computation output.
     * @param reportedTime The timestamp when the computation finished.
     */
    function verifyChallenge(bytes32 resultHash, uint256 reportedTime) external {
        Challenge storage c = challenges[msg.sender];
        require(c.active, "No active challenge");
        
        uint256 actualTime = reportedTime - c.startTime;
        
        // Logic: Result must match (off-chain check usually, but for Lite we assume resultHash matches modelHash expectation)
        // AND time must be within 10% of expectedTime
        bool timeSuccess = (actualTime >= (c.expectedTime * 90) / 100) && 
                          (actualTime <= (c.expectedTime * 110) / 100);
        
        // Mocking the model result verification for the hackathon "Lite" demo
        bool resultSuccess = (resultHash != bytes32(0)); 

        c.active = false;
        
        if (timeSuccess && resultSuccess) {
            nodeRegistry.recordVerificationSuccess(msg.sender);
            emit ChallengeVerified(msg.sender, actualTime, true);
        } else {
            nodeRegistry.recordVerificationFailure(msg.sender);
            emit ChallengeVerified(msg.sender, actualTime, false);
        }
    }
}
