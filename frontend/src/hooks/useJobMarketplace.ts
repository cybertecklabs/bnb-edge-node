import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESSES, JOB_MARKETPLACE_ABI } from '../lib/contracts'

export function useCreateJob() {
    const { data: hash, isPending, writeContract } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const createJob = (
        jobType: number,
        payment: bigint,
        deadline: bigint,
        inputCID: string,
        minRep: bigint
    ) => {
        writeContract({
            address: CONTRACT_ADDRESSES.jobMarketplace,
            abi: JOB_MARKETPLACE_ABI,
            functionName: 'createJob',
            args: [jobType, payment, deadline, inputCID, minRep],
        })
    }

    return { createJob, isPending, isConfirming, isSuccess, hash }
}

export function useAcceptJob() {
    const { data: hash, isPending, writeContract } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const acceptJob = (jobId: bigint) => {
        writeContract({
            address: CONTRACT_ADDRESSES.jobMarketplace,
            abi: JOB_MARKETPLACE_ABI,
            functionName: 'acceptJob',
            args: [jobId],
        })
    }

    return { acceptJob, isPending, isConfirming, isSuccess, hash }
}

export function useSubmitResult() {
    const { data: hash, isPending, writeContract } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const submitResult = (jobId: bigint, outputCID: string, resultHash: `0x${string}`) => {
        writeContract({
            address: CONTRACT_ADDRESSES.jobMarketplace,
            abi: JOB_MARKETPLACE_ABI,
            functionName: 'submitResult',
            args: [jobId, outputCID, resultHash],
        })
    }

    return { submitResult, isPending, isConfirming, isSuccess, hash }
}

export function useCancelJob() {
    const { data: hash, isPending, writeContract } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const cancelJob = (jobId: bigint) => {
        writeContract({
            address: CONTRACT_ADDRESSES.jobMarketplace,
            abi: JOB_MARKETPLACE_ABI,
            functionName: 'cancelJob',
            args: [jobId],
        })
    }

    return { cancelJob, isPending, isConfirming, isSuccess, hash }
}

export function useGetJob(jobId: bigint) {
    return useReadContract({
        address: CONTRACT_ADDRESSES.jobMarketplace,
        abi: JOB_MARKETPLACE_ABI,
        functionName: 'getJob',
        args: [jobId],
    })
}
