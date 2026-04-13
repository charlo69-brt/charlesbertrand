'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

interface ClientSubNavProps {
  clientId: string;
}

const tabs = [
  { id: 'fiche', label: 'Fiche client', path: '' },
  { id: 'famille', label: 'Famille', path: '/famille' },
  { id: 'bilan', label: 'Bilan patrimonial', path: '/bilan' },
  { id: 'fiscalite', label: 'Fiscalité', path: '/fiscalite' },
  { id: 'investissements', label: 'Investissements', path: '/investissements' },
  { id: 'retraite', label: 'Retraite', path: '/retraite' },
  { id: 'succession', label: 'Succession', path: '/succession' },
];

export default function ClientSubNav({ clientId }: ClientSubNavProps) {
  const pathname = usePathname();
  const basePath = `/clients/${clientId}`;

  return (
    <div className="border-b border-gray-200 bg-white -mx-4 md:-mx-6 px-4 md:px-6 mb-6">
      <nav className="flex space-x-4 md:space-x-6 -mb-px overflow-x-auto scrollbar-hide" aria-label="Client navigation">
        {tabs.map((tab) => {
          const href = `${basePath}${tab.path}`;
          const isActive = tab.path === ''
            ? pathname === basePath
            : pathname?.startsWith(href);
          return (
            <Link
              key={tab.id}
              href={href}
              className={clsx(
                'py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                isActive
                  ? 'border-blue-900 text-blue-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
