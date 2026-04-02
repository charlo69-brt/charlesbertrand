'use client';

import Link from 'next/link';
import { Client } from '@/lib/types';
import { calculateAge, getSituationLabel } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

interface ClientCardProps {
  client: Client;
}

export default function ClientCard({ client }: ClientCardProps) {
  const age = client.dateNaissance ? calculateAge(client.dateNaissance) : null;

  return (
    <Link
      href={`/simulator/clients/${client.id}`}
      className="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {client.prenom} {client.nom}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="blue">{getSituationLabel(client.situationFamiliale)}</Badge>
            {age !== null && <span className="text-sm text-gray-500">{age} ans</span>}
            {client.nombreEnfants > 0 && (
              <span className="text-sm text-gray-500">{client.nombreEnfants} enfant{client.nombreEnfants > 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
      {client.profession && (
        <p className="text-sm text-gray-500 mt-2">{client.profession}</p>
      )}
    </Link>
  );
}
