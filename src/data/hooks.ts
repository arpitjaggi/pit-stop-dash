// React Query bindings over the Api. The garage loads four small lists once (vehicles, documents,
// issues, service records) and every screen derives what it needs from that shared cache, so
// switching between vehicles and tabs is instant. Mutations update the cache optimistically
// where that is safe.

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi, type Bucket, type DocumentPatch, type IssuePatch, type NewDocument, type NewReading, type NewServiceRecord, type PreparedImage, type ServicePatch } from './api';
import type { Issue, NewVehicle, Reading, VehicleBundle, VehiclePatch, Vehicle } from './types';
import { groupByVehicle } from '@/lib/status';
import { todayISO } from '@/lib/dates';

export const qk = {
  vehicles: ['vehicles'] as const,
  documents: ['documents'] as const,
  issues: ['issues'] as const,
  services: ['services'] as const,
  readings: (vehicleId: string) => ['readings', vehicleId] as const,
};

const STALE = 30_000;

export function useGarage() {
  const api = useApi();
  const vehicles = useQuery({ queryKey: qk.vehicles, queryFn: () => api.listVehicles(), staleTime: STALE });
  const documents = useQuery({ queryKey: qk.documents, queryFn: () => api.listDocuments(), staleTime: STALE });
  const issues = useQuery({ queryKey: qk.issues, queryFn: () => api.listIssues(), staleTime: STALE });
  const services = useQuery({ queryKey: qk.services, queryFn: () => api.listServiceRecords(), staleTime: STALE });

  const bundles = useMemo(
    () => groupByVehicle(vehicles.data ?? [], documents.data ?? [], issues.data ?? [], services.data ?? []),
    [vehicles.data, documents.data, issues.data, services.data],
  );
  const loading = vehicles.isPending || documents.isPending || issues.isPending || services.isPending;
  const error = vehicles.error ?? documents.error ?? issues.error ?? services.error ?? null;
  const refetch = () => Promise.all([vehicles.refetch(), documents.refetch(), issues.refetch(), services.refetch()]);
  return { vehicles: vehicles.data ?? [], bundles, loading, error: error as Error | null, refetch };
}

export function useBundle(vehicleId: string | undefined): { bundle: VehicleBundle | null; loading: boolean; error: Error | null } {
  const g = useGarage();
  return { bundle: (vehicleId && g.bundles.get(vehicleId)) || null, loading: g.loading, error: g.error };
}

export function useReadings(vehicleId: string) {
  const api = useApi();
  return useQuery({ queryKey: qk.readings(vehicleId), queryFn: () => api.listReadings(vehicleId), staleTime: STALE });
}

export function useSignedUrl(bucket: Bucket, path: string | null | undefined) {
  const api = useApi();
  return useQuery({
    queryKey: ['url', bucket, path],
    queryFn: () => api.signedUrl(bucket, path as string),
    enabled: Boolean(path),
    staleTime: 45 * 60_000,
    gcTime: 55 * 60_000,
    retry: 1,
  }).data;
}

// ------------------------------------------------------------------ mutations

export function useAddVehicle() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ input, photo }: { input: NewVehicle; photo?: PreparedImage | null }) => {
      const { odometer_km, ...rest } = input;
      const v = await api.createVehicle(rest, photo);
      if (odometer_km != null) {
        await api.addReading({ vehicle_id: v.id, read_on: todayISO(), reading_km: odometer_km, note: 'Entered when added', source: 'vehicle_added' });
      }
      return v;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.vehicles }),
  });
}

export function useUpdateVehicle() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch, photo }: { id: string; patch: VehiclePatch; photo?: PreparedImage | 'remove' | null }) => api.updateVehicle(id, patch, photo),
    onSuccess: (v) => qc.setQueryData<Vehicle[]>(qk.vehicles, (old) => old?.map((x) => (x.id === v.id ? v : x))),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.vehicles }),
  });
}

export function useDeleteVehicle() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteVehicle(id),
    onSettled: () => Promise.all([qk.vehicles, qk.documents, qk.issues, qk.services].map((k) => qc.invalidateQueries({ queryKey: k }))),
  });
}

