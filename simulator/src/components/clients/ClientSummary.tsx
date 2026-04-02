'use client';

import { Client } from '@/lib/types';
import { calculateAge, getSituationLabel, getRegimeLabel } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

interface ClientSummaryProps {
  client: Client;
}

export default function ClientSummary({ client }: ClientSummaryProps) {
  const age = client.dateNaissance ? calculateAge(client.dateNaissance) : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-900 font-bold text-lg">
            {client.prenom[0]}{client.nom[0]}
          </span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{client.prenom} {client.nom}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="blue">{getSituationLabel(client.situationFamiliale)}</Badge>
            {client.regimeMatrimonial && <Badge variant="gray">{getRegimeLabel(client.regimeMatrimonial)}</Badge>}
            {age !== null && <span className="text-sm text-gray-500">{age} ans</span>}
            {client.nombreEnfants > 0 && (
              <span className="text-sm text-gray-500">{client.nombreEnfants} enfant{client.nombreEnfants > 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
