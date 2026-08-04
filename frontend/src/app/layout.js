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

export const metadata = {
  title: 'IDX Terminal',
  description: 'Technical analysis dashboard for Indonesian stocks.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
      <body suppressHydrationWarning style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
