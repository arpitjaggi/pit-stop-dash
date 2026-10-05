import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Shell } from '@/features/shell/Shell';
import { GaragePage } from '@/features/garage/GaragePage';
import { AddVehiclePage } from '@/features/garage/AddVehiclePage';
import { VehicleLayout } from '@/features/vehicle/VehicleLayout';
import { OverviewTab } from '@/features/vehicle/OverviewTab';
import { IssuesTab } from '@/features/vehicle/IssuesTab';
import { OdometerTab } from '@/features/vehicle/OdometerTab';
import { GloveboxTab } from '@/features/glovebox/GloveboxTab';
import { ServiceTab } from '@/features/service/ServiceTab';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<GaragePage />} />
          <Route path="vehicles/new" element={<AddVehiclePage />} />
          <Route path="vehicles/:vehicleId" element={<VehicleLayout />}>
            <Route index element={<OverviewTab />} />
            <Route path="glovebox" element={<GloveboxTab />} />
            <Route path="glovebox/:docId" element={<GloveboxTab />} />
            <Route path="service" element={<ServiceTab />} />
            <Route path="issues" element={<IssuesTab />} />
            <Route path="odometer" element={<OdometerTab />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
