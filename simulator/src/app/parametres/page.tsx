'use client';

import { useState, useRef } from 'react';
import { exportData, importData, clearData } from '@/lib/storage';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';

export default function ParametresPage() {
  const [showClearModal, setShowClearModal] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patrisim-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importData(content);
      if (result) {
        setImportStatus('Données importées avec succès !');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setImportStatus('Erreur : fichier invalide');
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    clearData();
    setShowClearModal(false);
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 mt-1">Gérez vos données et préférences</p>
      </div>

      <Card title="Exporter les données">
        <p className="text-sm text-gray-600 mb-4">
          Téléchargez une copie de toutes vos données (clients, bilans) au format JSON.
        </p>
        <Button onClick={handleExport}>Exporter en JSON</Button>
      </Card>

      <Card title="Importer des données">
        <p className="text-sm text-gray-600 mb-4">
          Restaurez vos données depuis un fichier JSON précédemment exporté. Attention : les données actuelles seront remplacées.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
          Choisir un fichier JSON
        </Button>
        {importStatus && (
          <p className={`mt-3 text-sm ${importStatus.includes('succès') ? 'text-green-600' : 'text-red-600'}`}>
            {importStatus}
          </p>
        )}
      </Card>

      <Card title="Supprimer toutes les données">
        <p className="text-sm text-gray-600 mb-4">
          Supprimez définitivement toutes les données de l&apos;application. Cette action est irréversible.
        </p>
        <Button variant="danger" onClick={() => setShowClearModal(true)}>
          Supprimer toutes les données
        </Button>
      </Card>

      <Card title="Informations">
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Version :</strong> 1.0.0</p>
          <p><strong>Fiscalité :</strong> Loi de Finances 2026 (revenus 2025)</p>
          <p><strong>Stockage :</strong> Données locales (navigateur)</p>
          <p><strong>Développé par :</strong> Charles Bertrand</p>
        </div>
      </Card>

      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Confirmer la suppression"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">
          Êtes-vous sûr de vouloir supprimer toutes les données ? Tous les clients et bilans seront perdus définitivement.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>Annuler</Button>
          <Button variant="danger" onClick={handleClear}>Confirmer la suppression</Button>
        </div>
      </Modal>
    </div>
  );
}
