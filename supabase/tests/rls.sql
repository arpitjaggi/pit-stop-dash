-- Assertions for schema, triggers and row-level security. Any failure raises and aborts.
\set ON_ERROR_STOP on
\set QUIET on
\o /dev/null

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@example.com'),
  ('00000000-0000-0000-0000-00000000000b', 'b@example.com');

create function pg_temp.assert(cond boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(cond, false) then raise exception 'FAILED: %', msg; end if; end $$;
grant all on function pg_temp.assert(boolean, text) to public;

-- ---- as user A
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);

insert into public.vehicles (vehicle_type, make, model, registration_number, service_interval_km, service_interval_months)
values ('car', 'Maruti Suzuki', 'Swift', 'KA01AB1234', 10000, 12) returning id \gset a_car_
insert into public.vehicles (vehicle_type, make, model, registration_number, service_interval_km, service_interval_months)
values ('scooter', 'Honda', 'Activa', '22BH1234AA', 5000, 6) returning id \gset a_scooter_
-- Clients may choose the id (so a photo can be uploaded under it before the row exists).
insert into public.vehicles (id, vehicle_type, make, model) values ('11111111-1111-1111-1111-111111111111', 'other', 'Client', 'Chosen id');
delete from public.vehicles where id = '11111111-1111-1111-1111-111111111111';
select pg_temp.assert((select user_id from public.vehicles where id = :'a_car_id') = '00000000-0000-0000-0000-00000000000a', 'user_id defaults to auth.uid()');

-- Odometer cache is maintained by the trigger: latest date wins, then highest reading.
insert into public.odometer_readings (vehicle_id, read_on, reading_km) values (:'a_car_id', '2026-09-01', 45000);
insert into public.odometer_readings (vehicle_id, read_on, reading_km) values (:'a_car_id', '2026-09-14', 45210);
insert into public.odometer_readings (vehicle_id, read_on, reading_km) values (:'a_car_id', '2026-08-01', 44000);
select pg_temp.assert((select current_odometer_km from public.vehicles where id = :'a_car_id') = 45210, 'latest reading is current odometer');
select pg_temp.assert((select odometer_read_on from public.vehicles where id = :'a_car_id') = '2026-09-14', 'odometer_read_on follows latest reading');
delete from public.odometer_readings where vehicle_id = :'a_car_id' and reading_km = 45210;
select pg_temp.assert((select current_odometer_km from public.vehicles where id = :'a_car_id') = 45000, 'deleting latest reading falls back');
delete from public.odometer_readings where vehicle_id = :'a_car_id';
select pg_temp.assert((select current_odometer_km from public.vehicles where id = :'a_car_id') is null, 'no readings clears the cache');
insert into public.odometer_readings (vehicle_id, read_on, reading_km) values (:'a_car_id', '2026-09-14', 45210);

-- Clients cannot write the odometer cache directly.
do $$ begin
  begin
    update public.vehicles set current_odometer_km = 1;
    raise exception 'FAILED: cache column was writable';
  exception when insufficient_privilege then null; end;
end $$;

-- Service record, issue resolved by it, document.
insert into public.service_records (vehicle_id, serviced_on, workshop, odometer_km, work_performed, carry_forward)
values (:'a_car_id', '2026-08-12', 'Sai Auto Works', 38420, 'Oil and filter', E'Brake pads\nAC gas') returning id \gset a_svc_
insert into public.issues (vehicle_id, description) values (:'a_car_id', 'AC makes a rattling noise') returning id \gset a_issue_
update public.issues set status = 'resolved', resolved_on = '2026-08-12', resolved_in_service_id = :'a_svc_id' where id = :'a_issue_id';
do $$ begin
  begin
    update public.issues set resolved_on = '2026-08-12' where status = 'resolved' and false;
    insert into public.issues (vehicle_id, description, status) values ((select id from public.vehicles limit 1), 'x', 'open');
    update public.issues set resolved_on = '2026-01-01' where description = 'x';
    raise exception 'FAILED: open issue accepted a resolved_on date';
  exception when check_violation then null; end;
end $$;
delete from public.issues where description = 'x';
insert into public.documents (vehicle_id, doc_type, file_path, file_name, mime_type, size_bytes, expires_on, issued_on)
values (:'a_car_id', 'insurance', '00000000-0000-0000-0000-00000000000a/x/ins.pdf', 'ins.pdf', 'application/pdf', 1000, '2027-01-01', '2026-01-02');

