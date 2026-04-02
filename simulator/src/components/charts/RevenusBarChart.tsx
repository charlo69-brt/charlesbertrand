'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Revenus } from '@/lib/types';
import { formatEuro } from '@/lib/utils';

interface RevenusBarChartProps {
  revenus: Revenus;
}

export default function RevenusBarChart({ revenus }: RevenusBarChartProps) {
  const data = [
    { name: 'Salaires', montant: revenus.salairesNets },
    { name: 'BIC/BNC', montant: revenus.bicBnc },
    { name: 'Fonciers', montant: revenus.revenusFonciers },
    { name: 'Mobiliers', montant: revenus.revenusMobiliers },
    { name: 'Pensions', montant: revenus.pensions },
    { name: 'Autres', montant: revenus.autresRevenus },
  ].filter((d) => d.montant > 0);

  if (data.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-8">Aucun revenu enregistré</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value) => formatEuro(Number(value))} />
        <Bar dataKey="montant" fill="#3B82F6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
