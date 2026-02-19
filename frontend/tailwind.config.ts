import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                bnb: '#F0B90B',
                bnbdark: '#b88a00',
                depin: '#00d4ff',
                success: '#22c55e',
                danger: '#f43f5e',
                background: '#050709',
            },
            fontFamily: {
                sans: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-jetbrains-mono)', 'monospace'],
            },
        },
    },
    plugins: [],
}
export default config
