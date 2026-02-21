// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ProofVerifier — Standardized cryptogrphic interface for BNB Edge Work
/// @notice Evaluates deterministic execution proofs (compute) or PoRep signatures (storage)
abstract contract ProofVerifier is Ownable {
    
    // Valid compute proofs (SNARKs, Groth16, or simple hashes)
    function verifyComputeProof(address worker, bytes32 jobHash, bytes calldata proof) external virtual returns (bool);

    // Valid storage proofs (PoRep, challenge-response challenges)
    function verifyStorageProof(address worker, bytes32 segmentHash, bytes calldata proof) external virtual returns (bool);

    // Abstract slashing hook to penalize validators natively from proof eval
    function onInvalidProof(address worker) internal virtual;
}
