'use client';

import Link from 'next/link';
import { useClients } from '../hooks/useClients';
import { formatEuro, calculateAge, getSituationLabel } from '../lib/utils';
import { useBilan } from '../hooks/useBilan';

function ClientPatrimoineTotal({ clientId }: { clientId: string }) {
  const { totalActifs, totalPassifs } = useBilan(clientId);
  const patrimoine = totalActifs - totalPassifs;
  return <span className="text-sm font-semibold text-blue-700">{formatEuro(patrimoine)}</span>;
}

export default function Dashboard() {
  const { clients } = useClients();

  const recentClients = [...clients]
    .sort((a, b) => new Date(b.modifieLe).getTime() - new Date(a.modifieLe).getTime())
    .slice(0, 5);

  const stats = [
    {
      label: 'Clients',
      value: clients.length,
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'bg-blue-50 border-blue-200',
    },
    {
      label: 'Modules disponibles',
      value: 6,
      icon: (
        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      color: 'bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Loi de Finances',
      value: '2026',
      icon: (
        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'bg-amber-50 border-amber-200',
    },
  ];

  const modules = [
    {
      title: 'Bilan Patrimonial',
      description: 'Actifs, passifs, revenus et charges de vos clients',
      icon: '📊',
      color: 'border-l-blue-500',
    },
    {
      title: 'Fiscalité IR + IFI',
      description: 'Impôt sur le revenu et impôt sur la fortune immobilière',
      icon: '🏛️',
      color: 'border-l-red-500',
    },
    {
      title: 'Investissements',
      description: 'AV, PER, SCPI, Pinel, Déficit foncier',
      icon: '📈',
      color: 'border-l-emerald-500',
    },
    {
      title: 'Retraite',
      description: 'Estimation pension, analyse écart, surcote/décote',
      icon: '🏖️',
      color: 'border-l-purple-500',
    },
    {
      title: 'Succession & Donation',
      description: 'Droits de succession, démembrement, assurance-vie',
      icon: '🏠',
      color: 'border-l-amber-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-1 text-gray-500">
          Bienvenue sur PatriSim, votre simulateur patrimonial conforme à la Loi de Finances 2026
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className={`${stat.color} border rounded-xl p-6 flex items-center gap-4`}>
            {stat.icon}
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link
          href="/clients/nouveau"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau client
        </Link>
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          Voir tous les clients
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Clients */}
        <div className="bg-white border rounded-xl">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Clients récents</h2>
          </div>
          {recentClients.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p>Aucun client pour le moment</p>
              <Link href="/clients/nouveau" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                Créer votre premier client
              </Link>
            </div>
          ) : (
            <ul className="divide-y">
              {recentClients.map((client) => (
                <li key={client.id}>
                  <Link href={`/clients/${client.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
                    <div>
                      <p className="font-medium text-gray-900">
                        {client.prenom} {client.nom}
                      </p>
                      <p className="text-sm text-gray-500">
                        {calculateAge(client.dateNaissance)} ans · {getSituationLabel(client.situationFamiliale)}
                        {client.nombreEnfants > 0 && ` · ${client.nombreEnfants} enfant${client.nombreEnfants > 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <ClientPatrimoineTotal clientId={client.id} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Modules */}
        <div className="bg-white border rounded-xl">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Modules disponibles</h2>
          </div>
          <ul className="divide-y">
            {modules.map((mod) => (
              <li key={mod.title} className={`px-6 py-4 border-l-4 ${mod.color}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{mod.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{mod.title}</p>
                    <p className="text-sm text-gray-500">{mod.description}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Fonctionnement</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Toutes les données sont stockées localement dans votre navigateur (localStorage)</li>
          <li>• Aucune donnée n&apos;est envoyée sur un serveur - confidentialité totale</li>
          <li>• Exportez/importez vos données depuis la page Paramètres</li>
          <li>• Barèmes et calculs conformes à la Loi de Finances 2026</li>
        </ul>
      </div>
    </div>
  );
}
