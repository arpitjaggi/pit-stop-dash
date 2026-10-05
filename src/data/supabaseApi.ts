// The real backend: Supabase Postgres (row-level security isolates each user), Supabase Auth,
// and private Supabase Storage buckets. Dates stay plain ISO strings end to end.

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  type Api,
  type Bucket,
  type DocumentPatch,
  type IssuePatch,
  type NewDocument,
  type NewIssue,
  type NewReading,
  type NewServiceRecord,
  type PreparedImage,
  type ServicePatch,
  newId,
} from './api';
import type { Issue, NewVehicle, Reading, ServiceRecord, VDocument, Vehicle, VehiclePatch } from './types';

type Result<T> = { data: T | null; error: { message: string } | null };

function unwrap<T>(r: Result<T>): T {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

const mime = (ext: string) => (ext === 'webp' ? 'image/webp' : 'image/jpeg');
const safeName = (n: string) => n.replace(/[^\w.\-]+/g, '_').slice(-80) || 'file';

export function createSupabaseApi(sb: SupabaseClient): Api {
  async function userId(): Promise<string> {
    const { data, error } = await sb.auth.getSession();
    if (error || !data.session) throw new Error('Not signed in');
    return data.session.user.id;
  }

  async function upload(bucket: Bucket, path: string, body: Blob, contentType: string) {
    const { error } = await sb.storage.from(bucket).upload(path, body, { contentType, upsert: false, cacheControl: '31536000' });
    if (error) throw new Error(error.message);
  }

  async function remove(bucket: Bucket, paths: (string | null | undefined)[]) {
    const list = paths.filter((p): p is string => Boolean(p));
    if (list.length) await sb.storage.from(bucket).remove(list); // best effort; a stray file is harmless
  }

  async function uploadPhoto(uid: string, vehicleId: string, photo: PreparedImage) {
    const stamp = Date.now().toString(36);
    const base = `${uid}/${vehicleId}/photo-${stamp}`;
    const photo_path = `${base}.${photo.ext}`;
    const photo_thumb_path = `${base}-thumb.${photo.ext}`;
    await upload('photos', photo_path, photo.full, mime(photo.ext));
    await upload('photos', photo_thumb_path, photo.thumb, mime(photo.ext));
    return { photo_path, photo_thumb_path };
  }

  return {
    mode: 'supabase',

    // -------------------------------------------------------------- vehicles
    async listVehicles() {
      return unwrap(await sb.from('vehicles').select('*').order('created_at', { ascending: true })) as Vehicle[];
    },

    async createVehicle(input: Omit<NewVehicle, 'odometer_km'>, photo) {
      const uid = await userId();
      const id = newId();
      const files: { photo_path?: string; photo_thumb_path?: string } = photo ? await uploadPhoto(uid, id, photo) : {};
      try {
        return unwrap(await sb.from('vehicles').insert({ id, ...input, ...files }).select('*').single()) as Vehicle;
      } catch (e) {
        await remove('photos', [files.photo_path, files.photo_thumb_path]);
        throw e;
      }
    },

    async updateVehicle(id: string, patch: VehiclePatch, photo) {
      const uid = await userId();
      let files: Partial<VehiclePatch> = {};
      let old: Vehicle | null = null;
      if (photo) {
        old = unwrap(await sb.from('vehicles').select('photo_path, photo_thumb_path').eq('id', id).single()) as Vehicle;
        files = photo === 'remove' ? { photo_path: null, photo_thumb_path: null } : await uploadPhoto(uid, id, photo);
      }
      const row = unwrap(await sb.from('vehicles').update({ ...patch, ...files }).eq('id', id).select('*').single()) as Vehicle;
      if (old) await remove('photos', [old.photo_path, old.photo_thumb_path]);
      return row;
    },

    async deleteVehicle(id) {
      const docs = unwrap(await sb.from('documents').select('file_path, thumb_path').eq('vehicle_id', id)) as Pick<VDocument, 'file_path' | 'thumb_path'>[];
      const v = unwrap(await sb.from('vehicles').select('photo_path, photo_thumb_path').eq('id', id).maybeSingle()) as Vehicle | null;
      unwrap(await sb.from('vehicles').delete().eq('id', id));
      await remove('documents', docs.flatMap((d) => [d.file_path, d.thumb_path]));
      if (v) await remove('photos', [v.photo_path, v.photo_thumb_path]);
    },

    // -------------------------------------------------------------- readings
    async listReadings(vehicleId) {
      return unwrap(
        await sb.from('odometer_readings').select('*').eq('vehicle_id', vehicleId).order('read_on', { ascending: false }).order('reading_km', { ascending: false }),
      ) as Reading[];
    },
    async addReading(input: NewReading) {
      return unwrap(await sb.from('odometer_readings').insert(input).select('*').single()) as Reading;
    },
    async deleteReading(id) {
      unwrap(await sb.from('odometer_readings').delete().eq('id', id));
    },

    // -------------------------------------------------------------- issues
    async listIssues() {
      return unwrap(await sb.from('issues').select('*').order('added_on', { ascending: false })) as Issue[];
    },
    async addIssue(input: NewIssue) {
      return unwrap(await sb.from('issues').insert(input).select('*').single()) as Issue;
    },
    async updateIssue(id, patch: IssuePatch) {
      return unwrap(await sb.from('issues').update(patch).eq('id', id).select('*').single()) as Issue;
    },
    async deleteIssue(id) {
      unwrap(await sb.from('issues').delete().eq('id', id));
    },

    // -------------------------------------------------------------- service records
    async listServiceRecords() {
      return unwrap(await sb.from('service_records').select('*').order('serviced_on', { ascending: false })) as ServiceRecord[];
    },
    async addServiceRecord(input: NewServiceRecord) {
      return unwrap(await sb.from('service_records').insert(input).select('*').single()) as ServiceRecord;
    },
    async updateServiceRecord(id, patch: ServicePatch) {
      return unwrap(await sb.from('service_records').update(patch).eq('id', id).select('*').single()) as ServiceRecord;
    },
    async deleteServiceRecord(id) {
      unwrap(await sb.from('service_records').delete().eq('id', id));
    },

    // -------------------------------------------------------------- documents
    async listDocuments() {
      return unwrap(await sb.from('documents').select('*').order('created_at', { ascending: false })) as VDocument[];
    },
    async addDocument(input: NewDocument) {
      const uid = await userId();
      const { file, thumb, ...meta } = input;
      const stamp = Date.now().toString(36);
      const dir = `${uid}/${input.vehicle_id}`;
      const file_path = `${dir}/${stamp}-${safeName(input.file_name)}`;
      const thumb_path = thumb ? `${dir}/${stamp}-thumb.${thumb.type === 'image/webp' ? 'webp' : 'jpg'}` : null;
      await upload('documents', file_path, file, input.mime_type);
      if (thumb && thumb_path) await upload('documents', thumb_path, thumb, thumb.type || 'image/jpeg');
      try {
        return unwrap(
          await sb
            .from('documents')
            .insert({ ...meta, size_bytes: file.size, file_path, thumb_path })
            .select('*')
            .single(),
        ) as VDocument;
      } catch (e) {
        await remove('documents', [file_path, thumb_path]);
        throw e;
      }
    },
    async updateDocument(id, patch: DocumentPatch) {
      return unwrap(await sb.from('documents').update(patch).eq('id', id).select('*').single()) as VDocument;
    },
    async deleteDocument(id) {
      const d = unwrap(await sb.from('documents').select('file_path, thumb_path').eq('id', id).single()) as Pick<VDocument, 'file_path' | 'thumb_path'>;
      unwrap(await sb.from('documents').delete().eq('id', id));
      await remove('documents', [d.file_path, d.thumb_path]);
    },

    async signedUrl(bucket, path) {
      const { data, error } = await sb.storage.from(bucket).createSignedUrl(path, 3600);
      if (error || !data) throw new Error(error?.message ?? 'Could not open file');
      return data.signedUrl;
    },
  };
}
