'use client'

import React, { useState } from 'react'
import { Server, Zap, Shield, DollarSign, ArrowRight } from 'lucide-react'

const CLOUD_PRICES = {
    aws: { name: 'AWS p4d.24xlarge', price: 32.77, uptime: 99.99, latency: 12 },
    gcp: { name: 'GCP a2-highgpu-8g', price: 28.50, uptime: 99.9, latency: 15 },
    azure: { name: 'Azure NDv4', price: 29.80, uptime: 99.95, latency: 14 },
    bnb: { name: 'BNB Edge Node', price: 6.40, uptime: 99.98, latency: 45 },
}

export function CostComparator() {
    const [hours, setHours] = useState(100)

    return (
        <div className="bg-[#0D0F12] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-gray-800 bg-gradient-to-r from-bnb/10 to-transparent">
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Zap className="text-bnb" size={24} />
                    AWS vs BNB Edge Comparator
                </h3>
                <p className="text-gray-400 text-sm">Real-time cost efficiency analysis for GPU compute clusters.</p>
            </div>

            <div className="p-8">
                <div className="mb-10">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 block">Simulation Hours</label>
                    <input
                        type="range"
                        min="1"
                        max="1000"
                        value={hours}
                        onChange={(e) => setHours(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-bnb"
                    />
                    <div className="flex justify-between mt-2 text-xs font-mono text-gray-500">
                        <span>1 Hour</span>
                        <span>{hours} Hours</span>
                        <span>1,000 Hours</span>
                    </div>
                </div>

                <div className="space-y-6">
                    <CompareRow
                        name={CLOUD_PRICES.aws.name}
                        price={CLOUD_PRICES.aws.price * hours}
                        isCloud
                        normalizedWidth={(CLOUD_PRICES.aws.price / CLOUD_PRICES.aws.price) * 100}
                    />
                    <CompareRow
                        name={CLOUD_PRICES.gcp.name}
                        price={CLOUD_PRICES.gcp.price * hours}
                        isCloud
                        normalizedWidth={(CLOUD_PRICES.gcp.price / CLOUD_PRICES.aws.price) * 100}
                    />
                    <CompareRow
                        name={CLOUD_PRICES.bnb.name}
                        price={CLOUD_PRICES.bnb.price * hours}
                        isBest
                        normalizedWidth={(CLOUD_PRICES.bnb.price / CLOUD_PRICES.aws.price) * 100}
                    />
                </div>

                <div className="mt-12 p-6 rounded-2xl bg-bnb/10 border border-bnb/30 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-bnb uppercase tracking-widest mb-1">Total Savings</p>
                        <p className="text-3xl font-bold font-mono text-white">
                            ${((CLOUD_PRICES.aws.price - CLOUD_PRICES.bnb.price) * hours).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <button className="bg-bnb text-black px-6 py-3 rounded-xl font-bold hover:bg-bnbdark transition-all flex items-center gap-2">
                        Claim Savings <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}

function CompareRow({ name, price, isCloud, isBest, normalizedWidth }: {
    name: string,
    price: number,
    isCloud?: boolean,
    isBest?: boolean,
    normalizedWidth: number
}) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end text-sm">
                <span className={`font-medium ${isBest ? 'text-bnb font-bold' : 'text-gray-400'}`}>{name}</span>
                <span className="font-mono font-bold">${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="h-4 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                <div
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${isBest ? 'bg-bnb shadow-[0_0_20px_rgba(240,185,11,0.5)]' : 'bg-gray-700'}`}
                    style={{ width: `${normalizedWidth}%` }}
                />
            </div>
        </div>
    )
}
