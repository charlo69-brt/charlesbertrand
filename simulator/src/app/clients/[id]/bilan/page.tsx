'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useClients } from '@/hooks/useClients';
import { useBilan } from '@/hooks/useBilan';
import ClientSummary from '@/components/clients/ClientSummary';
import ClientSubNav from '@/components/layout/ClientSubNav';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import ActifsForm from '@/components/bilan/ActifsForm';
import PassifsForm from '@/components/bilan/PassifsForm';
import RevenusForm from '@/components/bilan/RevenusForm';
import ChargesForm from '@/components/bilan/ChargesForm';
import BilanDashboard from '@/components/bilan/BilanDashboard';

const tabs = [
  { id: 'synthese', label: 'Synthèse' },
  { id: 'actifs', label: 'Actifs' },
  { id: 'passifs', label: 'Passifs' },
  { id: 'revenus', label: 'Revenus' },
  { id: 'charges', label: 'Charges' },
];

export default function BilanPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const { getClient } = useClients();
  const {
    bilan, updateActifs, updatePassifs, updateRevenus, updateCharges,
    totalActifsImmobilier, totalActifsFinancier, totalActifsProfessionnel,
    totalActifs, totalPassifs, patrimoineNet, totalRevenus, totalCharges,
  } = useBilan(clientId);

  const [activeTab, setActiveTab] = useState('synthese');
  const client = getClient(clientId);

  if (!client) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-900">Client introuvable</h2>
        <Button className="mt-4" onClick={() => router.push('/clients')}>Retour</Button>
      </div>
    );
  }

  return (
    <div>
      <ClientSummary client={client} />
      <ClientSubNav clientId={clientId} />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'synthese' && (
          <BilanDashboard
            actifs={bilan.actifs}
            passifs={bilan.passifs}
            revenus={bilan.revenus}
            charges={bilan.charges}
            totalActifsImmobilier={totalActifsImmobilier}
            totalActifsFinancier={totalActifsFinancier}
            totalActifsProfessionnel={totalActifsProfessionnel}
            totalActifs={totalActifs}
            totalPassifs={totalPassifs}
            patrimoineNet={patrimoineNet}
            totalRevenus={totalRevenus}
            totalCharges={totalCharges}
          />
        )}
        {activeTab === 'actifs' && <ActifsForm actifs={bilan.actifs} onChange={updateActifs} situationFamiliale={client.situationFamiliale} regimeMatrimonial={client.regimeMatrimonial} />}
        {activeTab === 'passifs' && <PassifsForm passifs={bilan.passifs} onChange={updatePassifs} />}
        {activeTab === 'revenus' && <RevenusForm revenus={bilan.revenus} onChange={updateRevenus} />}
        {activeTab === 'charges' && <ChargesForm charges={bilan.charges} onChange={updateCharges} />}
      </div>
    </div>
  );
}
