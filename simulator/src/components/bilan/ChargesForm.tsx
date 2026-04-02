'use client';

import { Charges } from '@/lib/types';
import NumberInput from '@/components/ui/NumberInput';
import Card from '@/components/ui/Card';

interface ChargesFormProps {
  charges: Charges;
  onChange: (charges: Charges) => void;
}

export default function ChargesForm({ charges, onChange }: ChargesFormProps) {
  const update = (field: keyof Charges, value: number) => {
    onChange({ ...charges, [field]: value });
  };

  return (
    <Card title="Charges annuelles">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumberInput label="Charges courantes" value={charges.chargesCourantes} onChange={(v) => update('chargesCourantes', v)} />
        <NumberInput label="Impôt sur le revenu" value={charges.impotRevenu} onChange={(v) => update('impotRevenu', v)} />
        <NumberInput label="Taxe foncière" value={charges.taxeFonciere} onChange={(v) => update('taxeFonciere', v)} />
        <NumberInput label="IFI" value={charges.ifi} onChange={(v) => update('ifi', v)} />
        <NumberInput label="Épargne annuelle" value={charges.epargneAnnuelle} onChange={(v) => update('epargneAnnuelle', v)} />
      </div>
    </Card>
  );
}
