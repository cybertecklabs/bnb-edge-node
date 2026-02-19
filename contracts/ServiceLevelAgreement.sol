// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ServiceLevelAgreement (SLA)
 * @notice Enforces enterprise-tier reliability with automated penalty payouts.
 */

contract ServiceLevelAgreement is Ownable, ReentrancyGuard {
    enum Tier { BASIC, GOLD, PLATINUM }

    struct SLAProfile {
        Tier tier;
        uint256 uptimeGuarantee; // bps (e.g. 9990 = 99.9%)
        uint256 stake;
        uint256 penaltyBps;
    }

    mapping(Tier => SLAProfile) public tiers;
    mapping(address => Tier) public nodeTiers;
    mapping(address => uint256) public nodeSLAStake;

    event TierEntered(address indexed node, Tier tier, uint256 stake);
    event SLAViolation(address indexed node, address indexed client, uint256 penaltyAmount);

    constructor() Ownable(msg.sender) {
        tiers[Tier.BASIC] = SLAProfile(Tier.BASIC, 9500, 0, 500);
        tiers[Tier.GOLD] = SLAProfile(Tier.GOLD, 9900, 0.5 ether, 1000);
        tiers[Tier.PLATINUM] = SLAProfile(Tier.PLATINUM, 9990, 2 ether, 2000);
    }

    function enterTier(Tier _tier) external payable nonReentrant {
        require(msg.value >= tiers[_tier].stake, "Insufficient stake for tier");
        nodeTiers[msg.sender] = _tier;
        nodeSLAStake[msg.sender] += msg.value;
        emit TierEntered(msg.sender, _tier, msg.value);
    }

    /**
     * @notice Slash a node for SLA violation (e.g. downtime during an enterprise job).
     * @param node The failing node.
     * @param client The client to be compensated.
     */
    function recordViolation(address node, address client) external onlyOwner {
        Tier tier = nodeTiers[node];
        if (tier == Tier.BASIC) return; // No penalties for basic tier in this model

        uint256 penalty = (nodeSLAStake[node] * tiers[tier].penaltyBps) / 10000;
        nodeSLAStake[node] -= penalty;
        
        (bool success, ) = payable(client).call{value: penalty}("");
        require(success, "Payout failed");
        
        emit SLAViolation(node, client, penalty);
    }

    function getUptimeGuarantee(address node) external view returns (uint256) {
        return tiers[nodeTiers[node]].uptimeGuarantee;
    }
}
