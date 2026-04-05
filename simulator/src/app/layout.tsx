import type { Metadata } from 'next';
import './globals.css';
import LayoutShell from '../components/layout/LayoutShell';

export const metadata: Metadata = {
  title: 'PatriSim - Simulateur Patrimonial',
  description: 'Outil de simulation patrimoniale pour gestionnaires de patrimoine indépendants',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans">
        <LayoutShell>
          {children}
        </LayoutShell>
      </body>
    </html>
  );
}
