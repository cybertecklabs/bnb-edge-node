'use client'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export const CustomConnectButton = () => {
    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
            }) => {
                const ready = mounted && authenticationStatus !== 'loading'
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                        authenticationStatus === 'authenticated')

                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            style: {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <button
                                        onClick={openConnectModal}
                                        type="button"
                                        className="bg-bnb text-black px-4 py-2 rounded-lg font-semibold hover:bg-bnbdark transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(240,185,11,0.3)]"
                                    >
                                        Connect Wallet
                                    </button>
                                )
                            }

                            if (chain.unsupported) {
                                return (
                                    <button
                                        onClick={openChainModal}
                                        type="button"
                                        className="bg-danger text-white px-4 py-2 rounded-lg font-semibold shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                                    >
                                        Wrong Network
                                    </button>
                                )
                            }

                            return (
                                <div className="flex gap-3">
                                    <button
                                        onClick={openChainModal}
                                        type="button"
                                        className="hidden sm:flex items-center gap-2 bg-[#1A1D23] px-3 py-1.5 rounded-lg border border-gray-800 hover:border-bnb/50 transition-all font-mono text-sm"
                                    >
                                        {chain.hasIcon && (
                                            <div
                                                style={{
                                                    background: chain.iconBackground,
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: 999,
                                                    overflow: 'hidden',
                                                    marginRight: 4,
                                                }}
                                            >
                                                {chain.iconUrl && (
                                                    <img
                                                        alt={chain.name ?? 'Chain icon'}
                                                        src={chain.iconUrl}
                                                        style={{ width: 12, height: 12 }}
                                                    />
                                                )}
                                            </div>
                                        )}
                                        {chain.name}
                                    </button>

                                    <button
                                        onClick={openAccountModal}
                                        type="button"
                                        className="flex items-center gap-2 bg-bnb/10 border border-bnb/30 px-3 py-1.5 rounded-lg hover:bg-bnb/20 transition-all font-mono text-sm text-bnb"
                                    >
                                        {account.displayBalance
                                            ? `(${account.displayBalance}) `
                                            : ''}
                                        {account.displayName}
                                    </button>
                                </div>
                            )
                        })()}
                    </div>
                )
            }}
        </ConnectButton.Custom>
    )
}
