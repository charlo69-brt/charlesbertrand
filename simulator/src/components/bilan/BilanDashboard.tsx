'use client';

import { Actifs, Passifs, Revenus, Charges } from '@/lib/types';
import Card from '@/components/ui/Card';
import PatrimoinePieChart from '@/components/charts/PatrimoinePieChart';
import BilanSummaryChart from '@/components/charts/BilanSummaryChart';
import RevenusBarChart from '@/components/charts/RevenusBarChart';
import PatrimoineMap from '@/components/bilan/PatrimoineMap';

interface BilanDashboardProps {
  actifs: Actifs;
  passifs: Passifs;
  revenus: Revenus;
  charges: Charges;
  totalActifsImmobilier: number;
  totalActifsFinancier: number;
  totalActifsProfessionnel: number;
  totalActifs: number;
  totalPassifs: number;
  patrimoineNet: number;
  totalRevenus: number;
  totalCharges: number;
}

export default function BilanDashboard(props: BilanDashboardProps) {
  const {
    actifs, passifs, revenus, charges,
    totalActifsImmobilier, totalActifsFinancier, totalActifsProfessionnel,
    totalActifs, totalPassifs, patrimoineNet,
    totalRevenus, totalCharges,
  } = props;

  return (
    <div className="space-y-6">
      {/* Cartographie patrimoniale */}
      <PatrimoineMap
        actifs={actifs}
        passifs={passifs}
        revenus={revenus}
        charges={charges}
        totalActifs={totalActifs}
        totalPassifs={totalPassifs}
        patrimoineNet={patrimoineNet}
        totalRevenus={totalRevenus}
        totalCharges={totalCharges}
      />

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
