import { http, createConfig } from 'wagmi'
import { mainnet, bsc, bscTestnet } from 'wagmi/chains'
import { defineChain } from 'viem'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { QueryClient } from '@tanstack/react-query'

export const opBnbMainnet = defineChain({
    id: 204,
    name: 'opBNB Mainnet',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: {
        default: { http: [process.env.NEXT_PUBLIC_OPBNB_RPC || 'https://opbnb-mainnet-rpc.bnbchain.org'] },
    },
    blockExplorers: {
        default: { name: 'opBNBscan', url: 'https://opbnbscan.com' },
    },
})

export const opBnbTestnet = defineChain({
    id: 5611,
    name: 'opBNB Testnet',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: {
        default: { http: [process.env.NEXT_PUBLIC_OPBNB_TESTNET_RPC || 'https://opbnb-testnet-rpc.bnbchain.org'] },
    },
    blockExplorers: {
        default: { name: 'opBNBscan', url: 'https://testnet.opbnbscan.com' },
    },
})

export const wagmiConfig = getDefaultConfig({
    appName: 'BNB Edge DePIN Node',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID || 'demo',
    chains: [opBnbMainnet, opBnbTestnet],
    transports: {
        [opBnbMainnet.id]: http(),
        [opBnbTestnet.id]: http(),
    },
    ssr: true,
})

export const queryClient = new QueryClient()
