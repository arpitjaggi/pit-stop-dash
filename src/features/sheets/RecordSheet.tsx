import { useGarage } from '@/data/hooks';
import { useSheet } from '@/ui/hooks';
import { Sheet } from '@/ui/Sheet';
import { RecordDetail } from '../service/RecordDetail';
import { useActiveVehicle } from './common';

export function RecordSheet() {
  const { vehicles, bundles } = useGarage();
  const v = useActiveVehicle(vehicles);
  const { id } = useSheet();
  const record = v ? bundles.get(v.id)?.services.find((s) => s.id === id) : undefined;
  if (!record) return null;
  return (
    <Sheet title="Service record" quietTitle tall>
      <RecordDetail record={record} />
    </Sheet>
  );
}
