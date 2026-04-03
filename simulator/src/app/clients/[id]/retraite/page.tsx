'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useClients } from '@/hooks/useClients';
import { useBilan } from '@/hooks/useBilan';
import { simulerRetraite } from '@/lib/calculs/retraite';
import ClientSummary from '@/components/clients/ClientSummary';
import ClientSubNav from '@/components/layout/ClientSubNav';
import RetraiteForm from '@/components/retraite/RetraiteForm';
import RetraiteResult from '@/components/retraite/RetraiteResult';
import Button from '@/components/ui/Button';

export default function RetraitePage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const { getClient } = useClients();
  const { bilan } = useBilan(clientId);

  const client = getClient(clientId);

  const [salaireAnnuel, setSalaireAnnuel] = useState(bilan.revenus.salairesNets * 1.25 || 40000);
  const [trimestres, setTrimestres] = useState(120);
  const [ageDepart, setAgeDepart] = useState(64);
  const [besoinMensuel, setBesoinMensuel] = useState(3000);

  const resultat = useMemo(
    () => client ? simulerRetraite(client.dateNaissance, salaireAnnuel, trimestres, ageDepart, besoinMensuel) : null,
    [client, salaireAnnuel, trimestres, ageDepart, besoinMensuel]
  );

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
        <RetraiteForm
          salaireAnnuel={salaireAnnuel}
          onSalaireChange={setSalaireAnnuel}
          trimestres={trimestres}
          onTrimestresChange={setTrimestres}
          ageDepart={ageDepart}
          onAgeDepartChange={setAgeDepart}
          besoinMensuel={besoinMensuel}
          onBesoinChange={setBesoinMensuel}
        />

        {resultat && <RetraiteResult resultat={resultat} />}
      </div>
    </div>
  );
}
