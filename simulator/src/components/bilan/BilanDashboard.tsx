'use client';

import { formatEuro } from '@/lib/utils';
import { Revenus } from '@/lib/types';
import Card from '@/components/ui/Card';
import PatrimoinePieChart from '@/components/charts/PatrimoinePieChart';
import BilanSummaryChart from '@/components/charts/BilanSummaryChart';
import RevenusBarChart from '@/components/charts/RevenusBarChart';

interface BilanDashboardProps {
  totalActifsImmobilier: number;
  totalActifsFinancier: number;
  totalActifsProfessionnel: number;
  totalActifs: number;
  totalPassifs: number;
  patrimoineNet: number;
  totalRevenus: number;
  totalCharges: number;
  revenus: Revenus;
}

export default function BilanDashboard(props: BilanDashboardProps) {
  const {
    totalActifsImmobilier, totalActifsFinancier, totalActifsProfessionnel,
    totalActifs, totalPassifs, patrimoineNet,
    totalRevenus, totalCharges, revenus,
  } = props;

  const capaciteEpargne = totalRevenus - totalCharges;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total actifs</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatEuro(totalActifs)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total passifs</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatEuro(totalPassifs)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Patrimoine net</p>
          <p className={`text-2xl font-bold mt-1 ${patrimoineNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatEuro(patrimoineNet)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Capacité d&apos;épargne</p>
          <p className={`text-2xl font-bold mt-1 ${capaciteEpargne >= 0 ? 'text-blue-900' : 'text-red-600'}`}>
            {formatEuro(capaciteEpargne)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Répartition du patrimoine">
          <PatrimoinePieChart
            immobilier={totalActifsImmobilier}
            financier={totalActifsFinancier}
            professionnel={totalActifsProfessionnel}
          />
        </Card>
        <Card title="Actifs vs Passifs">
          <BilanSummaryChart totalActifs={totalActifs} totalPassifs={totalPassifs} />
        </Card>
      </div>

      <Card title="Répartition des revenus">
        <RevenusBarChart revenus={revenus} />
      </Card>
    </div>
  );
}
