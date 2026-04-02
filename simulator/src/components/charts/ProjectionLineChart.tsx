'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatEuro } from '@/lib/utils';

interface ProjectionLineChartProps {
  data: { annee: number; capital: number; versements?: number }[];
  title?: string;
}

export default function ProjectionLineChart({ data, title }: ProjectionLineChartProps) {
  if (data.length === 0) return null;

  return (
    <div>
      {title && <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="annee" label={{ value: 'Année', position: 'bottom' }} />
          <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} />
          <Tooltip formatter={(value) => formatEuro(Number(value))} />
          <Legend />
          <Line type="monotone" dataKey="capital" stroke="#1E3A8A" strokeWidth={2} name="Capital" dot={false} />
          {data[0]?.versements !== undefined && (
            <Line type="monotone" dataKey="versements" stroke="#94A3B8" strokeWidth={1} strokeDasharray="5 5" name="Total versé" dot={false} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
