import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddVehicle } from '@/data/hooks';
import { friendlyError } from '@/ui/atoms';
import { ArrowLeft } from '@/ui/icons';
import { rememberVehicle, useToast } from '@/ui/hooks';
import { VehicleForm, type VehicleSubmit } from '../vehicle/VehicleForm';

export function AddVehiclePage() {
  const navigate = useNavigate();
  const add = useAddVehicle();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit({ vehicle, photo }: VehicleSubmit) {
    setError(null);
    try {
      const v = await add.mutateAsync({ input: vehicle, photo: photo === 'remove' ? null : photo });
      rememberVehicle(v.id);
      toast(`${v.model} is in the garage.`);
      navigate(`/vehicles/${v.id}`, { replace: true });
    } catch (e) {
      setError(friendlyError(e));
    }
  }

  return (
    <div className="page page--form">
      <header className="formhead">
        <button type="button" className="icon-btn" aria-label="Back" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} aria-hidden />
        </button>
        <h1 className="t-section">Add a vehicle</h1>
      </header>
      <VehicleForm wizard formId="add-vehicle" submitLabel="Add to garage" busy={add.isPending} onSubmit={onSubmit} serverError={error} />
    </div>
  );
}
