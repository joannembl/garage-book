-- Database Schema for GarageBook
-- Phase 1 & Phase 2 Foundation Schema
-- Creation Date: 2026-06-18

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. TABLES CREATION
-- ==========================================

-- Profiles table (linked to auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  is_pro boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Vehicles table
create table public.vehicles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  year integer not null,
  make text not null,
  model text not null,
  trim text,
  body_style text,
  vin text,
  purchase_date date,
  purchase_price decimal,
  current_mileage integer,
  is_primary boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Maintenance Records table
create table public.maintenance_records (
  id uuid default gen_random_uuid() primary key,
  vehicle_id uuid references public.vehicles(id) on delete cascade not null,
  service_date date not null,
  mileage integer not null,
  service_type text not null, -- e.g., "Oil Change", "Brake Pad Replacement"
  description text,
  cost decimal default 0,
  shop_name text,
  receipt_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Modifications table
create table public.modifications (
  id uuid default gen_random_uuid() primary key,
  vehicle_id uuid references public.vehicles(id) on delete cascade not null,
  install_date date not null,
  part_name text not null,
  brand text,
  category text, -- e.g., "Engine", "Suspension", "Exterior"
  cost decimal default 0,
  notes text,
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Expenses table
create table public.expenses (
  id uuid default gen_random_uuid() primary key,
  vehicle_id uuid references public.vehicles(id) on delete cascade not null,
  expense_date date not null,
  category text not null, -- "Fuel", "Insurance", "Registration", "Other"
  amount decimal not null,
  description text,
  mileage integer, -- optional for fuel tracking
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Photos table
create table public.photos (
  id uuid default gen_random_uuid() primary key,
  vehicle_id uuid references public.vehicles(id) on delete cascade not null,
  related_type text not null, -- "vehicle", "maintenance", "modification", "expense"
  related_id uuid, -- id of the record it belongs to
  storage_path text not null,
  caption text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Imports table
create table public.imports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  file_name text not null,
  status text default 'pending', -- 'pending', 'processed', 'failed'
  record_type text not null, -- 'maintenance', 'modification', 'expense'
  mapping jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ==========================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.maintenance_records enable row level security;
alter table public.modifications enable row level security;
alter table public.expenses enable row level security;
alter table public.photos enable row level security;
alter table public.imports enable row level security;

-- ==========================================
-- 3. RLS POLICIES FOR USER-BASED ACCESS CONTROL
-- ==========================================

-- Profiles policies
create policy "Users can read own profiles" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can insert own profiles" 
  on public.profiles for insert 
  with check (auth.uid() = id);

create policy "Users can update own profiles" 
  on public.profiles for update 
  using (auth.uid() = id);

-- Vehicles policies
create policy "Users can read own vehicles" 
  on public.vehicles for select 
  using (auth.uid() = user_id);

create policy "Users can insert own vehicles" 
  on public.vehicles for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own vehicles" 
  on public.vehicles for update 
  using (auth.uid() = user_id);

create policy "Users can delete own vehicles" 
  on public.vehicles for delete 
  using (auth.uid() = user_id);

-- Maintenance Records policies
create policy "Users can read own maintenance records" 
  on public.maintenance_records for select 
  using (exists (
    select 1 from public.vehicles 
    where vehicles.id = vehicle_id and vehicles.user_id = auth.uid()
  ));

create policy "Users can insert own maintenance records" 
  on public.maintenance_records for insert 
  with check (exists (
    select 1 from public.vehicles 
    where vehicles.id = vehicle_id and vehicles.user_id = auth.uid()
  ));

create policy "Users can update own maintenance records" 
  on public.maintenance_records for update 
  using (exists (
    select 1 from public.vehicles 
    where vehicles.id = vehicle_id and vehicles.user_id = auth.uid()
  ));

create policy "Users can delete own maintenance records" 
  on public.maintenance_records for delete 
  using (exists (
    select 1 from public.vehicles 
    where vehicles.id = vehicle_id and vehicles.user_id = auth.uid()
  ));

-- Modifications policies
create policy "Users can read own modifications" 
  on public.modifications for select 
  using (exists (
    select 1 from public.vehicles 
    where vehicles.id = vehicle_id and vehicles.user_id = auth.uid()
  ));

create policy "Users can insert own modifications" 
  on public.modifications for insert 
  with check (exists (
    select 1 from public.vehicles 
    where vehicles.id = vehicle_id and vehicles.user_id = auth.uid()
  ));

create policy "Users can update own modifications" 
  on public.modifications for update 
  using (exists (
    select 1 from public.vehicles 
    where vehicles.id = vehicle_id and vehicles.user_id = auth.uid()
  ));

create policy "Users can delete own modifications" 
  on public.modifications for delete 
  using (exists (
    select 1 from public.vehicles 
    where vehicles.id = vehicle_id and vehicles.user_id = auth.uid()
  ));

-- Expenses policies
create policy "Users can read own expenses" 
  on public.expenses for select 
  using (exists (
    select 1 from public.vehicles 
    where vehicles.id = vehicle_id and vehicles.user_id = auth.uid()
  ));

create policy "Users can insert own expenses" 
  on public.expenses for insert 
  with check (exists (
    select 1 from public.vehicles 
    where vehicles.id = vehicle_id and vehicles.user_id = auth.uid()
  ));

create policy "Users can update own expenses" 
  on public.expenses for update 
  using (exists (
    select 1 from public.vehicles 
    where vehicles.id = vehicle_id and vehicles.user_id = auth.uid()
  ));

create policy "Users can delete own expenses" 
  on public.expenses for delete 
  using (exists (
    select 1 from public.vehicles 
    where vehicles.id = vehicle_id and vehicles.user_id = auth.uid()
  ));

-- Photos policies
create policy "Users can read own photos" 
  on public.photos for select 
  using (exists (
    select 1 from public.vehicles 
    where vehicles.id = vehicle_id and vehicles.user_id = auth.uid()
  ));

create policy "Users can insert own photos" 
  on public.photos for insert 
  with check (exists (
    select 1 from public.vehicles 
    where vehicles.id = vehicle_id and vehicles.user_id = auth.uid()
  ));

create policy "Users can update own photos" 
  on public.photos for update 
  using (exists (
    select 1 from public.vehicles 
    where vehicles.id = vehicle_id and vehicles.user_id = auth.uid()
  ));

create policy "Users can delete own photos" 
  on public.photos for delete 
  using (exists (
    select 1 from public.vehicles 
    where vehicles.id = vehicle_id and vehicles.user_id = auth.uid()
  ));

-- Imports policies
create policy "Users can read own imports" 
  on public.imports for select 
  using (auth.uid() = user_id);

create policy "Users can insert own imports" 
  on public.imports for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own imports" 
  on public.imports for update 
  using (auth.uid() = user_id);

create policy "Users can delete own imports" 
  on public.imports for delete 
  using (auth.uid() = user_id);


-- ==========================================
-- 4. PROFILE GENERATION FROM AUTH TRIGGER
-- ==========================================

-- Trigger to automatically create a profile entry when a new user signs up
create or replace function public.handle_new_user()
returns trigger
security definer set search_path = public
language plpgsql
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, is_pro)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    false
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ==========================================
-- 5. STORAGE BUCKET CREATION & ACCESS POLICIES
-- ==========================================

-- Create Supabase Storage buckets: 'vehicles' and 'records'
insert into storage.buckets (id, name, public)
values ('vehicles', 'vehicles', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('records', 'records', true)
on conflict (id) do nothing;

-- Storage policies for vehicles and records buckets
create policy "Public Read Access" on storage.objects for select
  using (bucket_id in ('vehicles', 'records'));

create policy "Authenticated User Upload Access" on storage.objects for insert
  with check (bucket_id in ('vehicles', 'records') and auth.role() = 'authenticated');

create policy "Authenticated User Update Access" on storage.objects for update
  using (bucket_id in ('vehicles', 'records') and auth.role() = 'authenticated');

create policy "Authenticated User Delete Access" on storage.objects for delete
  using (bucket_id in ('vehicles', 'records') and auth.role() = 'authenticated');
