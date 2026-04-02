'use client';

import { useRouter } from 'next/navigation';
import { useClients } from '@/hooks/useClients';
import ClientForm from '@/components/clients/ClientForm';
import Card from '@/components/ui/Card';

export default function NouveauClientPage() {
  const router = useRouter();
  const { addClient } = useClients();

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nouveau client</h1>
      <Card>
        <ClientForm
          onSubmit={(data) => {
            const client = addClient(data);
            router.push(`/simulator/clients/${client.id}`);
          }}
          onCancel={() => router.push('/simulator/clients')}
        />
      </Card>
    </div>
  );
}
