import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { Providers } from '../providers'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-space-grotesk',
})

const jetBrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
    title: 'BNB Edge DePIN Node',
    description: 'Decentralized GPU compute and storage marketplace on opBNB',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}>
            <body className="bg-[#050709] text-white antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
