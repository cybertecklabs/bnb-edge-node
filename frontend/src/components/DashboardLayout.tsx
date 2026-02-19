import Link from 'next/link'
import { CustomConnectButton } from '../components/ui/ConnectButton'
import {
    LayoutDashboard,
    Cpu,
    Database,
    Wallet,
    BarChart3,
    ShieldAlert,
    Settings,
    Hexagon,
    GitCommit,
    Globe,
    Zap
} from 'lucide-react'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-[#050709] text-white">
            {/* Sidebar */}
            <aside className="w-[220px] border-r border-gray-800 flex flex-col">
                <div className="p-6 flex items-center gap-2">
                    <Hexagon className="text-bnb" size={24} fill="currentColor" fillOpacity={0.2} />
                    <span className="font-bold tracking-tight text-sm">BNB Edge DePIN</span>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-6">
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-2">Overview</p>
                        <div className="space-y-1">
                            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg bg-bnb/10 text-bnb border border-bnb/20">
                                <LayoutDashboard size={18} />
                                Dashboard
                            </Link>
                            <Link href="/dashboard/analytics" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                                <BarChart3 size={18} />
                                Analytics
                            </Link>
                            <Link href="/build-log" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                                <GitCommit size={18} />
                                Build Log
                            </Link>
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-2">Marketplace</p>
                        <div className="space-y-1">
                            <Link href="/dashboard/nodes" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                                <Cpu size={18} />
                                GPU Compute
                            </Link>
                            <Link href="/dashboard/jobs" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                                <Wallet size={18} />
                                Job Queue
                            </Link>
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-2">Financials</p>
                        <div className="space-y-1">
                            <Link href="/dashboard/payments" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                                <Wallet size={18} />
                                Payments
                            </Link>
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-2">Ecosystem</p>
                        <div className="space-y-1">
                            <a href="https://opbnb-bridge.bnbchain.org" target="_blank" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                                <Globe size={18} />
                                opBNB Bridge
                            </a>
                            <a href="https://testnet.bnbchain.org/faucet-smart" target="_blank" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                                <Zap size={18} />
                                BNB Faucet
                            </a>
                        </div>
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0D0F12] border border-gray-800">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-[10px] font-mono text-success">opBNB Mainnet</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-[#050709]/80 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">Dashboard</span>
                        <span className="text-gray-700">/</span>
                        <span className="text-white font-medium">Overview</span>

                        <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-md bg-bnb/10 border border-bnb/20 text-[10px] font-bold text-bnb ml-4">
                            <Hexagon size={10} fill="currentColor" /> OPBNB POWERED
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-xs border border-gray-700 px-3 py-1.5 rounded-lg hover:border-bnb/50 transition-all font-medium">
                            Register Node
                        </button>
                        <button className="text-xs bg-bnb text-black px-3 py-1.5 rounded-lg font-bold hover:bg-bnbdark transition-all">
                            + New Job
                        </button>
                        <CustomConnectButton />
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
