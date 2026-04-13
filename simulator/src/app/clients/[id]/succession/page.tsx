'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useClients } from '@/hooks/useClients';
import { useBilan } from '@/hooks/useBilan';
import ClientSummary from '@/components/clients/ClientSummary';
import ClientSubNav from '@/components/layout/ClientSubNav';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import SuccessionSimulator from '@/components/succession/SuccessionSimulator';
import DemembrementTable from '@/components/succession/DemembrementTable';
import DMTGCalculator from '@/components/succession/DMTGCalculator';

const tabs = [
  { id: 'dmtg', label: 'DMTG & Conjoint' },
  { id: 'succession', label: 'Succession libre' },
  { id: 'demembrement', label: 'Démembrement' },
];

export default function SuccessionPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const { getClient } = useClients();
  const { patrimoineNet, totalPassifs, bilan } = useBilan(clientId);
  const [activeTab, setActiveTab] = useState('dmtg');

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
        {activeTab === 'dmtg' && (
          <DMTGCalculator
            client={client}
            patrimoine={patrimoineNet}
            passifs={totalPassifs}
            actifs={[
              ...bilan.actifs.immobilier.map(b => ({ valeur: b.valeur, detention: b.detention })),
              ...bilan.actifs.financier.map(a => ({ valeur: a.valeur, detention: a.detention })),
              ...bilan.actifs.professionnel.map(a => ({ valeur: a.valeur, detention: a.detention })),
            ]}
          />
        )}
        {activeTab === 'succession' && <SuccessionSimulator patrimoine={patrimoineNet} />}
        {activeTab === 'demembrement' && <DemembrementTable />}
      </div>
    </div>
  );
}
