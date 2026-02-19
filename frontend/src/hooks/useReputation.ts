import { useReadContract } from 'wagmi'
import { CONTRACT_ADDRESSES, REPUTATION_ORACLE_ABI } from '../lib/contracts'

export function usePredictReliability(nodeAddress: `0x${string}` | undefined) {
    return useReadContract({
        address: CONTRACT_ADDRESSES.reputationOracle,
        abi: REPUTATION_ORACLE_ABI,
        functionName: 'predictNodeReliability',
        args: nodeAddress ? [nodeAddress] : undefined,
        query: {
            enabled: !!nodeAddress,
        },
    })
}

export function useScoreHistory(nodeAddress: `0x${string}` | undefined) {
    return useReadContract({
        address: CONTRACT_ADDRESSES.reputationOracle,
        abi: REPUTATION_ORACLE_ABI,
        functionName: 'getScoreHistory',
        args: nodeAddress ? [nodeAddress] : undefined,
        query: {
            enabled: !!nodeAddress,
        },
    })
}
