'use client';

import { Revenus } from '@/lib/types';
import NumberInput from '@/components/ui/NumberInput';
import Card from '@/components/ui/Card';

interface RevenusFormProps {
  revenus: Revenus;
  onChange: (revenus: Revenus) => void;
}

export default function RevenusForm({ revenus, onChange }: RevenusFormProps) {
  const update = (field: keyof Revenus, value: number) => {
    onChange({ ...revenus, [field]: value });
  };

  return (
    <Card title="Revenus annuels">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumberInput label="Salaires nets" value={revenus.salairesNets} onChange={(v) => update('salairesNets', v)} />
        <NumberInput label="BIC / BNC" value={revenus.bicBnc} onChange={(v) => update('bicBnc', v)} />
        <NumberInput label="Revenus fonciers" value={revenus.revenusFonciers} onChange={(v) => update('revenusFonciers', v)} />
        <NumberInput label="Revenus mobiliers" value={revenus.revenusMobiliers} onChange={(v) => update('revenusMobiliers', v)} />
        <NumberInput label="Pensions / Retraites" value={revenus.pensions} onChange={(v) => update('pensions', v)} />
        <NumberInput label="Autres revenus" value={revenus.autresRevenus} onChange={(v) => update('autresRevenus', v)} />
      </div>
    </Card>
  );
}
