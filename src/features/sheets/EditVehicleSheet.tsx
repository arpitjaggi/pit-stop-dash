import { useState } from 'react';
import { useGarage, useUpdateVehicle } from '@/data/hooks';
import { Button, friendlyError } from '@/ui/atoms';
import { useSheet, useToast } from '@/ui/hooks';
import { Sheet } from '@/ui/Sheet';
import { VehicleForm, type VehicleSubmit } from '../vehicle/VehicleForm';
import { useActiveVehicle } from './common';

export function EditVehicleSheet() {
  const { vehicles } = useGarage();
  const v = useActiveVehicle(vehicles);
  const sheet = useSheet();
  const toast = useToast();
  const update = useUpdateVehicle();
  const [error, setError] = useState<string | null>(null);
  if (!v) return null;

  async function onSubmit({ vehicle, photo }: VehicleSubmit) {
    const { odometer_km: _o, ...patch } = vehicle;
    setError(null);
    try {
      await update.mutateAsync({ id: v!.id, patch, photo });
      toast('Saved.');
      sheet.close();
    } catch (e) {
      setError(friendlyError(e));
    }
  }

  return (
    <Sheet
      title="Edit vehicle"
      tall
      footer={
        <>
          <Button variant="primary" block type="submit" form="edit-vehicle" busy={update.isPending}>
            Save changes
          </Button>
          <Button variant="ghost" block onClick={() => sheet.open('delete-vehicle', { v: v.id, replace: true })}>
            Remove this vehicle
          </Button>
        </>
      }
    >
      <VehicleForm formId="edit-vehicle" existing={v} submitLabel="Save changes" busy={update.isPending} onSubmit={onSubmit} serverError={error} />
    </Sheet>
  );
}
