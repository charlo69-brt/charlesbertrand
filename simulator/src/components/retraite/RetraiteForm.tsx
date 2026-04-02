'use client';

import NumberInput from '@/components/ui/NumberInput';
import Card from '@/components/ui/Card';

interface RetraiteFormProps {
  salaireAnnuel: number;
  onSalaireChange: (v: number) => void;
  trimestres: number;
  onTrimestresChange: (v: number) => void;
  ageDepart: number;
  onAgeDepartChange: (v: number) => void;
  besoinMensuel: number;
  onBesoinChange: (v: number) => void;
}

export default function RetraiteForm(props: RetraiteFormProps) {
  return (
    <Card title="Paramètres de simulation retraite">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumberInput
          label="Salaire annuel brut"
          value={props.salaireAnnuel}
          onChange={props.onSalaireChange}
        />
        <NumberInput
          label="Trimestres validés"
          value={props.trimestres}
          onChange={props.onTrimestresChange}
          suffix="trim."
          min={0}
          max={200}
        />
        <NumberInput
          label="Âge de départ souhaité"
          value={props.ageDepart}
          onChange={props.onAgeDepartChange}
          suffix="ans"
          min={62}
          max={70}
        />
        <NumberInput
          label="Besoin mensuel à la retraite"
          value={props.besoinMensuel}
          onChange={props.onBesoinChange}
        />
      </div>
    </Card>
  );
}
