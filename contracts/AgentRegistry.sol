// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentRegistry (ERC-8004 & BAP-578 Compliant)
 * @notice Implements the BNB Chain standards for AI Agent Identity and Non-Fungible Agents (NFA).
 * @dev ERC-8004 provides verifiable agent identity. BAP-578 treats agents as tradeable NFAs.
 */

interface IERC8004 {
    event AgentRegistered(address indexed agent, string identityHash);
    function agentIdentity(address agent) external view returns (string memory);
}

contract AgentRegistry is ERC721Enumerable, Ownable, IERC8004 {
    uint256 private _nextTokenId;
    
    struct AgentMeta {
        string identityHash;
        string modelType;
        uint256 createdAt;
        bool isActive;
    }

    mapping(address => string) public override agentIdentity;
    mapping(uint256 => AgentMeta) public agentMetadata;
    mapping(address => uint256) public operatorToTokenId;

    event AgentMinted(address indexed operator, uint256 indexed tokenId, string identityHash);

    constructor() ERC721("BNB Edge Non-Fungible Agent", "NFA") Ownable(msg.sender) {}

    /**
     * @notice Registers an AI Agent and mints a BAP-578 compliant NFA.
     * @param identityHash The verifiable identity hash (ERC-8004).
     * @param modelType The type of AI model the agent runs.
     */
    function registerAgent(string calldata identityHash, string calldata modelType) external {
        require(bytes(agentIdentity[msg.sender]).length == 0, "Agent already registered");
        
        uint256 tokenId = _nextTokenId++;
        agentIdentity[msg.sender] = identityHash;
        
        agentMetadata[tokenId] = AgentMeta({
            identityHash: identityHash,
            modelType: modelType,
            createdAt: block.timestamp,
            isActive: true
        });
        
        operatorToTokenId[msg.sender] = tokenId;
        _safeMint(msg.sender, tokenId);
        
        emit AgentRegistered(msg.sender, identityHash);
        emit AgentMinted(msg.sender, tokenId, identityHash);
    }

    function getAgentMeta(uint256 tokenId) external view returns (AgentMeta memory) {
        return agentMetadata[tokenId];
    }

    // BAP-578 placeholder/extension: NFAs are portable identities
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string(abi.encodePacked("https://api.bnbedge.io/nfa/", agentMetadata[tokenId].identityHash));
    }
}
