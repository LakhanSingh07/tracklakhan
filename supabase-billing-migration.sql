-- Migration: Create isolated read-only public.subscriptions table
-- Run this script in the Supabase SQL Editor to enable secure membership storage

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_premium boolean not null default false,
  selected_plan_id text default 'yearly',
  payment_methods jsonb not null default '[]'::jsonb,
  billing_history jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS)
alter table public.subscriptions enable row level security;

-- Create policy allowing users to read only their own subscription state
drop policy if exists "Users can read own subscription" on public.subscriptions;
create policy "Users can read own subscription"
on public.subscriptions for select
using (auth.uid() = user_id);

-- Note: We intentionally do NOT define INSERT, UPDATE, or DELETE policies for public users.
-- This ensures that only the backend server (using the Service Role Key) can manage subscriptions.
