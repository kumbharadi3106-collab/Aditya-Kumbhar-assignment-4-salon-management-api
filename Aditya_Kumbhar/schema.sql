-- ============================================
-- Salon Management API - Supabase Schema
-- Run this in the Supabase SQL Editor
-- (Project → SQL Editor → New Query → paste → Run)
-- ============================================

-- Enable UUID generation (usually already enabled on Supabase)
create extension if not exists "pgcrypto";

-- ---------- Users ----------
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  email text not null unique,
  password text not null, -- bcrypt-hashed, never store plain text
  created_at timestamp with time zone default now()
);

-- ---------- Salons ----------
create table if not exists salons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  address text not null,
  rating numeric default 0 check (rating >= 0 and rating <= 5),
  created_at timestamp with time zone default now()
);

-- ---------- Services ----------
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  "salonId" uuid not null references salons(id) on delete cascade,
  "serviceName" text not null,
  price numeric not null check (price >= 0),
  duration text not null,
  "isAvailable" boolean default true,
  created_at timestamp with time zone default now()
);

-- Helpful indexes
create index if not exists idx_services_salon_id on services("salonId");
create index if not exists idx_salons_city on salons(city);
create index if not exists idx_salons_rating on salons(rating desc);
