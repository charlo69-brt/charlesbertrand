'use client';

import { useParams, useRouter } from 'next/navigation';
import { useClients } from '@/hooks/useClients';
import ClientSummary from '@/components/clients/ClientSummary';
import ClientSubNav from '@/components/layout/ClientSubNav';
import FamilleManager from '@/components/clients/FamilleManager';
import ArborescenceFamiliale from '@/components/clients/ArborescenceFamiliale';
import Button from '@/components/ui/Button';

export default function FamillePage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const { getClient, updateClient } = useClients();

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

      <div className="space-y-6">
        <ArborescenceFamiliale client={client} />
        <FamilleManager
          client={client}
          onUpdate={(membres) => {
            const enfantsCount = membres.filter(m => m.lien === 'enfant').length;
            const enfantsACharge = membres.filter(m => m.lien === 'enfant' && m.estACharge).length;
            updateClient(clientId, {
              membres,
              nombreEnfants: enfantsCount,
              enfantsACharge,
            });
          }}
        />
      </div>
    </div>
  );
}
