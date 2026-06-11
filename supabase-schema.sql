create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  birthday date,
  weight numeric,
  weight_unit text not null default 'kg' check (weight_unit in ('kg', 'lbs')),
  height numeric,
  height_unit text not null default 'cm' check (height_unit in ('cm', 'ft')),
  period_length integer not null default 5,
  cycle_length integer not null default 28,
  last_period_date date,
  has_pcos boolean,
  steps_goal integer not null default 10000,
  water_goal integer not null default 3000,
  sleep_goal numeric not null default 8,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.health_logs (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  flow text check (flow in ('none', 'light', 'medium', 'heavy')),
  mood text,
  weight numeric,
  temperature numeric,
  water integer,
  notes text,
  symptoms text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

create table if not exists public.steps_logs (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  steps integer not null default 0,
  source text not null default 'manual' check (source in ('manual', 'health-connect')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

create table if not exists public.water_logs (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  amount integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

create table if not exists public.sleep_logs (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  duration numeric not null,
  quality text not null check (quality in ('poor', 'fair', 'good', 'excellent')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists health_logs_set_updated_at on public.health_logs;
create trigger health_logs_set_updated_at
before update on public.health_logs
for each row execute function public.set_updated_at();

drop trigger if exists steps_logs_set_updated_at on public.steps_logs;
create trigger steps_logs_set_updated_at
before update on public.steps_logs
for each row execute function public.set_updated_at();

drop trigger if exists water_logs_set_updated_at on public.water_logs;
create trigger water_logs_set_updated_at
before update on public.water_logs
for each row execute function public.set_updated_at();

drop trigger if exists sleep_logs_set_updated_at on public.sleep_logs;
create trigger sleep_logs_set_updated_at
before update on public.sleep_logs
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.health_logs enable row level security;
alter table public.steps_logs enable row level security;
alter table public.water_logs enable row level security;
alter table public.sleep_logs enable row level security;

drop policy if exists "Users can manage their own profile" on public.profiles;
create policy "Users can manage their own profile"
on public.profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can manage their own health logs" on public.health_logs;
create policy "Users can manage their own health logs"
on public.health_logs for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own steps logs" on public.steps_logs;
create policy "Users can manage their own steps logs"
on public.steps_logs for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own water logs" on public.water_logs;
create policy "Users can manage their own water logs"
on public.water_logs for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own sleep logs" on public.sleep_logs;
create policy "Users can manage their own sleep logs"
on public.sleep_logs for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
