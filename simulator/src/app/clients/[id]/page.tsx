'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useClients } from '@/hooks/useClients';
import ClientSubNav from '@/components/layout/ClientSubNav';
import ClientSummary from '@/components/clients/ClientSummary';
import ClientForm from '@/components/clients/ClientForm';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const { getClient, updateClient, deleteClient } = useClients();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const client = getClient(clientId);

  if (!client) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-900">Client introuvable</h2>
        <p className="text-gray-500 mt-2">Ce client n&apos;existe pas ou a été supprimé.</p>
        <Button className="mt-4" onClick={() => router.push('/clients')}>
          Retour aux clients
        </Button>
      </div>
    );
  }

  return (
    <div>
      <ClientSummary client={client} />
      <ClientSubNav clientId={clientId} />

      {isEditing ? (
        <Card title="Modifier le client">
          <ClientForm
            initialData={client}
            onSubmit={(data) => {
              updateClient(clientId, data);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        </Card>
      ) : (
        <div className="space-y-6">
          <Card
            title="Informations personnelles"
            action={
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setIsEditing(true)}>Modifier</Button>
                <Button size="sm" variant="danger" onClick={() => setShowDeleteModal(true)}>Supprimer</Button>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Nom :</span> <span className="font-medium">{client.nom}</span></div>
              <div><span className="text-gray-500">Prénom :</span> <span className="font-medium">{client.prenom}</span></div>
              <div><span className="text-gray-500">Date de naissance :</span> <span className="font-medium">{client.dateNaissance ? new Date(client.dateNaissance).toLocaleDateString('fr-FR') : '-'}</span></div>
              <div><span className="text-gray-500">Profession :</span> <span className="font-medium">{client.profession || '-'}</span></div>
              <div><span className="text-gray-500">Email :</span> <span className="font-medium">{client.email || '-'}</span></div>
              <div><span className="text-gray-500">Téléphone :</span> <span className="font-medium">{client.telephone || '-'}</span></div>
              <div className="md:col-span-2"><span className="text-gray-500">Adresse :</span> <span className="font-medium">{client.adresse || '-'}</span></div>
            </div>
          </Card>
        </div>
      )}

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Supprimer le client"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">
          Êtes-vous sûr de vouloir supprimer {client.prenom} {client.nom} ? Cette action est irréversible et supprimera toutes les données associées.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Annuler</Button>
          <Button
            variant="danger"
            onClick={() => {
              deleteClient(clientId);
              router.push('/clients');
            }}
          >
            Supprimer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
