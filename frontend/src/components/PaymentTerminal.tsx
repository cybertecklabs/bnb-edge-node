'use client'

import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Wallet, CheckCircle2, Copy, ExternalLink, Loader2 } from 'lucide-react'

export function PaymentTerminal({
    amount,
    currency = 'USDC',
    recipient,
    onComplete
}: {
    amount: string,
    currency?: string,
    recipient: string,
    onComplete: () => void
}) {
    const [step, setStep] = useState<'scan' | 'verifying' | 'success'>('scan')

    const handleVerifying = () => {
        setStep('verifying')
        setTimeout(() => {
            setStep('success')
            onComplete()
        }, 3000)
    }

    return (
        <div className="bg-[#0D0F12] border border-gray-800 rounded-2xl p-8 max-w-md mx-auto shadow-2xl">
            <div className="text-center mb-8">
                <h3 className="text-xl font-bold mb-2">Payment Terminal</h3>
                <p className="text-gray-500 text-sm font-mono">Pay via opBNB Network</p>
            </div>

            {step === 'scan' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white p-4 rounded-xl mx-auto w-fit shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                        <QRCodeSVG
                            value={`ethereum:${recipient}?value=${amount}&chainId=204`}
                            size={180}
                            fgColor="#000000"
                            level="H"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Amount</p>
                                <p className="text-xl font-bold font-mono text-bnb">{amount} {currency}</p>
                            </div>
                            <Wallet className="text-bnb" size={24} />
                        </div>

                        <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 flex items-center justify-between text-xs font-mono">
                            <span className="text-gray-500">Recipient:</span>
                            <div className="flex items-center gap-2 text-white">
                                {recipient.slice(0, 6)}...{recipient.slice(-4)}
                                <Copy size={12} className="cursor-pointer hover:text-bnb" />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleVerifying}
                        className="w-full bg-bnb text-black font-bold py-4 rounded-xl transition-all hover:bg-bnbdark active:scale-95 shadow-[0_0_20px_rgba(240,185,11,0.2)]"
                    >
                        I have sent the payment
                    </button>
                </div>
            )}

            {step === 'verifying' && (
                <div className="py-20 flex flex-col items-center justify-center animate-pulse">
                    <Loader2 className="text-bnb animate-spin mb-6" size={48} />
                    <p className="text-lg font-bold">Verifying Transaction</p>
                    <p className="terminal-text mt-2 text-center max-w-[200px]">Waiting for network confirmation on opBNB...</p>
                </div>
            )}

            {step === 'success' && (
                <div className="py-10 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
                    <div className="w-16 h-16 rounded-full bg-success/20 border border-success/30 flex items-center justify-center text-success mb-6 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                        <CheckCircle2 size={32} />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-2">Payment Confirmed</h4>
                    <p className="text-gray-400 text-sm mb-8">Your job has been added to the queue.</p>

                    <div className="flex items-center gap-2 mb-8 bg-gray-900/50 px-4 py-2 rounded-lg border border-gray-800 font-mono text-[10px] text-gray-500">
                        TX: 0x82f2...9d12 <ExternalLink size={10} />
                    </div>

                    <button
                        onClick={onComplete}
                        className="w-full border border-gray-800 hover:bg-white/5 py-4 rounded-xl font-bold transition-all"
                    >
                        Back to Dashboard
                    </button>
                </div>
            )}
        </div>
    )
}
