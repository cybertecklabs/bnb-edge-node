import React from 'react'

export function StatCard({ title, value, subtext, trend, trendValue }: {
    title: string,
    value: string,
    subtext: string,
    trend?: 'up' | 'down',
    trendValue?: string
}) {
    return (
        <div className="bg-[#0D0F12] border border-gray-800 rounded-xl p-5 hover:border-bnb/30 transition-all group">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">{title}</p>
            <div className="flex items-end justify-between">
                <div>
                    <h3 className="text-2xl font-bold font-mono group-hover:text-bnb transition-colors">{value}</h3>
                    <p className="text-xs text-gray-400 mt-1">{subtext}</p>
                </div>
                {trend && (
                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${trend === 'up' ? 'text-success bg-success/10' : 'text-danger bg-danger/10'}`}>
                        {trend === 'up' ? '↑' : '↓'} {trendValue}
                    </div>
                )}
            </div>
        </div>
    )
}

export function AlertsBanner() {
    return (
        <div className="bg-danger/5 border border-danger/20 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-danger animate-ping" />
                <span className="text-xs text-danger font-medium tracking-tight">
                    <span className="font-bold">AI Health Alert:</span> Node 0xAA3f…b12 predicted 87% failure probability. Auto-reassignment triggered for 3 active jobs.
                </span>
            </div>
            <button className="text-[10px] font-bold uppercase tracking-widest text-danger hover:underline">
                View Details →
            </button>
        </div>
    )
}
