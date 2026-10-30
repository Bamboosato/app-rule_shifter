import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'Rule Shifter（ルール・シフター / 潜伏規則迷路）',
  description:
    'WCST（ウィスコンシン・カード分類課題）を一筆書き迷路に統合！ブラックボックス推理とサイレント相転移で認知的柔軟性を鍛える脳トレWebアプリ。',
  keywords: [
    'Rule Shifter',
    'ルールシフター',
    '潜伏規則迷路',
    'WCST',
    'ウィスコンシンカード分類課題',
    '脳トレ',
    '認知的柔軟性',
    'セットシフティング',
    'パズル',
    '一筆書き',
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Rule Shifter',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Rule Shifter（ルール・シフター / 潜伏規則迷路）',
    description:
      '隠された移動法則を推理し、突如訪れる次元の急変に適応する前頭葉・認知的柔軟性迷路パズル。',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rule Shifter（潜伏規則迷路）',
    description: 'WCST×一筆書き！認知的柔軟性を覚醒させる脳トレ迷路パズル。',
  },
};

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
