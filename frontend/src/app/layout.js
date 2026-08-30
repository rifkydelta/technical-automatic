import './globals.css';
import { Inter, JetBrains_Mono } from 'next/font/google';

// Body font
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Mono font for numbers and tickers
const mono = JetBrains_Mono({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'IDX Terminal | Pro Algorithmic Market Intelligence',
  description: 'Technical analysis and real-time signal scanner dashboard for Indonesian stocks.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
      <body suppressHydrationWarning style={{ fontFamily: 'var(--font-inter), sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
