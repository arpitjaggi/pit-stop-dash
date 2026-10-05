// Demo adapter: the same Api contract, kept in this browser's IndexedDB. It exists so the app can
// be tried without a backend. It is never used for a real account: the app only enters demo mode
// when Supabase is not configured or the visitor explicitly chooses it, and says so on screen.

import {
  type Api,
  type DocumentPatch,
  type IssuePatch,
  type NewDocument,
  type NewIssue,
  type NewReading,
  type NewServiceRecord,
  type PreparedImage,
  type ServicePatch,
  clean,
  newId,
} from './api';
import { buildSeed } from './demoSeed';
import type { Issue, NewVehicle, Reading, ServiceRecord, VDocument, Vehicle, VehiclePatch } from './types';

const DB_NAME = 'pitstop-demo';
const STORE = 'kv';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idb<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

interface Tables {
  vehicles: Vehicle[];
  readings: Reading[];
  issues: Issue[];
  services: ServiceRecord[];
  documents: VDocument[];
}

const DEMO_USER = 'demo-user';
const now = () => new Date().toISOString();
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export async function resetDemo() {
  const db = await open();
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

export async function createDemoApi(): Promise<Api> {
  let tables = await idb<Tables | undefined>('readonly', (s) => s.get('tables'));
  if (!tables) {
    const seed = await buildSeed();
    tables = seed.tables;
    for (const [path, blob] of Object.entries(seed.blobs)) await idb('readwrite', (s) => s.put(blob, `blob:${path}`));
    await idb('readwrite', (s) => s.put(tables, 'tables'));
  }
  const t: Tables = tables;
  const persist = () => idb('readwrite', (s) => s.put(t, 'tables')).then(() => undefined);
  const urls = new Map<string, string>();

  // Mirrors the database trigger: the latest reading becomes the vehicle's current odometer.
  function refreshOdometer(vehicleId: string) {
    const v = t.vehicles.find((x) => x.id === vehicleId);
    if (!v) return;
    const rs = t.readings
      .filter((r) => r.vehicle_id === vehicleId)
      .sort((a, b) => (a.read_on !== b.read_on ? (a.read_on < b.read_on ? 1 : -1) : b.reading_km - a.reading_km));
    v.current_odometer_km = rs[0]?.reading_km ?? null;
    v.odometer_read_on = rs[0]?.read_on ?? null;
  }

  async function putPhoto(vehicleId: string, photo: PreparedImage) {
    const base = `${DEMO_USER}/${vehicleId}/photo-${Date.now().toString(36)}`;
    const photo_path = `${base}.${photo.ext}`;
    const photo_thumb_path = `${base}-thumb.${photo.ext}`;
    await idb('readwrite', (s) => s.put(photo.full, `blob:${photo_path}`));
    await idb('readwrite', (s) => s.put(photo.thumb, `blob:${photo_thumb_path}`));
    return { photo_path, photo_thumb_path };
  }
  const dropBlobs = (paths: (string | null | undefined)[]) =>
    Promise.all(paths.filter(Boolean).map((p) => idb('readwrite', (s) => s.delete(`blob:${p}`))));

  return {
    mode: 'demo',

    async listVehicles() {
      return structuredClone(t.vehicles);
    },
    async createVehicle(input: Omit<NewVehicle, 'odometer_km'>, photo) {
      const id = newId();
      const files = photo ? await putPhoto(id, photo) : { photo_path: null, photo_thumb_path: null };
      const v: Vehicle = {
        id, user_id: DEMO_USER, variant: null, registration_number: null, registration_date: null, purchase_date: null,
        colour_name: null, colour_hex: null, notes: null, engine_cc: null, transmission: null, battery_kwh: null,
        cng_kit_info: null, wheels: null, service_interval_km: null, service_interval_months: null,
        current_odometer_km: null, odometer_read_on: null, created_at: now(), updated_at: now(),
        ...input, ...files,
      };
      if (v.registration_number && t.vehicles.some((x) => x.registration_number === v.registration_number)) {
        throw new Error('A vehicle with this registration number is already in your garage.');
      }
      t.vehicles.push(v);
      await persist();
      return structuredClone(v);
    },
    async updateVehicle(id, patch: VehiclePatch, photo) {
      const v = t.vehicles.find((x) => x.id === id);
      if (!v) throw new Error('Vehicle not found');
      if (patch.registration_number && t.vehicles.some((x) => x.id !== id && x.registration_number === patch.registration_number)) {
        throw new Error('A vehicle with this registration number is already in your garage.');
      }
      if (photo) {
        const old = [v.photo_path, v.photo_thumb_path];
        Object.assign(v, photo === 'remove' ? { photo_path: null, photo_thumb_path: null } : await putPhoto(id, photo));
        await dropBlobs(old);
      }
      Object.assign(v, patch, { updated_at: now() });
      await persist();
      return structuredClone(v);
    },
    async deleteVehicle(id) {
      const v = t.vehicles.find((x) => x.id === id);
      const docs = t.documents.filter((d) => d.vehicle_id === id);
      t.vehicles = t.vehicles.filter((x) => x.id !== id);
      t.readings = t.readings.filter((x) => x.vehicle_id !== id);
      t.issues = t.issues.filter((x) => x.vehicle_id !== id);
      t.services = t.services.filter((x) => x.vehicle_id !== id);
      t.documents = t.documents.filter((x) => x.vehicle_id !== id);
      Object.assign(tables!, t);
      await persist();
      await dropBlobs([v?.photo_path, v?.photo_thumb_path, ...docs.flatMap((d) => [d.file_path, d.thumb_path])]);
    },

    async listReadings(vehicleId) {
      return structuredClone(
        t.readings
          .filter((r) => r.vehicle_id === vehicleId)
          .sort((a, b) => (a.read_on !== b.read_on ? (a.read_on < b.read_on ? 1 : -1) : b.reading_km - a.reading_km)),
      );
    },
    async addReading(input: NewReading) {
      if (!t.vehicles.some((v) => v.id === input.vehicle_id)) throw new Error('Vehicle not found');
      const r: Reading = {
        id: newId(), user_id: DEMO_USER, vehicle_id: input.vehicle_id, read_on: input.read_on, reading_km: input.reading_km,
        note: clean(input.note), source: input.source ?? 'manual', created_at: now(),
      };
      t.readings.push(r);
      refreshOdometer(r.vehicle_id);
      await persist();
      return structuredClone(r);
    },
    async deleteReading(id) {
      const r = t.readings.find((x) => x.id === id);
      t.readings = t.readings.filter((x) => x.id !== id);
      if (r) refreshOdometer(r.vehicle_id);
      await persist();
    },

    async listIssues() {
      return structuredClone(t.issues);
    },
    async addIssue(input: NewIssue) {
      const i: Issue = {
        id: newId(), user_id: DEMO_USER, vehicle_id: input.vehicle_id, description: input.description.trim(), note: clean(input.note),
        status: 'open', added_on: input.added_on ?? today(), resolved_on: null, resolved_in_service_id: null, created_at: now(), updated_at: now(),
      };
      t.issues.push(i);
      await persist();
      return structuredClone(i);
    },
    async updateIssue(id, patch: IssuePatch) {
      const i = t.issues.find((x) => x.id === id);
      if (!i) throw new Error('Issue not found');
      Object.assign(i, patch, { updated_at: now() });
      if (i.status === 'open') {
        i.resolved_on = null;
        i.resolved_in_service_id = null;
      }
      await persist();
      return structuredClone(i);
    },
    async deleteIssue(id) {
      t.issues = t.issues.filter((x) => x.id !== id);
      Object.assign(tables!, t);
      await persist();
    },

    async listServiceRecords() {
      return structuredClone([...t.services].sort((a, b) => (a.serviced_on < b.serviced_on ? 1 : -1)));
    },
    async addServiceRecord(input: NewServiceRecord) {
      const s: ServiceRecord = { ...input, id: newId(), user_id: DEMO_USER, created_at: now(), updated_at: now() };
      t.services.push(s);
      await persist();
      return structuredClone(s);
    },
    async updateServiceRecord(id, patch: ServicePatch) {
      const s = t.services.find((x) => x.id === id);
      if (!s) throw new Error('Service record not found');
      Object.assign(s, patch, { updated_at: now() });
      await persist();
      return structuredClone(s);
    },
    async deleteServiceRecord(id) {
      t.services = t.services.filter((x) => x.id !== id);
      t.issues.forEach((i) => {
        if (i.resolved_in_service_id === id) i.resolved_in_service_id = null;
      });
      await persist();
    },

    async listDocuments() {
      return structuredClone([...t.documents].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)));
    },
    async addDocument(input: NewDocument) {
      const { file, thumb, ...meta } = input;
      const base = `${DEMO_USER}/${input.vehicle_id}/${Date.now().toString(36)}`;
      const file_path = `${base}-${input.file_name}`;
      const thumb_path = thumb ? `${base}-thumb` : null;
      await idb('readwrite', (s) => s.put(file, `blob:${file_path}`));
      if (thumb && thumb_path) await idb('readwrite', (s) => s.put(thumb, `blob:${thumb_path}`));
      const d: VDocument = {
        id: newId(), user_id: DEMO_USER, vehicle_id: meta.vehicle_id, doc_type: meta.doc_type, title: clean(meta.title),
        issuer: clean(meta.issuer), reference_number: clean(meta.reference_number), issued_on: meta.issued_on ?? null,
        expires_on: meta.expires_on ?? null, notes: clean(meta.notes), file_path, thumb_path, file_name: meta.file_name,
        mime_type: meta.mime_type, size_bytes: file.size, extracted_fields: meta.extracted_fields ?? [], created_at: now(), updated_at: now(),
      };
      t.documents.push(d);
      await persist();
      return structuredClone(d);
    },
    async updateDocument(id, patch: DocumentPatch) {
      const d = t.documents.find((x) => x.id === id);
      if (!d) throw new Error('Document not found');
      Object.assign(d, patch, { updated_at: now() });
      await persist();
      return structuredClone(d);
    },
    async deleteDocument(id) {
      const d = t.documents.find((x) => x.id === id);
      t.documents = t.documents.filter((x) => x.id !== id);
      await persist();
      if (d) await dropBlobs([d.file_path, d.thumb_path]);
    },

    async signedUrl(_bucket, path) {
      const cached = urls.get(path);
      if (cached) return cached;
      const blob = await idb<Blob | undefined>('readonly', (s) => s.get(`blob:${path}`));
      if (!blob) throw new Error('File not found');
      const url = URL.createObjectURL(blob);
      urls.set(path, url);
      return url;
    },
  };
}
