import type { Metadata } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'The Story Current',
  description: 'Independent stories, current affairs, and thoughtful perspectives.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
