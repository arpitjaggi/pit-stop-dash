import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddDocument, useAddVehicle } from '@/data/hooks';
import { prepareDocumentUpload } from '@/lib/image';
import { friendlyError } from '@/ui/atoms';
import { ArrowLeft } from '@/ui/icons';
import { rememberVehicle, useToast } from '@/ui/hooks';
import { VehicleForm, type VehicleSubmit } from '../vehicle/VehicleForm';

export function AddVehiclePage() {
  const navigate = useNavigate();
  const add = useAddVehicle();
  const addDoc = useAddDocument();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit({ vehicle, photo, rc }: VehicleSubmit) {
    setError(null);
    try {
      const v = await add.mutateAsync({ input: vehicle, photo: photo === 'remove' ? null : photo });
      rememberVehicle(v.id);
      let filed = false;
      if (rc) {
        try {
          const up = await prepareDocumentUpload(rc.file);
          await addDoc.mutateAsync({
            vehicle_id: v.id, doc_type: 'rc', issuer: rc.issuer, issued_on: rc.issued_on,
            file: up.blob, file_name: up.name, mime_type: up.mime, thumb: up.thumb, extracted_fields: rc.extracted_fields,
          });
          filed = true;
        } catch {
          toast(`${v.model} is in the garage, but the RC could not be filed. Add it from the Glovebox.`);
        }
      }
      if (!rc || filed) toast(filed ? `${v.model} is in the garage, with its RC in the Glovebox.` : `${v.model} is in the garage.`);
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
