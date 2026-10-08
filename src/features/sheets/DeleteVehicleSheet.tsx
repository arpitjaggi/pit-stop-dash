import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeleteVehicle, useGarage } from '@/data/hooks';
import { Button, Notice, friendlyError } from '@/ui/atoms';
import { useToast } from '@/ui/hooks';
import { Sheet } from '@/ui/Sheet';
import { useActiveVehicle } from './common';

export function DeleteVehicleSheet() {
  const { vehicles, bundles } = useGarage();
  const v = useActiveVehicle(vehicles);
  const del = useDeleteVehicle();
  const navigate = useNavigate();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  if (!v) return null;
  const b = bundles.get(v.id);

  return (
    <Sheet
      title="Remove this vehicle?"
      footer={
        <Button
          variant="danger"
          block
          busy={del.isPending}
          onClick={async () => {
            try {
              await del.mutateAsync(v.id);
              toast(`${v.model} removed.`);
              navigate('/', { replace: true });
            } catch (e) {
              setError(friendlyError(e));
            }
          }}
        >
          Remove {v.model} and its records
        </Button>
      }
    >
      <p className="t-body">
        This removes {v.make} {v.model} along with its {b?.documents.length ?? 0} document{b?.documents.length === 1 ? '' : 's'}, {b?.services.length ?? 0} service record
        {b?.services.length === 1 ? '' : 's'}, issues and odometer readings. It cannot be undone.
      </p>
      {error && <Notice tone="error">{error}</Notice>}
    </Sheet>
  );
}
