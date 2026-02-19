'use client'
import DashboardLayout from '../../components/DashboardLayout'
import { StatCard, AlertsBanner } from '../../components/DashboardComponents'
import { Cpu, Database, Activity, LucideIcon } from 'lucide-react'
import { CostComparator } from '../../components/CostComparator'
import { ReverseAuctionTerminal } from '../../components/ReverseAuction'

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Row 1: Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Active Nodes"
                        value="147"
                        subtext="GPU: 89 · Storage: 58"
                        trend="up"
                        trendValue="+12 this week"
                    />
                    <StatCard
                        title="Jobs Completed"
                        value="3,821"
                        subtext="Last 30 days"
                        trend="up"
                        trendValue="94.7% success"
                    />
                    <StatCard
                        title="Escrow Volume"
                        value="$184,290"
                        subtext="USDC / USDT on opBNB"
                        trend="up"
                        trendValue="+23% MoM"
                    />
                    <StatCard
                        title="Total Staked"
                        value="2,941 BNB"
                        subtext="Slashing: 0 events"
                    />
                </div>

                {/* AI Alert */}
                <AlertsBanner />

                {/* Row 2: Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Node Registry */}
                    <div className="lg:col-span-2 bg-[#0D0F12] border border-gray-800 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold tracking-tight">Node Registry</h3>
                            <button className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-mono">
                                <thead>
                                    <tr className="text-gray-500 border-b border-gray-800">
                                        <th className="p-4 font-medium uppercase tracking-widest">Node</th>
                                        <th className="p-4 font-medium uppercase tracking-widest">Type</th>
                                        <th className="p-4 font-medium uppercase tracking-widest">Reputation</th>
                                        <th className="p-4 font-medium uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    <NodeRow address="0x9f2a…3b8c" type="GPU A100" rep={98} status="Online" color="success" sla="PLATINUM" agent />
                                    <NodeRow address="0xa1b2…c3d4" type="STORAGE" rep={92} status="Busy" color="bnb" sla="GOLD" />
                                    <NodeRow address="0xAA3f…b12" type="GPU H100" rep={13} status="Warning" color="danger" />
                                    <NodeRow address="0x5e6f…g7h8" type="STORAGE" rep={85} status="Online" color="success" agent />
                                    <NodeRow address="0x9d0e…1f2a" type="GPU RTX" rep={95} status="Online" color="success" sla="PLATINUM" />
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Job Queue */}
                    <div className="space-y-6">
                        <div className="bg-[#0D0F12] border border-gray-800 rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                                <h3 className="text-sm font-bold tracking-tight">Active Job Queue</h3>
                                <Activity size={14} className="text-bnb" />
                            </div>
                            <div className="p-4 space-y-4">
                                <JobItem title="LLM Training" node="0x9f2a…" price="12.5 USDC" status="RUNNING" color="success" />
                                <JobItem title="Image Gen" node="0xa1b2…" price="0.8 USDC" status="COMPUTING" color="bnb" />
                                <JobItem title="File Hosting" node="0x5e6f…" price="2.4 USDC" status="ACTIVE" color="depin" />
                            </div>
                        </div>

                        <ReverseAuctionTerminal />
                    </div>
                </div>

                {/* Row 3: AI Monitor & Cost Comparator */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#0D0F12] border border-gray-800 rounded-xl p-6">
                        <h3 className="text-sm font-bold tracking-tight mb-4 flex items-center gap-2">
                            <Activity size={16} className="text-bnb" />
                            AI Health Monitor
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <HealthItem addr="0x9f2a…" uptime={97} />
                            <HealthItem addr="0xa1b2…" uptime={99} />
                            <HealthItem addr="0xAA3f…" uptime={13} critical />
                            <HealthItem addr="0x5e6f…" uptime={62} />
                        </div>
                        <div className="mt-6 p-4 rounded-lg bg-bnb/5 border border-bnb/20">
                            <p className="text-[10px] text-bnb font-mono leading-relaxed">
                                🤖 AI Action: 3 jobs reassigned from 0xAA3f… → 0x9f2a… automatically. SLA penalty payout triggered for Platinum client.
                            </p>
                        </div>
                    </div>

                    <CostComparator />
                </div>
            </div>
        </DashboardLayout>
    )
}

function NodeRow({ address, type, rep, status, color, sla, agent }: { address: string, type: string, rep: number, status: string, color: string, sla?: string, agent?: boolean }) {
    return (
        <tr className="hover:bg-gray-800/30 transition-colors">
            <td className="p-4">
                <div className="flex flex-col">
                    <span className="text-white flex items-center gap-2">
                        {address}
                        {agent && <span className="text-[8px] bg-depin/20 text-depin border border-depin/30 px-1 rounded uppercase font-bold">ERC-8004</span>}
                    </span>
                    {sla && <span className={`text-[8px] font-bold uppercase tracking-tighter ${sla === 'PLATINUM' ? 'text-bnb' : 'text-gray-500'}`}>{sla} SLA</span>}
                </div>
            </td>
            <td className="p-4">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${type.includes('GPU') ? 'bg-depin/10 border-depin/20 text-depin' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                    {type}
                </span>
            </td>
            <td className="p-4">
                <div className="flex items-center gap-2 w-24">
                    <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full bg-${color}`} style={{ width: `${rep}%` }} />
                    </div>
                    <span className="text-[10px]">{rep}%</span>
                </div>
            </td>
            <td className="p-4">
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full bg-${color}`} />
                    <span className={`text-${color}`}>{status}</span>
                </div>
            </td>
        </tr>
    )
}

function JobItem({ title, node, price, status, color }: { title: string, node: string, price: string, status: string, color: string }) {
    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-${color}/10 border border-${color}/20 flex items-center justify-center text-${color}`}>
                    <Database size={14} />
                </div>
                <div>
                    <p className="text-xs font-bold text-white leading-none mb-1">{title}</p>
                    <p className="text-[10px] text-gray-500 font-mono">Node: {node}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-xs font-bold text-bnb mb-1">{price}</p>
                <div className="flex items-center gap-1.5 justify-end">
                    <div className={`w-1 h-1 rounded-full bg-${color} animate-pulse`} />
                    <span className={`text-[9px] font-bold text-${color}`}>{status}</span>
                </div>
            </div>
        </div>
    )
}

function HealthItem({ addr, uptime, critical }: { addr: string, uptime: number, critical?: boolean }) {
    return (
        <div className={`p-3 rounded-lg border ${critical ? 'bg-danger/5 border-danger/20' : 'bg-gray-900/50 border-gray-800'}`}>
            <p className="text-[9px] font-mono text-gray-500 mb-2">{addr}</p>
            <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${critical ? 'text-danger' : 'text-success'}`}>{uptime}%</span>
                <span className="text-[9px] text-gray-500 tracking-tighter uppercase font-bold">Predicted Uptime</span>
            </div>
        </div>
    )
}
