import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseApi } from './supabaseApi';

// A recording stand-in for the Supabase client: checks what the adapter asks of the backend
// (tables, columns, storage layout, cleanup), not what Postgres does with it. Postgres itself is
// covered by supabase/tests (real triggers and row-level security).

type Op = [string, unknown[]];
function fake(opts: { insertError?: string } = {}) {
  const queries: { table: string; ops: Op[] }[] = [];
  const uploads: { bucket: string; path: string; type?: string }[] = [];
  const removed: { bucket: string; paths: string[] }[] = [];

  const from = (table: string) => {
    const q = { table, ops: [] as Op[] };
    queries.push(q);
    const proxy: unknown = new Proxy({}, {
      get: (_t, prop: string) => {
        if (prop === 'then') {
          const isInsert = q.ops.some(([n]) => n === 'insert');
          const result = isInsert && opts.insertError ? { data: null, error: { message: opts.insertError } } : { data: { id: 'row' }, error: null };
          return (res: (v: unknown) => unknown) => res(result);
        }
        return (...args: unknown[]) => {
          q.ops.push([prop, args]);
          return proxy;
        };
      },
    });
    return proxy;
  };

  const client = {
    auth: { getSession: async () => ({ data: { session: { user: { id: 'user-1' } } }, error: null }) },
    from,
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, _b: Blob, o?: { contentType?: string }) => (uploads.push({ bucket, path, type: o?.contentType }), { error: null }),
        remove: async (paths: string[]) => (removed.push({ bucket, paths }), { error: null }),
        createSignedUrl: async (path: string) => ({ data: { signedUrl: `https://signed.example/${bucket}/${path}` }, error: null }),
      }),
    },
  } as unknown as SupabaseClient;
  return { client, queries, uploads, removed };
}

const photo = { full: new Blob(['f'], { type: 'image/webp' }), thumb: new Blob(['t'], { type: 'image/webp' }), ext: 'webp' as const };

describe('Supabase adapter', () => {
  it('stores photos under the owner folder and records both paths on the new vehicle', async () => {
    const f = fake();
    await createSupabaseApi(f.client).createVehicle({ vehicle_type: 'car', make: 'Maruti Suzuki', model: 'Swift', fuel_type: 'petrol' }, photo);
    expect(f.uploads).toHaveLength(2);
    for (const u of f.uploads) expect(u.path).toMatch(/^user-1\/[0-9a-f-]{36}\/photo-.+\.webp$/);
    const insert = f.queries[0].ops.find(([n]) => n === 'insert')![1][0] as Record<string, unknown>;
    expect(f.queries[0].table).toBe('vehicles');
    expect(insert.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(insert.photo_path).toBe(f.uploads[0].path);
    expect(insert.photo_thumb_path).toBe(f.uploads[1].path);
    expect('user_id' in insert).toBe(false); // the database fills it from auth.uid()
  });

  it('removes freshly uploaded photos when the row cannot be saved', async () => {
    const f = fake({ insertError: 'duplicate key value violates unique constraint "vehicles_user_registration_key"' });
    await expect(createSupabaseApi(f.client).createVehicle({ vehicle_type: 'car', make: 'A', model: 'B', fuel_type: 'petrol' }, photo)).rejects.toThrow(/registration/);
    expect(f.removed[0].bucket).toBe('photos');
    expect(f.removed[0].paths).toHaveLength(2);
  });

  it('files a document in the documents bucket, then the row, and cleans up on failure', async () => {
    const f = fake();
    await createSupabaseApi(f.client).addDocument({
      vehicle_id: 'veh-1', doc_type: 'puc', file: new Blob(['x'], { type: 'application/pdf' }), file_name: 'PUC certificate (1).pdf', mime_type: 'application/pdf', expires_on: '2027-04-01',
    });
    expect(f.uploads[0].bucket).toBe('documents');
    expect(f.uploads[0].path).toMatch(/^user-1\/veh-1\/[a-z0-9]+-PUC_certificate_1_\.pdf$/);
    const row = f.queries[0].ops.find(([n]) => n === 'insert')![1][0] as Record<string, unknown>;
    expect(f.queries[0].table).toBe('documents');
    expect(row).toMatchObject({ vehicle_id: 'veh-1', doc_type: 'puc', expires_on: '2027-04-01', file_path: f.uploads[0].path, size_bytes: 1 });

    const bad = fake({ insertError: 'boom' });
    await expect(createSupabaseApi(bad.client).addDocument({ vehicle_id: 'v', doc_type: 'rc', file: new Blob(['x']), file_name: 'rc.pdf', mime_type: 'application/pdf' })).rejects.toThrow('boom');
    expect(bad.removed[0].paths[0]).toBe(bad.uploads[0].path);
  });

  it('asks for signed URLs rather than public ones', async () => {
    const f = fake();
    expect(await createSupabaseApi(f.client).signedUrl('documents', 'user-1/v/a.pdf')).toBe('https://signed.example/documents/user-1/v/a.pdf');
  });

  it('writes readings, issues and service records to their own tables', async () => {
    const f = fake();
    const api = createSupabaseApi(f.client);
    await api.addReading({ vehicle_id: 'v', read_on: '2026-10-05', reading_km: 1 });
    await api.addIssue({ vehicle_id: 'v', description: 'Rattle' });
    await api.addServiceRecord({ vehicle_id: 'v', serviced_on: '2026-10-05', workshop: null, odometer_km: null, service_type: 'Regular service', work_performed: null, cost_inr: null, problems_found: null, carry_forward: null, notes: null });
    expect(f.queries.map((q) => q.table)).toEqual(['odometer_readings', 'issues', 'service_records']);
  });
});
