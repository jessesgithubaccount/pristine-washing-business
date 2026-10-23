-- Pristine Laundry Admin: Supabase schema
-- Run this script in Supabase Dashboard -> SQL Editor -> New query.
-- All records are accessible only to signed-in Supabase Auth users.

create extension if not exists pgcrypto;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  normalized_phone text not null unique,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references public.customers(id) on delete restrict,
  service text not null,
  received_date date not null default current_date,
  due_date date not null,
  status text not null default 'Received'
    check (status in ('Received', 'Washing', 'Ready for pickup', 'Delivered')),
  amount numeric(12,2) not null default 0 check (amount >= 0),
  payment_status text not null default 'Unpaid'
    check (payment_status in ('Paid', 'Unpaid', 'Partial')),
  paid_amount numeric(12,2) not null default 0 check (paid_amount >= 0 and paid_amount <= amount),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  detail text,
  icon text not null default '✓',
  created_at timestamptz not null default now()
);

create index if not exists orders_customer_id_idx on public.orders(customer_id);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists activity_logs_created_at_idx on public.activity_logs(created_at desc);

-- Protect every table exposed through the browser Data API.
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.activity_logs enable row level security;

-- Do not allow signed-out visitors to read or mutate laundry records.
revoke all on table public.customers from anon, authenticated;
revoke all on table public.orders from anon, authenticated;
revoke all on table public.activity_logs from anon, authenticated;
grant select, insert, update, delete on table public.customers to authenticated;
grant select, insert, update, delete on table public.orders to authenticated;
grant select, insert, update, delete on table public.activity_logs to authenticated;
grant usage on schema public to authenticated;

-- Re-runnable policies: any user you create in Supabase Auth is treated as staff.
drop policy if exists "Authenticated staff manage customers" on public.customers;
create policy "Authenticated staff manage customers"
  on public.customers for all to authenticated
  using (true) with check (true);

drop policy if exists "Authenticated staff manage orders" on public.orders;
create policy "Authenticated staff manage orders"
  on public.orders for all to authenticated
  using (true) with check (true);

drop policy if exists "Authenticated staff manage activity" on public.activity_logs;
create policy "Authenticated staff manage activity"
  on public.activity_logs for all to authenticated
  using (true) with check (true);

-- Note: public sign-ups should be disabled in Supabase Auth settings.
-- Create/invite staff accounts from Supabase Dashboard -> Authentication -> Users.
