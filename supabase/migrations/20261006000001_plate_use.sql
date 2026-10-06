-- Safe to run more than once.
-- How a vehicle is used decides the colour of its HSRP plate: white (private), yellow
-- (commercial), black (self-drive rental). Electric vehicles are shown green whatever the use;
-- that comes from fuel_type, so nothing extra is stored for it.

do $$
begin
  create type public.plate_use as enum ('private', 'commercial', 'rental');
exception when duplicate_object then null;
end
$$;

alter table public.vehicles
  add column if not exists plate_use public.plate_use not null default 'private';

-- Column-level grants are additive, so these add to the lists set in the first migration.
grant insert (plate_use) on public.vehicles to authenticated;
grant update (plate_use) on public.vehicles to authenticated;
