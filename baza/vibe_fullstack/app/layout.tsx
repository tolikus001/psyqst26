import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vibe AI Starter Kit',
  description: 'Стартер-кит уровня 2 для вайбкодинга с поддержкой ИИ и базы данных SQLite',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        {/* Notibot Bridge SDK — СИНХРОННО в head */}
        <script src="/js/notibot-bridge.js"></script>
      </head>
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
