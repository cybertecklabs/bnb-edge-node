import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESSES, NODE_REGISTRY_ABI } from '../lib/contracts'

export function useGetNode(address: `0x${string}` | undefined) {
    return useReadContract({
        address: CONTRACT_ADDRESSES.nodeRegistry,
        abi: NODE_REGISTRY_ABI,
        functionName: 'getNode',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    })
}

export function useActiveNodeCount() {
    return useReadContract({
        address: CONTRACT_ADDRESSES.nodeRegistry,
        abi: NODE_REGISTRY_ABI,
        functionName: 'activeNodeCount',
    })
}

export function useRegisterNode() {
    const { data: hash, isPending, writeContract } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const registerNode = (nodeType: number, metadataURI: string, stakeAmount: bigint) => {
        writeContract({
            address: CONTRACT_ADDRESSES.nodeRegistry,
            abi: NODE_REGISTRY_ABI,
            functionName: 'registerNode',
            args: [nodeType, metadataURI],
            value: stakeAmount,
        })
    }

    return { registerNode, isPending, isConfirming, isSuccess, hash }
}

export function useHeartbeat() {
    const { data: hash, isPending, writeContract } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const heartbeat = () => {
        writeContract({
            address: CONTRACT_ADDRESSES.nodeRegistry,
            abi: NODE_REGISTRY_ABI,
            functionName: 'heartbeat',
        })
    }

    return { heartbeat, isPending, isConfirming, isSuccess, hash }
}

export function useDeregister() {
    const { data: hash, isPending, writeContract } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const deregister = () => {
        writeContract({
            address: CONTRACT_ADDRESSES.nodeRegistry,
            abi: NODE_REGISTRY_ABI,
            functionName: 'deregister',
        })
    }

    return { deregister, isPending, isConfirming, isSuccess, hash }
}
