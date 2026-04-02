'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatEuro } from '@/lib/utils';

interface BilanSummaryChartProps {
  totalActifs: number;
  totalPassifs: number;
}

export default function BilanSummaryChart({ totalActifs, totalPassifs }: BilanSummaryChartProps) {
  const data = [
    { name: 'Actifs', montant: totalActifs },
    { name: 'Passifs', montant: totalPassifs },
    { name: 'Patrimoine net', montant: totalActifs - totalPassifs },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value) => formatEuro(Number(value))} />
        <Bar dataKey="montant" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
