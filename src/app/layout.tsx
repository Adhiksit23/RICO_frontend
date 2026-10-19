import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: {
    default: 'RICO AI | Machine Quality Platform',
    template: '%s | RICO AI',
  },
  description:
    'Real-time industrial die casting quality control — defect prediction, process monitoring, and machine calibration powered by AI.',
  keywords: ['die casting', 'quality control', 'AI', 'defect prediction', 'RICO'],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <AppShell>{children}</AppShell>
        </QueryProvider>
      </body>
    </html>
  );
}
