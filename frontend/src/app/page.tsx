'use client'

import React from 'react'
import Link from 'next/link'
import { Hexagon, Cpu, Database, ShieldCheck, Zap, ArrowRight, BarChart3, Globe } from 'lucide-react'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#050709] text-white selection:bg-bnb selection:text-black">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-gray-800 bg-[#050709]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Hexagon className="text-bnb" size={28} fill="currentColor" fillOpacity={0.2} />
                        <span className="font-bold text-xl tracking-tight">BNB Edge</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        <Link href="#features" className="hover:text-bnb transition-colors">Features</Link>
                        <Link href="#network" className="hover:text-bnb transition-colors">Network</Link>
                        <Link href="#docs" className="hover:text-bnb transition-colors">Documentation</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-sm font-medium hover:text-bnb transition-colors">Login</Link>
                        <Link href="/dashboard" className="bg-bnb text-black px-5 py-2.5 rounded-full font-bold text-sm hover:bg-bnbdark transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(240,185,11,0.2)]">
                            Launch App
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-bnb/10 to-transparent pointer-events-none" />
                <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-bnb/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bnb/10 border border-bnb/20 text-bnb text-[10px] font-bold uppercase tracking-widest mb-8 animate-fade-in">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bnb opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-bnb"></span>
                        </span>
                        Now Live on opBNB Mainnet
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                        Decentralized <span className="text-bnb">GPU Compute</span> <br />
                        Marketplace for AI.
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Harness the power of a distributed network of high-performance GPUs.
                        Serverless AI inference, training, and storage on the world's most scalable BNB Chain layer.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/dashboard" className="w-full sm:w-auto bg-bnb text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-bnbdark transition-all flex items-center justify-center gap-2 group">
                            Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link href="#how-it-works" className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg border border-gray-800 hover:bg-white/5 transition-all">
                            How it works
                        </Link>
                    </div>

                    {/* Stats Bar */}
                    <div className="mt-20 pt-10 border-t border-gray-800/50 grid grid-cols-2 md:grid-cols-4 gap-8">
                        <StatItem label="Active Nodes" value="147+" />
                        <StatItem label="Price Density" value="0.12 USDC/hr" />
                        <StatItem label="Network Uptime" value="99.98%" />
                        <StatItem label="Total Jobs" value="34k+" />
                    </div>
                </div>
            </section>

            {/* Trust & Safety Section */}
            <section id="features" className="py-24 px-6 border-y border-gray-800 bg-[#080A0E]/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Why BNB Edge?</h2>
                        <p className="text-gray-400">The most reliable DePIN network for production AI workloads.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<ShieldCheck className="text-bnb" />}
                            title="ERC-8004 Agent Identity"
                            description="Full compliance with the latest BNB Chain standards. Every AI Agent has a verifiable, portable on-chain identity (NFA)."
                        />
                        <FeatureCard
                            icon={<Zap className="text-bnb" />}
                            title="Proof-of-Replication"
                            description="Industry-first PoRep Lite system. We cryptographically verify GPU hardware specs before any node is listed."
                        />
                        <FeatureCard
                            icon={<BarChart3 className="text-bnb" />}
                            title="Enterprise Grade SLAs"
                            description="Sovereign AI infrastructure with on-chain enforced SLAs. Automated penalty payouts for mission-critical reliability."
                        />
                    </div>
                </div>
            </section>

            {/* Call to Action Sections */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Provider CTA */}
                    <div className="group relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-10 overflow-hidden hover:border-bnb/50 transition-all">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-bnb/5 blur-[80px] group-hover:bg-bnb/10 transition-all" />
                        <Cpu size={48} className="text-bnb mb-6" />
                        <h3 className="text-3xl font-bold mb-4">Provide Compute</h3>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            Have idle GPU hardware? Register as a provider, stake BNB, and start earning USDC for every compute cycle.
                        </p>
                        <ul className="mb-8 space-y-3">
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-bnb" />
                                Automated Payouts in USDC
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-bnb" />
                                BNB Staking Rewards
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-bnb" />
                                Global Node Network
                            </li>
                        </ul>
                        <Link href="/dashboard" className="inline-flex items-center gap-2 font-bold text-bnb group-hover:gap-3 transition-all">
                            Become a Provider <ArrowRight size={18} />
                        </Link>
                    </div>

                    {/* Consumer CTA */}
                    <div className="group relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-10 overflow-hidden hover:border-depin/50 transition-all">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-depin/5 blur-[80px] group-hover:bg-depin/10 transition-all" />
                        <Globe size={48} className="text-depin mb-6" />
                        <h3 className="text-3xl font-bold mb-4">Consume Compute</h3>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            Need GPU power for training or inference? Access a massive pool of hardware without the cloud provider premium.
                        </p>
                        <ul className="mb-8 space-y-3">
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-depin" />
                                4x Cheaper than AWS/GCP
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-depin" />
                                No KYC required
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-depin" />
                                Instant Access via API
                            </li>
                        </ul>
                        <Link href="/dashboard" className="inline-flex items-center gap-2 font-bold text-depin group-hover:gap-3 transition-all">
                            Post your Job <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-gray-800">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <Hexagon className="text-bnb" size={24} fill="currentColor" fillOpacity={0.2} />
                            <span className="font-bold text-lg tracking-tight">BNB Edge</span>
                        </div>
                        <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                            Building the future of decentralized AI infrastructure on opBNB. Reliable, Scalable, Sovereign.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Network</h4>
                            <nav className="flex flex-col gap-4 text-sm text-gray-500">
                                <Link href="#" className="hover:text-white transition-colors">Explorer</Link>
                                <Link href="#" className="hover:text-white transition-colors">Nodes</Link>
                                <Link href="#" className="hover:text-white transition-colors">Jobs</Link>
                            </nav>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Legal</h4>
                            <nav className="flex flex-col gap-4 text-sm text-gray-500">
                                <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                                <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                                <Link href="#" className="hover:text-white transition-colors">Security</Link>
                            </nav>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Community</h4>
                            <nav className="flex flex-col gap-4 text-sm text-gray-500">
                                <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
                                <Link href="#" className="hover:text-white transition-colors">Discord</Link>
                                <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
                            </nav>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-800/50 flex flex-col md:flex-row justify-between gap-4 text-xs text-gray-600">
                    <p>© 2026 BNB Edge Protocol. All rights reserved.</p>
                    <p>Powered by opBNB & Greenfield.</p>
                </div>
            </footer>
        </div>
    )
}

function StatItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="text-left">
            <p className="text-2xl md:text-3xl font-bold font-mono text-white mb-1">{value}</p>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{label}</p>
        </div>
    )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-8 rounded-2xl bg-[#0D0F12] border border-gray-800 hover:border-bnb/30 transition-all hover:bg-bnb/[0.02]">
            <div className="mb-6">{icon}</div>
            <h3 className="text-xl font-bold mb-4">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        </div>
    )
}
