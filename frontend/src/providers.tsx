'use client'

import * as React from 'react'
import {
    RainbowKitProvider,
    darkTheme,
} from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import {
    QueryClientProvider,
} from '@tanstack/react-query'
import { wagmiConfig, queryClient } from './lib/wagmi'
import '@rainbow-me/rainbowkit/styles.css'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={darkTheme({
                    accentColor: '#F0B90B', // BNB Yellow
                    accentColorForeground: 'black',
                    borderRadius: 'small',
                    fontStack: 'system',
                    overlayBlur: 'small',
                })}>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
