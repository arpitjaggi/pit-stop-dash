// The data layer's contract. Two implementations exist: Supabase (the real thing) and an
// in-browser demo adapter for trying the app without a backend. Screens only know this interface.

import { createContext, useContext } from 'react';
import type { DocType, Issue, NewVehicle, Reading, ReadingSource, ServiceRecord, VDocument, Vehicle, VehiclePatch } from './types';

export type Bucket = 'photos' | 'documents';

/** An image already resized for upload: a display size and a small thumbnail. */
export interface PreparedImage {
  full: Blob;
  thumb: Blob;
  ext: 'webp' | 'jpg';
}

export interface NewReading {
  vehicle_id: string;
  read_on: string;
  reading_km: number;
  note?: string | null;
  source?: ReadingSource;
}

export interface NewIssue {
  vehicle_id: string;
  description: string;
  note?: string | null;
  added_on?: string;
}

export type IssuePatch = Partial<Pick<Issue, 'description' | 'note' | 'status' | 'added_on' | 'resolved_on' | 'resolved_in_service_id'>>;

export type NewServiceRecord = Omit<ServiceRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type ServicePatch = Partial<Omit<NewServiceRecord, 'vehicle_id'>>;

export interface NewDocument {
  vehicle_id: string;
  doc_type: DocType;
  title?: string | null;
  issuer?: string | null;
  reference_number?: string | null;
  issued_on?: string | null;
  expires_on?: string | null;
  notes?: string | null;
  /** The file to store: a PDF as picked, or an already-resized image. */
  file: Blob;
  file_name: string;
  mime_type: string;
  /** Small preview for image documents (PDFs have none). */
  thumb?: Blob | null;
  /** Fields that came from the document itself rather than the owner (reserved for extraction). */
  extracted_fields?: string[];
}

export type DocumentPatch = Partial<
  Pick<VDocument, 'doc_type' | 'title' | 'issuer' | 'reference_number' | 'issued_on' | 'expires_on' | 'notes' | 'extracted_fields'>
>;

export interface Api {
  mode: 'supabase' | 'demo';

  listVehicles(): Promise<Vehicle[]>;
  createVehicle(input: Omit<NewVehicle, 'odometer_km'>, photo?: PreparedImage | null): Promise<Vehicle>;
  updateVehicle(id: string, patch: VehiclePatch, photo?: PreparedImage | 'remove' | null): Promise<Vehicle>;
  deleteVehicle(id: string): Promise<void>;

  listReadings(vehicleId: string): Promise<Reading[]>;
  addReading(input: NewReading): Promise<Reading>;
  deleteReading(id: string): Promise<void>;

  listIssues(): Promise<Issue[]>;
  addIssue(input: NewIssue): Promise<Issue>;
  updateIssue(id: string, patch: IssuePatch): Promise<Issue>;
  deleteIssue(id: string): Promise<void>;

  listServiceRecords(): Promise<ServiceRecord[]>;
  addServiceRecord(input: NewServiceRecord): Promise<ServiceRecord>;
  updateServiceRecord(id: string, patch: ServicePatch): Promise<ServiceRecord>;
  deleteServiceRecord(id: string): Promise<void>;

  listDocuments(): Promise<VDocument[]>;
  addDocument(input: NewDocument): Promise<VDocument>;
  updateDocument(id: string, patch: DocumentPatch): Promise<VDocument>;
  deleteDocument(id: string): Promise<void>;

  /** A short-lived URL for a stored file. */
  signedUrl(bucket: Bucket, path: string): Promise<string>;
}

export const ApiContext = createContext<Api | null>(null);

export function useApi(): Api {
  const api = useContext(ApiContext);
  if (!api) throw new Error('useApi outside ApiContext');
  return api;
}

export const newId = () => crypto.randomUUID();
export const clean = (s: string | null | undefined): string | null => {
  const t = s?.trim();
  return t ? t : null;
};
