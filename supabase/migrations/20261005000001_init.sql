-- Pit Stop Dash: initial schema.
--
-- Ownership model: every row carries user_id (defaults to the signed-in user) and every
-- child row points at its vehicle through a composite foreign key (vehicle_id, user_id),
-- so a row can never reference another user's vehicle. Row-level security restricts every
-- table to its owner. The "User" entity is Supabase's auth.users.

-- ---------------------------------------------------------------- enums

create type public.vehicle_type as enum
  ('car', 'suv', 'motorcycle', 'scooter', 'other_two_wheeler', 'other');

create type public.fuel_type as enum
  ('petrol', 'diesel', 'cng', 'petrol_cng', 'electric', 'hybrid', 'other');

create type public.document_type as enum
  ('rc', 'insurance', 'puc', 'warranty', 'extended_warranty', 'accessory_warranty',
   'cng_certificate', 'other');

create type public.issue_status as enum ('open', 'resolved');

-- ---------------------------------------------------------------- helpers

create function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- vehicles

create table public.vehicles (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null default auth.uid() references auth.users (id) on delete cascade,

  vehicle_type            public.vehicle_type not null,
  make                    text not null check (length(btrim(make)) > 0),
  model                   text not null check (length(btrim(model)) > 0),
  variant                 text,
  -- Normalised: upper case, letters and digits only (e.g. KA01AB1234, 22BH1234AA).
  -- Null while a new purchase awaits registration.
  registration_number     text check (registration_number ~ '^[A-Z0-9]{4,12}$'),
  registration_date       date,
  purchase_date           date,
  fuel_type               public.fuel_type not null default 'petrol',
  colour_name             text,
  colour_hex              text check (colour_hex ~ '^#[0-9A-Fa-f]{6}$'),
  notes                   text,

  -- Optional, type-specific facts. Kept as real columns so they stay queryable.
  engine_cc               integer check (engine_cc > 0),
  transmission            text,
  battery_kwh             numeric(6, 2) check (battery_kwh > 0),
  cng_kit_info            text,
  wheels                  smallint check (wheels between 1 and 18),

  -- Vehicle photo, stored in the private "photos" bucket.
  photo_path              text,
  photo_thumb_path        text,

  -- Service intervals are per vehicle. Either, or both ("whichever comes first").
  service_interval_km     integer check (service_interval_km > 0),
  service_interval_months integer check (service_interval_months > 0),

  -- Maintained by a trigger from odometer_readings. Not writable by clients.
  current_odometer_km     integer check (current_odometer_km >= 0),
  odometer_read_on        date,

  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  unique (id, user_id)
);

create unique index vehicles_user_registration_key
  on public.vehicles (user_id, registration_number)
  where registration_number is not null;

create trigger vehicles_set_updated_at
  before update on public.vehicles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- odometer readings

create table public.odometer_readings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid(),
  vehicle_id  uuid not null,
  read_on     date not null default current_date,
  reading_km  integer not null check (reading_km >= 0),
  note        text,
  source      text not null default 'manual' check (source in ('manual', 'vehicle_added', 'service')),
  created_at  timestamptz not null default now(),
  foreign key (vehicle_id, user_id) references public.vehicles (id, user_id) on delete cascade
);

create index odometer_readings_vehicle_idx
  on public.odometer_readings (vehicle_id, read_on desc, reading_km desc);

-- The latest reading becomes the vehicle's current odometer.
create function public.refresh_vehicle_odometer() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  v_id := coalesce(new.vehicle_id, old.vehicle_id);

  update public.vehicles v
     set current_odometer_km = r.reading_km,
         odometer_read_on = r.read_on
    from (select reading_km, read_on
            from public.odometer_readings
           where vehicle_id = v_id
           order by read_on desc, reading_km desc, created_at desc
           limit 1) r
   where v.id = v_id;

  if not found then
    -- No readings left: clear the cached values.
    update public.vehicles
       set current_odometer_km = null, odometer_read_on = null
     where id = v_id;
  end if;

  return null;
end;
$$;

create trigger odometer_readings_refresh
  after insert or update or delete on public.odometer_readings
  for each row execute function public.refresh_vehicle_odometer();

-- ---------------------------------------------------------------- service records

