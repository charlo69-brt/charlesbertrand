'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatEuro } from '@/lib/utils';

interface PatrimoinePieChartProps {
  immobilier: number;
  financier: number;
  professionnel: number;
}

const COLORS = ['#1E3A8A', '#3B82F6', '#22C55E'];

export default function PatrimoinePieChart({ immobilier, financier, professionnel }: PatrimoinePieChartProps) {
  const data = [
    { name: 'Immobilier', value: immobilier },
    { name: 'Financier', value: financier },
    { name: 'Professionnel', value: professionnel },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-8">Aucun actif enregistré</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatEuro(Number(value))} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