-- Duplicate registration for the same user is rejected; two unregistered vehicles are fine.
do $$ begin
  begin
    insert into public.vehicles (vehicle_type, make, model, registration_number) values ('car', 'Tata', 'Nexon', 'KA01AB1234');
    raise exception 'FAILED: duplicate registration accepted';
  exception when unique_violation then null; end;
end $$;
insert into public.vehicles (vehicle_type, make, model) values ('car', 'Tata', 'Punch'), ('car', 'Tata', 'Nexon');

-- Bad registration format is rejected.
do $$ begin
  begin
    insert into public.vehicles (vehicle_type, make, model, registration_number) values ('car', 'X', 'Y', 'ka 01 ab');
    raise exception 'FAILED: malformed registration accepted';
  exception when check_violation then null; end;
end $$;

-- ---- as user B: sees nothing of A's, cannot attach rows to A's vehicle, cannot reuse a registration.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000b', false);
select pg_temp.assert((select count(*) from public.vehicles) = 0, 'B sees no vehicles of A');
select pg_temp.assert((select count(*) from public.documents) = 0, 'B sees no documents of A');
select pg_temp.assert((select count(*) from public.issues) = 0, 'B sees no issues of A');
select pg_temp.assert((select count(*) from public.service_records) = 0, 'B sees no service records of A');
select pg_temp.assert((select count(*) from public.odometer_readings) = 0, 'B sees no readings of A');
do $$ declare v uuid; begin
  select id into v from (select '00000000-0000-0000-0000-000000000000'::uuid id) s;
  begin
    insert into public.issues (vehicle_id, description) values (v, 'sneaky');
    raise exception 'FAILED: B attached an issue to a foreign vehicle';
  exception when foreign_key_violation then null; end;
end $$;
do $$ begin
  begin
    insert into public.issues (user_id, vehicle_id, description)
    values ('00000000-0000-0000-0000-00000000000a', (select id from public.vehicles limit 1), 'spoof');
    raise exception 'FAILED: B inserted a row as A';
  exception when others then
    if sqlerrm like 'FAILED%' then raise; end if;
  end;
end $$;
update public.vehicles set make = 'hijacked';
reset role;
select pg_temp.assert((select count(*) from public.vehicles where make = 'hijacked') = 0, 'B cannot update A rows');
set role authenticated;
select pg_temp.assert((select count(*) from public.vehicles) = 0, 'B still sees nothing');
-- B may register the same number independently (unique per user).
insert into public.vehicles (vehicle_type, make, model, registration_number) values ('car', 'Hyundai', 'i20', 'KA01AB1234');
delete from public.vehicles;
reset role;
select pg_temp.assert((select count(*) from public.vehicles) = 4, 'B delete removed only B rows');

-- ---- signed-out access is refused outright
set role anon;
do $$ begin
  begin
    perform count(*) from public.vehicles;
    raise exception 'FAILED: anon could read vehicles';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- ---- cascade: deleting a vehicle removes its children
delete from public.vehicles where id = :'a_car_id';
select pg_temp.assert((select count(*) from public.documents) = 0, 'documents cascade');
select pg_temp.assert((select count(*) from public.issues) = 0, 'issues cascade');
select pg_temp.assert((select count(*) from public.service_records) = 0, 'service records cascade');
select pg_temp.assert((select count(*) from public.odometer_readings) = 0, 'readings cascade');

-- ---- storage: owner folder isolation
insert into storage.objects (bucket_id, name) values
  ('documents', '00000000-0000-0000-0000-00000000000a/v/a.pdf'),
  ('documents', '00000000-0000-0000-0000-00000000000b/v/b.pdf');
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);
select pg_temp.assert((select count(*) from storage.objects) = 1, 'A sees only A files');
select pg_temp.assert((select name from storage.objects) like '%000a/%', 'A sees A file');
do $$ begin
  begin
    insert into storage.objects (bucket_id, name) values ('documents', '00000000-0000-0000-0000-00000000000b/v/evil.pdf');
    raise exception 'FAILED: A wrote into B folder';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select pg_temp.assert((select public from storage.buckets where id = 'documents') = false, 'documents bucket is private');
select pg_temp.assert((select public from storage.buckets where id = 'photos') = false, 'photos bucket is private');

\o
\echo 'ALL SCHEMA, TRIGGER AND RLS CHECKS PASSED'
