import type { Metadata, Viewport } from 'next';
import './globals.css';

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
};

export const viewport: Viewport = {
  themeColor: '#030712',
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
        {children}
      </body>
    </html>
  );
}