export function useAddReading() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (r: NewReading) => api.addReading(r),
    onMutate: async (r) => {
      await qc.cancelQueries({ queryKey: qk.vehicles });
      const prevVehicles = qc.getQueryData<Vehicle[]>(qk.vehicles);
      const prevReadings = qc.getQueryData<Reading[]>(qk.readings(r.vehicle_id));
      // The database trigger makes the latest reading the current odometer; mirror it right away.
      qc.setQueryData<Vehicle[]>(qk.vehicles, (old) =>
        old?.map((v) =>
          v.id === r.vehicle_id && (!v.odometer_read_on || r.read_on >= v.odometer_read_on)
            ? { ...v, current_odometer_km: r.reading_km, odometer_read_on: r.read_on }
            : v,
        ),
      );
      return { prevVehicles, prevReadings };
    },
    onError: (_e, r, ctx) => {
      if (ctx?.prevVehicles) qc.setQueryData(qk.vehicles, ctx.prevVehicles);
      if (ctx) qc.setQueryData(qk.readings(r.vehicle_id), ctx.prevReadings);
    },
    onSettled: (_d, _e, r) => {
      qc.invalidateQueries({ queryKey: qk.vehicles });
      qc.invalidateQueries({ queryKey: qk.readings(r.vehicle_id) });
    },
  });
}

export function useDeleteReading() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; vehicleId: string }) => api.deleteReading(id),
    onSettled: (_d, _e, v) => {
      qc.invalidateQueries({ queryKey: qk.vehicles });
      qc.invalidateQueries({ queryKey: qk.readings(v.vehicleId) });
    },
  });
}

export function useAddIssue() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (i: { vehicle_id: string; description: string; note?: string | null; added_on?: string }) => api.addIssue(i),
    onMutate: async (i) => {
      await qc.cancelQueries({ queryKey: qk.issues });
      const prev = qc.getQueryData<Issue[]>(qk.issues);
      const temp: Issue = {
        id: `temp-${Date.now()}`, user_id: '', vehicle_id: i.vehicle_id, description: i.description.trim(), note: i.note ?? null, status: 'open',
        added_on: i.added_on ?? todayISO(), resolved_on: null, resolved_in_service_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      qc.setQueryData<Issue[]>(qk.issues, (old) => [temp, ...(old ?? [])]);
      return { prev };
    },
    onError: (_e, _i, ctx) => ctx && qc.setQueryData(qk.issues, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.issues }),
  });
}

export function useUpdateIssue() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: IssuePatch }) => api.updateIssue(id, patch),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: qk.issues });
      const prev = qc.getQueryData<Issue[]>(qk.issues);
      qc.setQueryData<Issue[]>(qk.issues, (old) => old?.map((i) => (i.id === id ? { ...i, ...patch } : i)));
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx && qc.setQueryData(qk.issues, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.issues }),
  });
}

export function useDeleteIssue() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteIssue(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: qk.issues });
      const prev = qc.getQueryData<Issue[]>(qk.issues);
      qc.setQueryData<Issue[]>(qk.issues, (old) => old?.filter((i) => i.id !== id));
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx && qc.setQueryData(qk.issues, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.issues }),
  });
}

export interface SaveServiceInput {
  record: NewServiceRecord;
  /** Open issues the workshop fixed during this visit. */
  resolveIssueIds: string[];
}

/**
 * Saves a service record and the things that follow from it, in order: the odometer reading it
 * implies, the issues it fixed, and the "address next time" lines, which become open issues so
 * there is a single list of things to tell the workshop.
 */
export function useSaveService() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ record, resolveIssueIds }: SaveServiceInput) => {
      const saved = await api.addServiceRecord(record);
      if (record.odometer_km != null) {
        await api.addReading({
          vehicle_id: record.vehicle_id, read_on: record.serviced_on, reading_km: record.odometer_km,
          note: record.workshop ? `Service at ${record.workshop}` : 'Service', source: 'service',
        });
      }
      await Promise.all(
        resolveIssueIds.map((id) => api.updateIssue(id, { status: 'resolved', resolved_on: record.serviced_on, resolved_in_service_id: saved.id })),
      );
      const lines = (record.carry_forward ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
      for (const description of lines) {
        await api.addIssue({ vehicle_id: record.vehicle_id, description, note: 'Raised at the service', added_on: record.serviced_on });
      }
      return saved;
    },
    onSettled: () =>
      Promise.all([qk.vehicles, qk.issues, qk.services].map((k) => qc.invalidateQueries({ queryKey: k }))).then(() =>
        qc.invalidateQueries({ queryKey: ['readings'] }),
      ),
  });
}

export function useUpdateService() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: ServicePatch }) => api.updateServiceRecord(id, patch),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.services }),
  });
}

export function useDeleteService() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteServiceRecord(id),
    onSettled: () => Promise.all([qk.services, qk.issues].map((k) => qc.invalidateQueries({ queryKey: k }))),
  });
}

export function useAddDocument() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: NewDocument) => api.addDocument(d),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.documents }),
  });
}

export function useUpdateDocument() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: DocumentPatch }) => api.updateDocument(id, patch),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.documents }),
  });
}

export function useDeleteDocument() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteDocument(id),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.documents }),
  });
}