create table public.service_records (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid(),
  vehicle_id      uuid not null,
  serviced_on     date not null,
  workshop        text,
  odometer_km     integer check (odometer_km >= 0),
  service_type    text not null default 'Regular service' check (length(btrim(service_type)) > 0),
  work_performed  text,
  cost_inr        numeric(10, 2) check (cost_inr >= 0),
  problems_found  text,
  -- "Problems to address next time": one item per line.
  carry_forward   text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (id, user_id),
  foreign key (vehicle_id, user_id) references public.vehicles (id, user_id) on delete cascade
);

create index service_records_vehicle_idx
  on public.service_records (vehicle_id, serviced_on desc);

create trigger service_records_set_updated_at
  before update on public.service_records
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- issues

create table public.issues (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null default auth.uid(),
  vehicle_id             uuid not null,
  description            text not null check (length(btrim(description)) > 0),
  note                   text,
  status                 public.issue_status not null default 'open',
  added_on               date not null default current_date,
  resolved_on            date,
  resolved_in_service_id uuid,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  check (status = 'resolved' or (resolved_on is null and resolved_in_service_id is null)),
  foreign key (vehicle_id, user_id) references public.vehicles (id, user_id) on delete cascade,
  foreign key (resolved_in_service_id, user_id) references public.service_records (id, user_id)
    on delete set null (resolved_in_service_id)
);

create index issues_vehicle_idx on public.issues (vehicle_id, status, added_on desc);

create trigger issues_set_updated_at
  before update on public.issues
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- documents (Glovebox)

create table public.documents (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid(),
  vehicle_id        uuid not null,
  doc_type          public.document_type not null,
  -- Names the document when the type alone is not enough (an accessory warranty, "other").
  title             text,
  issuer            text,
  reference_number  text,
  issued_on         date,
  -- Null means the document does not expire (for example an RC with no stated validity).
  expires_on        date,
  notes             text,

  -- The file itself lives in the private "documents" bucket; never on a local disk.
  file_path         text not null,
  thumb_path        text,
  file_name         text not null,
  mime_type         text not null,
  size_bytes        bigint not null check (size_bytes >= 0),

  -- Names of the fields filled in from the document itself (future OCR / extraction).
  -- Any field not listed here was entered by the owner.
  extracted_fields  text[] not null default '{}',

  created_at        timestamptz not null default now(),  -- the upload date
  updated_at        timestamptz not null default now(),
  check (issued_on is null or expires_on is null or expires_on >= issued_on),
  foreign key (vehicle_id, user_id) references public.vehicles (id, user_id) on delete cascade
);

create index documents_vehicle_idx on public.documents (vehicle_id, doc_type, expires_on desc);

create trigger documents_set_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- row-level security

alter table public.vehicles          enable row level security;
alter table public.odometer_readings enable row level security;
alter table public.service_records   enable row level security;
alter table public.issues            enable row level security;
alter table public.documents         enable row level security;

create policy vehicles_owner on public.vehicles
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy odometer_readings_owner on public.odometer_readings
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy service_records_owner on public.service_records
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy issues_owner on public.issues
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy documents_owner on public.documents
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------- privileges

-- Signed-out visitors get nothing. Signed-in users get table access (filtered by RLS above)
-- except the odometer cache on vehicles, which only the trigger may write.
revoke all on public.vehicles, public.odometer_readings, public.service_records,
              public.issues, public.documents from anon;

revoke insert, update on public.vehicles from authenticated;
grant select, delete on public.vehicles to authenticated;
grant insert (id, user_id, vehicle_type, make, model, variant, registration_number, registration_date,
              purchase_date, fuel_type, colour_name, colour_hex, notes, engine_cc, transmission,
              battery_kwh, cng_kit_info, wheels, photo_path, photo_thumb_path,
              service_interval_km, service_interval_months)
  on public.vehicles to authenticated;
grant update (vehicle_type, make, model, variant, registration_number, registration_date,
              purchase_date, fuel_type, colour_name, colour_hex, notes, engine_cc, transmission,
              battery_kwh, cng_kit_info, wheels, photo_path, photo_thumb_path,
              service_interval_km, service_interval_months)
  on public.vehicles to authenticated;

grant select, insert, update, delete on public.odometer_readings, public.service_records,
                                         public.issues, public.documents to authenticated;
