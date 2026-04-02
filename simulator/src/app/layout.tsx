import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

export const metadata: Metadata = {
  title: 'PatriSim - Simulateur Patrimonial',
  description: 'Outil de simulation patrimoniale pour gestionnaires de patrimoine indépendants',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans">
        <Sidebar />
        <div className="ml-64 min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
