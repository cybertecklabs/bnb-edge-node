'use client'

import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { GitCommit, User, Clock, CheckCircle2, ChevronRight, Github } from 'lucide-react'

interface Commit {
    sha: string;
    commit: {
        message: string;
        author: {
            date: string;
            name: string;
        };
    };
    author: {
        avatar_url: string;
        login: string;
    };
    html_url: string;
}

export default function BuildLogPage() {
    const [commits, setCommits] = useState<Commit[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchCommits() {
            try {
                const res = await fetch('https://api.github.com/repos/dev-loka/dev-loka.github.io/commits')
                if (res.ok) {
                    const data = await res.json()
                    setCommits(data.slice(0, 15))
                }
            } catch (err) {
                console.error('Failed to fetch commits', err)
            } finally {
                setLoading(false)
            }
        }
        fetchCommits()
    }, [])

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-bnb/10 border border-bnb/20 text-bnb text-[10px] font-bold uppercase tracking-widest w-fit">
                        <Github size={12} /> Live Repository Feed
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">Built in Public <span className="text-bnb">🛠️</span></h1>
                    <p className="text-gray-400">Real-time verifiable development timeline for the BNB Edge Protocol.</p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-24 bg-gray-900/50 border border-gray-800 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="relative space-y-4">
                        {/* Timeline line */}
                        <div className="absolute left-[31px] top-4 bottom-4 w-px bg-gray-800" />

                        {commits.map((c, i) => (
                            <div key={c.sha} className="relative pl-16 group">
                                {/* Timeline dot */}
                                <div className="absolute left-[24px] top-4 w-4 h-4 rounded-full bg-[#050709] border-2 border-bnb group-hover:scale-125 transition-transform z-10" />

                                <div className="bg-[#0D0F12] border border-gray-800 rounded-2xl p-6 hover:border-bnb/30 transition-all">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <img
                                                src={c.author?.avatar_url || 'https://github.com/identicons/null.png'}
                                                alt={c.author?.login}
                                                className="w-10 h-10 rounded-full border border-gray-700"
                                            />
                                            <div>
                                                <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-bnb transition-colors">
                                                    {c.commit.message.split('\n')[0]}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500 font-mono">
                                                    <span className="flex items-center gap-1"><User size={10} /> {c.author?.login || c.commit.author.name}</span>
                                                    <span className="flex items-center gap-1"><Clock size={10} /> {new Date(c.commit.author.date).toLocaleDateString()}</span>
                                                    <span className="text-bnb/60">SHA: {c.sha.slice(0, 7)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <a
                                            href={c.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                                        >
                                            View Code <ChevronRight size={12} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="p-8 rounded-3xl bg-bnb/5 border border-bnb/10 text-center">
                            <CheckCircle2 size={32} className="text-bnb mx-auto mb-4" />
                            <h3 className="text-lg font-bold">Protocol Inevitability</h3>
                            <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
                                Transparency is our core security feature. Every line of code is verifiable on-chain and on GitHub.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
