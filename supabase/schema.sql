-- ============================================================
-- Chapai Mango — Supabase schema
-- Run this in Supabase SQL Editor (one-shot setup)
-- ============================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ---------- Products ----------
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  slug              text unique not null,
  variety           text not null,
  price_per_kg      numeric(10,2) not null check (price_per_kg >= 0),
  stock_kg          numeric(10,2) not null default 0 check (stock_kg >= 0),
  images            text[] not null default '{}',
  description       text not null default '',
  short_description text not null default '',
  is_featured       boolean not null default false,
  rating            numeric(2,1) not null default 5.0 check (rating between 0 and 5),
  origin            text not null default 'Chapainawabganj, Bangladesh',
  season            text not null default 'May - August',
  created_at        timestamptz not null default now()
);

create index if not exists idx_products_featured on public.products(is_featured);
create index if not exists idx_products_slug on public.products(slug);

-- ---------- Orders ----------
create table if not exists public.orders (
  id                    uuid primary key default gen_random_uuid(),
  customer_name         text not null,
  phone                 text not null,
  email                 text,
  address               text not null,
  district              text not null,
  items                 jsonb not null,
  subtotal              numeric(10,2) not null,
  delivery_fee          numeric(10,2) not null default 0,
  total                 numeric(10,2) not null,
  payment_method        text not null check (payment_method in ('cod','bkash','nagad','rocket')),
  payment_txn_id        text,
  payment_sender_number text,
  notes                 text,
  status                text not null default 'pending'
                        check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  created_at            timestamptz not null default now()
);

create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created on public.orders(created_at desc);

-- ---------- Testimonials ----------
create table if not exists public.testimonials (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  location   text,
  message    text not null,
  rating     int not null default 5 check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

-- ---------- Contact messages ----------
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text,
  phone      text,
  message    text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.products          enable row level security;
alter table public.orders            enable row level security;
alter table public.testimonials      enable row level security;
alter table public.contact_messages  enable row level security;

-- Public read for products + testimonials
drop policy if exists "products read" on public.products;
create policy "products read" on public.products
  for select using (true);

drop policy if exists "testimonials read" on public.testimonials;
create policy "testimonials read" on public.testimonials
  for select using (true);

-- Anyone can place an order / send a contact message (insert only)
drop policy if exists "orders insert" on public.orders;
create policy "orders insert" on public.orders
  for insert with check (true);

drop policy if exists "contact insert" on public.contact_messages;
create policy "contact insert" on public.contact_messages
  for insert with check (true);

-- ============================================================
-- Seed data
-- ============================================================
insert into public.products
  (name, slug, variety, price_per_kg, stock_kg, images, short_description, description, is_featured, rating)
values
  ('Premium Himsagar', 'himsagar', 'Himsagar',
   180, 500,
   array['https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=900'],
   'Bangla aam-er raja — mishti, rosalo, sugondhi.',
   'Chapainawabganj-er gachpaka Himsagar. Atish moshrin shansh, kom shoror sathe oshadharon mishti shoad. Ekbar khele bar bar mone porbe.',
   true, 4.9),
  ('Langra (Banarasi)', 'langra', 'Langra',
   200, 400,
   array['https://images.unsplash.com/photo-1553279768-865429fa0078?w=900'],
   'Sobuj-soneela rong, oshamanno mishti aam.',
   'Banarasi heritage variety — patla khosha, motkar moto motkar shansh. Chapai-er mati ar abhawate je Langra hoy ta dunia-bikhyato.',
   true, 4.8),
  ('Khirsapat (Khirshapati)', 'khirsapat', 'Khirsapat',
   220, 350,
   array['https://images.unsplash.com/photo-1605027990121-cbae9e0642df?w=900'],
   'GI tag pawa Chapai-er gourab.',
   'Geographical Indication (GI) registered Khirsapat — surokkhito heritage. Khub mishti, holud moromer shansh, fiber-mukto.',
   true, 5.0),
  ('Fazli', 'fazli',
   'Fazli', 150, 600,
   array['https://images.unsplash.com/photo-1596591868231-05e808fd5ec2?w=900'],
   'Boro size, late season — pickle ar kheer-er jonno best.',
   'Mostly 700g–1.2kg per piece. Late-season aam (July–August). Achar, jam, ar pakai khaowar jonno excellent.',
   false, 4.6),
  ('Amrapali', 'amrapali', 'Amrapali',
   170, 450,
   array['https://images.unsplash.com/photo-1631534179872-2b7a577b1ba2?w=900'],
   'Hybrid variety — choto, ghono mishti, fiber-less.',
   'Dashehari + Neelum-er hybrid. Khub mishti, fiber kom, lal-holud rong. Choto family-r jonno perfect.',
   false, 4.7),
  ('Gopalbhog', 'gopalbhog', 'Gopalbhog',
   160, 300,
   array['https://images.unsplash.com/photo-1605027990121-cbae9e0642df?w=900'],
   'Early season aam — May-er prothome paben.',
   'Season-er prothom aam. Chamra patla, sugondh kara, mishti-tok balance. Ramadan/Eid-er prio aam.',
   false, 4.5)
on conflict (slug) do nothing;

insert into public.testimonials (name, location, message, rating) values
  ('Rashed Khan', 'Dhaka', 'Eto fresh aam onek diner por pelam. Packaging ekdom safe, ekta o nosto hoyni. Insha Allah abar order korbo.', 5),
  ('Nusrat Jahan', 'Chittagong', 'Khirsapat-er shoad ekdom Chapai-er mato — joto din thakbo Chapai Mango theke i nibo.', 5),
  ('Tanvir Ahmed', 'Sylhet', 'Price reasonable, delivery fast. Family ke gift hisebe pathiyechilam, shobai khushi.', 5)
on conflict do nothing;


-- ============================================================
-- Admin policies (authenticated users)
-- ============================================================
-- Any user authenticated via Supabase Auth gets full access.
-- Create your admin user in: Supabase Dashboard -> Authentication -> Users -> Add user

-- Products
drop policy if exists "auth all products" on public.products;
create policy "auth all products" on public.products
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- Orders
drop policy if exists "auth all orders" on public.orders;
create policy "auth all orders" on public.orders
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- Testimonials
drop policy if exists "auth all testimonials" on public.testimonials;
create policy "auth all testimonials" on public.testimonials
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- Contact messages
drop policy if exists "auth all contact" on public.contact_messages;
create policy "auth all contact" on public.contact_messages
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
