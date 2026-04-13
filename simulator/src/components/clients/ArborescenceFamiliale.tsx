'use client';

import { Client } from '@/lib/types';
import { calculateAge, getSituationLabel, getRegimeLabel } from '@/lib/utils';

interface ArborescenceFamilialeProps {
  client: Client;
}

function PersonNode({ prenom, nom, age, role, emoji, color }: {
  prenom: string;
  nom?: string;
  age?: number;
  role: string;
  emoji: string;
  color: string;
}) {
  return (
    <div className={`${color} rounded-xl p-3 text-center min-w-[120px] border-2 shadow-sm`}>
      <span className="text-2xl block mb-1">{emoji}</span>
      <p className="text-sm font-semibold text-gray-900">{prenom}{nom ? ` ${nom}` : ''}</p>
      {age !== undefined && <p className="text-xs text-gray-500">{age} ans</p>}
      <span className="inline-block text-[10px] font-medium mt-1 px-2 py-0.5 rounded-full bg-white/60 text-gray-600">{role}</span>
    </div>
  );
}

export default function ArborescenceFamiliale({ client }: ArborescenceFamilialeProps) {
  const membres = client.membres || [];
  const conjoint = membres.find(m => m.lien === 'conjoint');
  const enfants = membres.filter(m => m.lien === 'enfant');
  const parents = membres.filter(m => m.lien === 'parent');
  const autres = membres.filter(m => m.lien === 'frere_soeur');

  const clientAge = client.dateNaissance ? calculateAge(client.dateNaissance) : undefined;
  const conjointAge = conjoint?.dateNaissance ? calculateAge(conjoint.dateNaissance) : undefined;

  const isCouple = client.situationFamiliale === 'marie' || client.situationFamiliale === 'pacse';

  if (membres.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <span className="text-4xl block mb-3">👨‍👩‍👧‍👦</span>
        <h3 className="text-lg font-semibold text-gray-700">Arborescence familiale</h3>
        <p className="text-sm text-gray-500 mt-1">
          Ajoutez des membres de la famille pour visualiser l&apos;arborescence
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
        <span>🌳</span> Arborescence familiale
      </h3>

      {/* Info régime */}
      {isCouple && client.regimeMatrimonial && (
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-3 py-1">
            💍 {getSituationLabel(client.situationFamiliale)} — {getRegimeLabel(client.regimeMatrimonial)}
          </span>
        </div>
      )}

      {/* Parents row */}
      {parents.length > 0 && (
        <>
          <div className="flex justify-center gap-4 mb-2">
            {parents.map(p => (
              <PersonNode
                key={p.id}
                prenom={p.prenom}
                nom={p.nom}
                age={p.dateNaissance ? calculateAge(p.dateNaissance) : undefined}
                role="Parent"
                emoji="👴"
                color="bg-amber-50 border-amber-200"
              />
            ))}
          </div>
          <div className="flex justify-center mb-2">
            <div className="w-px h-6 bg-gray-300" />
          </div>
        </>
      )}

      {/* Couple / Client row */}
      <div className="flex justify-center items-center gap-3 mb-2">
        <PersonNode
          prenom={client.prenom}
          nom={client.nom}
          age={clientAge}
          role="Client"
          emoji="👤"
          color="bg-blue-50 border-blue-300"
        />
        {conjoint && (
          <>
            <div className="flex flex-col items-center">
              <div className="w-8 h-px bg-red-300" />
              <span className="text-xs text-red-400">❤️</span>
              <div className="w-8 h-px bg-red-300" />
            </div>
            <PersonNode
              prenom={conjoint.prenom || 'Conjoint'}
              nom={conjoint.nom}
              age={conjointAge}
              role={client.situationFamiliale === 'marie' ? 'Époux(se)' : 'Partenaire'}
              emoji="💍"
              color="bg-pink-50 border-pink-300"
            />
          </>
        )}
      </div>

      {/* Connector to children */}
      {enfants.length > 0 && (
        <>
          <div className="flex justify-center">
            <div className="w-px h-6 bg-gray-300" />
          </div>
          {enfants.length > 1 && (
            <div className="flex justify-center">
              <div className="border-t-2 border-gray-300" style={{ width: `${Math.min(enfants.length * 140, 500)}px` }} />
            </div>
          )}
          <div className="flex justify-center gap-4 mt-2 flex-wrap">
            {enfants.map(enfant => (
              <div key={enfant.id} className="flex flex-col items-center">
                {enfants.length > 1 && <div className="w-px h-3 bg-gray-300" />}
                <PersonNode
                  prenom={enfant.prenom || 'Enfant'}
                  nom={enfant.nom}
                  age={enfant.dateNaissance ? calculateAge(enfant.dateNaissance) : undefined}
                  role={enfant.estACharge ? 'À charge' : 'Enfant'}
                  emoji="👶"
                  color="bg-green-50 border-green-300"
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Frères / soeurs */}
      {autres.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3 text-center">Frères & soeurs</p>
          <div className="flex justify-center gap-4 flex-wrap">
            {autres.map(m => (
              <PersonNode
                key={m.id}
                prenom={m.prenom || 'Membre'}
                nom={m.nom}
                age={m.dateNaissance ? calculateAge(m.dateNaissance) : undefined}
                role="Frère/Soeur"
                emoji="👥"
                color="bg-orange-50 border-orange-200"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
