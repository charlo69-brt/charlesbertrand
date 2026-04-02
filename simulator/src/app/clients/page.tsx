'use client';

import { useRouter } from 'next/navigation';
import { useClients } from '@/hooks/useClients';
import ClientCard from '@/components/clients/ClientCard';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';

export default function ClientsPage() {
  const router = useRouter();
  const { clients } = useClients();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">{clients.length} client{clients.length !== 1 ? 's' : ''} enregistré{clients.length !== 1 ? 's' : ''}</p>
        </div>
        {clients.length > 0 && (
          <Button onClick={() => router.push('/simulator/clients/nouveau')}>
            + Nouveau client
          </Button>
        )}
      </div>

      {clients.length === 0 ? (
        <EmptyState
          title="Aucun client"
          description="Commencez par créer votre premier client pour accéder aux outils de simulation patrimoniale."
          actionLabel="Créer un client"
          onAction={() => router.push('/simulator/clients/nouveau')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  );
}
