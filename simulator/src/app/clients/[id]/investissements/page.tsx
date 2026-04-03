'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useClients } from '@/hooks/useClients';
import ClientSummary from '@/components/clients/ClientSummary';
import ClientSubNav from '@/components/layout/ClientSubNav';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import AssuranceVieSimulator from '@/components/investissements/AssuranceVieSimulator';
import PERSimulator from '@/components/investissements/PERSimulator';
import SCPISimulator from '@/components/investissements/SCPISimulator';
import PinelSimulator from '@/components/investissements/PinelSimulator';
import DeficitFoncierSimulator from '@/components/investissements/DeficitFoncierSimulator';

const tabs = [
  { id: 'av', label: 'Assurance-vie' },
  { id: 'per', label: 'PER' },
  { id: 'scpi', label: 'SCPI' },
  { id: 'pinel', label: 'Pinel' },
  { id: 'deficit', label: 'Déficit foncier' },
];

export default function InvestissementsPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const { getClient } = useClients();
  const [activeTab, setActiveTab] = useState('av');

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
        {activeTab === 'av' && <AssuranceVieSimulator />}
        {activeTab === 'per' && <PERSimulator />}
        {activeTab === 'scpi' && <SCPISimulator />}
        {activeTab === 'pinel' && <PinelSimulator />}
        {activeTab === 'deficit' && <DeficitFoncierSimulator />}
      </div>
    </div>
  );
}
