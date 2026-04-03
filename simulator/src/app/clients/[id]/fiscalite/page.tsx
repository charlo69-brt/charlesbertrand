'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useClients } from '@/hooks/useClients';
import { useBilan } from '@/hooks/useBilan';
import ClientSummary from '@/components/clients/ClientSummary';
import ClientSubNav from '@/components/layout/ClientSubNav';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import IRSimulator from '@/components/fiscalite/IRSimulator';
import IFISimulator from '@/components/fiscalite/IFISimulator';

const tabs = [
  { id: 'ir', label: 'Impôt sur le revenu' },
  { id: 'ifi', label: 'IFI' },
];

export default function FiscalitePage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const { getClient } = useClients();
  const { bilan } = useBilan(clientId);
  const [activeTab, setActiveTab] = useState('ir');

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
        {activeTab === 'ir' && (
          <IRSimulator
            revenus={bilan.revenus}
            situation={client.situationFamiliale}
            enfantsACharge={client.enfantsACharge}
          />
        )}
        {activeTab === 'ifi' && (
          <IFISimulator biens={bilan.actifs.immobilier} />
        )}
      </div>
    </div>
  );
}
