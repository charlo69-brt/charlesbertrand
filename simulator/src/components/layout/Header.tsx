'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

function getBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const segments = pathname.replace('/simulator', '').split('/').filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [
    { label: 'PatriSim', href: '/simulator' },
  ];

  const labelMap: Record<string, string> = {
    clients: 'Clients',
    nouveau: 'Nouveau client',
    bilan: 'Bilan patrimonial',
    fiscalite: 'Fiscalité',
    investissements: 'Investissements',
    retraite: 'Retraite',
    succession: 'Succession',
    parametres: 'Paramètres',
  };

  let path = '/simulator';
  for (const segment of segments) {
    path += `/${segment}`;
    const label = labelMap[segment] || segment;
    crumbs.push({ label, href: path });
  }

  return crumbs;
}

export default function Header() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname || '');

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
      <nav className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center">
            {i > 0 && <span className="mx-2 text-gray-300">/</span>}
            {crumb.href && i < breadcrumbs.length - 1 ? (
              <Link href={crumb.href} className="text-gray-500 hover:text-blue-900 transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
    </header>
  );
}
