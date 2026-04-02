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

const tabs = [
  { id: 'succession', label: 'Succession' },
  { id: 'demembrement', label: 'Démembrement' },
];

export default function SuccessionPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const { getClient } = useClients();
  const { patrimoineNet } = useBilan(clientId);
  const [activeTab, setActiveTab] = useState('succession');

  const client = getClient(clientId);

  if (!client) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-900">Client introuvable</h2>
        <Button className="mt-4" onClick={() => router.push('/simulator/clients')}>Retour</Button>
      </div>
    );
  }

  return (
    <div>
      <ClientSummary client={client} />
      <ClientSubNav clientId={clientId} />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'succession' && <SuccessionSimulator patrimoine={patrimoineNet} />}
        {activeTab === 'demembrement' && <DemembrementTable />}
      </div>
    </div>
  );
}
