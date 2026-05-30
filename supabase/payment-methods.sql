-- ============================================================
-- Chapai Mango House — Admin-managed payment methods
-- ============================================================
-- Run this in Supabase SQL Editor ONCE after deploying the
-- /admin/payment-methods page. Idempotent — safe to re-run.
--
-- Why this migration: the checkout form previously read receiving
-- numbers from NEXT_PUBLIC_BKASH_NUMBER / _NAGAD_NUMBER /
-- _ROCKET_NUMBER env vars and the enabled-method list from
-- NEXT_PUBLIC_PAYMENT_METHODS. Adding a new method (Upay,
-- bank-transfer) or changing a number meant editing env vars in
-- Railway and waiting for a redeploy. This table moves all of
-- that into the admin panel:
--
--   * Toggle methods on/off without a code change.
--   * Set the receiving number per method (or full bank-account
--     details for the bank transfer option).
--   * Set a fixed advance / booking amount per method (e.g.
--     "100 BDT advance via bKash before COD orders ship").
--   * Add new methods (e.g. an upcoming "PaymentX" rail) without
--     a schema migration — operator inserts a new row from
--     /admin/payment-methods.
--
-- The legacy NEXT_PUBLIC_*_NUMBER env vars still work as a
-- fallback when account_number is blank, so deploying the
-- migration without filling in numbers won't break checkout.
-- ============================================================

create table if not exists public.payment_methods (
  id              uuid primary key default gen_random_uuid(),

  -- Stable machine code used in URLs and the orders table's
  -- payment_method column. Lowercase, no spaces.
  --   built-ins:  cod, bkash, nagad, rocket, upay, bank
  --   custom:     anything matching ^[a-z][a-z0-9_]{1,30}$
  code            text not null unique
                  check (code ~ '^[a-z][a-z0-9_]{1,30}$'),

  -- Bangla label shown on checkout cards.
  label           text not null,

  -- The receiving number (MFS) or short account string (bank).
  -- Empty string => fall back to NEXT_PUBLIC_<CODE>_NUMBER env
  -- var on the public site so old deployments keep working.
  account_number  text not null default '',

  -- Fixed amount the customer must pay UP FRONT before this
  -- order is confirmed. 0 = no advance required (e.g. COD
  -- typically pays the whole amount on delivery).
  --
  -- Common patterns the admin can set:
  --   COD:     100  (booking confirmation via bKash/Nagad)
  --   bKash:   0    (or full order total — fully prepaid)
  --   bank:    full order total
  advance_amount  integer not null default 0
                  check (advance_amount >= 0),

  -- Free-form Bangla instructions shown under the chosen method
  -- on /checkout. Markdown not parsed — kept plain so it renders
  -- safely on every device. Max 1000 chars to keep the card tidy.
  instructions    text not null default '',

  -- Which built-in icon to render. Clients map this to an inline
  -- SVG: bkash | nagad | rocket | upay | cod | bank | generic.
  icon_key        text not null default 'generic',

  is_active       boolean not null default true,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_payment_methods_active_order
  on public.payment_methods(is_active, sort_order);

-- ----- updated_at trigger ---------------------------------
create or replace function public.tg_payment_methods_touch()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end $$;

revoke execute on function public.tg_payment_methods_touch() from public;

drop trigger if exists trg_payment_methods_touch on public.payment_methods;
create trigger trg_payment_methods_touch
  before update on public.payment_methods
  for each row execute function public.tg_payment_methods_touch();

-- ----- RLS ------------------------------------------------
alter table public.payment_methods enable row level security;

grant select on public.payment_methods to anon, authenticated;
grant insert, update, delete on public.payment_methods to authenticated;

do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname='public' and tablename='payment_methods'
  loop
    execute format(
      'drop policy if exists %I on public.payment_methods',
      pol.policyname
    );
  end loop;
end $$;

-- Public reads only ACTIVE rows. Admin reads everything (so they
-- can re-enable hidden ones from /admin/payment-methods).
create policy "payment_methods_public_read_active"
  on public.payment_methods
  for select to anon, authenticated
  using (is_active = true or public.is_admin());

create policy "payment_methods_admin_insert"
  on public.payment_methods
  for insert to authenticated
  with check (public.is_admin());

create policy "payment_methods_admin_update"
  on public.payment_methods
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "payment_methods_admin_delete"
  on public.payment_methods
  for delete to authenticated
  using (public.is_admin());

-- ----- Seed: 6 default methods ----------------------------
-- ON CONFLICT DO NOTHING so re-running this migration after
-- the admin has customised numbers / instructions doesn't
-- overwrite their work.
insert into public.payment_methods
  (code, label, account_number, advance_amount, instructions, icon_key, sort_order)
values
  (
    'cod',
    'ক্যাশ অন ডেলিভারি',
    '',
    0,
    'পণ্য পেয়ে কুরিয়ারের কাছে নগদ পরিশোধ করুন।',
    'cod',
    10
  ),
  (
    'bkash',
    'bKash',
    '',
    0,
    'উপরের নম্বরে Send Money করুন → TrxID + sender number ফর্মে দিন।',
    'bkash',
    20
  ),
  (
    'nagad',
    'Nagad',
    '',
    0,
    'উপরের নম্বরে Send Money করুন → TrxID + sender number ফর্মে দিন।',
    'nagad',
    30
  ),
  (
    'rocket',
    'Rocket',
    '',
    0,
    'উপরের নম্বরে Send Money করুন → TrxID + sender number ফর্মে দিন।',
    'rocket',
    40
  ),
  (
    'upay',
    'Upay',
    '',
    0,
    'উপরের Upay নম্বরে Send Money করুন → TrxID + sender number ফর্মে দিন।',
    'upay',
    50
  ),
  (
    'bank',
    'ব্যাংক ট্রান্সফার',
    '',
    0,
    'এই অ্যাকাউন্টে ফান্ড ট্রান্সফার করুন এবং ট্রান্সফার রেফারেন্স ফর্মে দিন।',
    'bank',
    60
  )
on conflict (code) do nothing;


-- ----- Loosen the orders.payment_method check constraint --
-- Original schema.sql pinned this to ('cod','bkash','nagad','rocket').
-- Now that admins can add Upay / bank-transfer / future rails from
-- /admin/payment-methods, the orders table must accept whatever
-- codes the operator defines. We keep the column NOT NULL and as
-- text, but drop the legacy check constraint entirely.
do $$
declare
  con_name text;
begin
  select conname
    into con_name
    from pg_constraint
   where conrelid = 'public.orders'::regclass
     and pg_get_constraintdef(oid) ilike '%payment_method%in%';
  if con_name is not null then
    execute format('alter table public.orders drop constraint %I', con_name);
  end if;
end $$;

-- ============================================================
-- Sanity check (uncomment to verify after running):
--
-- select code, label, account_number, advance_amount, is_active, sort_order
--   from public.payment_methods
--  order by sort_order;
-- ============================================================
