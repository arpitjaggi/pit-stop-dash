-- Safe to run more than once.
-- Private object storage for vehicle photos and documents.
-- Objects are namespaced by owner: "<user_id>/<vehicle_id>/<file>". Only the owner can read or
-- write inside their own folder. Files are served to the app through short-lived signed URLs.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('photos', 'photos', false, 8388608,
   array['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 15728640,
   array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "owner reads own files" on storage.objects;
create policy "owner reads own files" on storage.objects
  for select to authenticated
  using (bucket_id in ('photos', 'documents')
         and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "owner uploads own files" on storage.objects;
create policy "owner uploads own files" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('photos', 'documents')
              and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "owner updates own files" on storage.objects;
create policy "owner updates own files" on storage.objects
  for update to authenticated
  using (bucket_id in ('photos', 'documents')
         and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "owner deletes own files" on storage.objects;
create policy "owner deletes own files" on storage.objects
  for delete to authenticated
  using (bucket_id in ('photos', 'documents')
         and (storage.foldername(name))[1] = (select auth.uid())::text);
