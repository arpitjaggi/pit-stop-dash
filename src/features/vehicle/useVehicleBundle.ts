import { useOutletContext } from 'react-router-dom';
import type { VehicleBundle } from '@/data/types';

/** The current vehicle's records, handed down by the vehicle layout. */
export const useVehicleBundle = () => useOutletContext<{ bundle: VehicleBundle }>().bundle;
