'use client'

import React, { useState, useEffect } from 'react'
import { Gavel, Clock, Trophy, TrendingDown, LayoutList } from 'lucide-react'

const MOCK_BIDS = [
    { id: 1, node: '0x9f2a…', price: '12.40', rep: 98, time: '2s ago' },
    { id: 2, node: '0xa1b2…', price: '11.85', rep: 92, time: '5s ago' },
    { id: 3, node: '0x5e6f…', price: '10.90', rep: 85, time: '刚刚' },
]

export function ReverseAuctionTerminal() {
    const [currentBids, setCurrentBids] = useState(MOCK_BIDS)
    const [timeLeft, setTimeLeft] = useState(60)

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [timeLeft])

    return (
        <div className="bg-[#050709] border border-gray-800 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/20">
                <div className="flex items-center gap-3">
                    <TrendingDown className="text-success" size={24} />
                    <div>
                        <h3 className="text-lg font-bold">Reverse Auction Terminal</h3>
                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Job ID: #8291 · Lower Bids Win</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/20 text-danger">
                    <Clock size={16} />
                    <span className="text-sm font-mono font-bold">{timeLeft}s</span>
                </div>
            </div>

            <div className="p-6">
                <div className="mb-6 space-y-3">
                    {currentBids.map((bid, i) => (
                        <div
                            key={bid.id}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${i === 2 ? 'bg-success/10 border-success/40 scale-[1.02] shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'bg-[#0D0F12] border-gray-800 opacity-60'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i === 2 ? 'bg-success text-black' : 'bg-gray-800 text-gray-400'}`}>
                                    {i + 1}
                                </div>
                                <div>
                                    <p className="text-xs font-bold font-mono">{bid.node}</p>
                                    <p className="text-[10px] text-gray-500">Rep Score: {bid.rep}%</p>
                                </div>
                            </div>
                            <div className="text-right flex items-center gap-6">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Bid Price</p>
                                    <p className={`text-lg font-bold font-mono ${i === 2 ? 'text-success' : 'text-white'}`}>
                                        ${bid.price} <span className="text-[10px] font-normal">USDC/hr</span>
                                    </p>
                                </div>
                                {i === 2 && (
                                    <div className="px-3 py-1 bg-success text-black text-[10px] font-black uppercase tracking-tighter rounded italic">
                                        Winning
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 rounded-xl bg-[#0D0F12] border border-gray-800 border-dashed">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4 font-mono">
                        <span>LIVE AUCTION STREAM</span>
                        <span className="animate-pulse flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-danger" />
                            RECORDING BIDS
                        </span>
                    </div>
                    <div className="space-y-2">
                        <AuctionLog message="Node 0x9d0e… submitted bid at $10.85" time="1s ago" />
                        <AuctionLog message="Node 0x5e6f… underbid to $10.90" time="刚刚" />
                        <AuctionLog message="Validator check: 0x9d0e reputation verified (95%)" time="3s ago" />
                    </div>
                </div>
            </div>
        </div>
    )
}

function AuctionLog({ message, time }: { message: string, time: string }) {
    return (
        <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-gray-400">/ {message}</span>
            <span className="text-gray-600">{time}</span>
        </div>
    )
}
