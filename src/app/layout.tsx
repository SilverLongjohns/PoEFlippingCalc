import type { Metadata } from 'next';
import { EmotionRegistry } from '@/components/EmotionRegistry';

export const metadata: Metadata = {
  title: 'PoE Currency Flipper',
  description: 'Find profitable currency flipping opportunities in Path of Exile',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Fontin&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#0c0b0a' }}>
        <EmotionRegistry>{children}</EmotionRegistry>
      </body>
    </html>
  );
}
