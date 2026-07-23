-- =========================================================
-- NETO CONSERTOS - Assistência Técnica
-- Schema completo do banco de dados (PostgreSQL / Supabase)
-- =========================================================

-- Extensões necessárias
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- ENUM: status do serviço
-- ---------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'service_status') then
    create type service_status as enum (
      'recebido',
      'em_andamento',
      'aguardando_peca',
      'finalizado',
      'entregue'
    );
  end if;
end $$;

-- ---------------------------------------------------------
-- ENUM: forma de pagamento
-- ---------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_method') then
    create type payment_method as enum ('pix', 'dinheiro', 'cartao', 'transferencia');
  end if;
end $$;

-- ---------------------------------------------------------
-- SEQUÊNCIA: número de OS sequencial por usuário (global simples)
-- ---------------------------------------------------------
create sequence if not exists os_number_seq start 1;

-- ---------------------------------------------------------
-- TABELA: services (serviços / ordens de serviço)
-- ---------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  os_number integer not null default nextval('os_number_seq'),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  client_name text not null check (char_length(trim(client_name)) > 0),
  client_phone text not null,
  equipment text not null check (char_length(trim(equipment)) > 0),
  brand text,
  reported_issue text not null,

  service_value numeric(12,2) not null default 0 check (service_value >= 0),
  parts_cost numeric(12,2) not null default 0 check (parts_cost >= 0),
  down_payment numeric(12,2) not null default 0 check (down_payment >= 0),

  -- coluna gerada: lucro = valor do serviço - valor gasto em peças
  profit numeric(12,2) generated always as (service_value - parts_cost) stored,

  status service_status not null default 'recebido',
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  finished_at timestamptz
);

create unique index if not exists services_os_number_key on public.services (os_number);
create index if not exists services_owner_id_idx on public.services (owner_id);
create index if not exists services_status_idx on public.services (status);
create index if not exists services_created_at_idx on public.services (created_at desc);
-- índice para busca textual rápida (cliente, telefone, equipamento)
create index if not exists services_search_idx on public.services
  using gin (
    to_tsvector('simple', coalesce(client_name,'') || ' ' || coalesce(client_phone,'') || ' ' || coalesce(equipment,'') || ' ' || coalesce(brand,''))
  );

-- ---------------------------------------------------------
-- TABELA: payments (pagamentos vinculados a um serviço)
-- ---------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  amount numeric(12,2) not null check (amount > 0),
  method payment_method not null,
  paid_at date not null default current_date,
  note text,

  created_at timestamptz not null default now()
);

create index if not exists payments_service_id_idx on public.payments (service_id);
create index if not exists payments_owner_id_idx on public.payments (owner_id);

-- ---------------------------------------------------------
-- TRIGGER: atualiza updated_at e finished_at automaticamente
-- ---------------------------------------------------------
create or replace function public.set_service_timestamps()
returns trigger as $$
begin
  new.updated_at = now();

  if new.status in ('finalizado', 'entregue') and old.finished_at is null then
    new.finished_at = now();
  elsif new.status not in ('finalizado', 'entregue') then
    new.finished_at = null;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_services_set_timestamps on public.services;
create trigger trg_services_set_timestamps
  before update on public.services
  for each row execute function public.set_service_timestamps();

-- ---------------------------------------------------------
-- VIEW: resumo financeiro por serviço (total pago / restante)
-- ---------------------------------------------------------
create or replace view public.service_financials as
select
  s.id as service_id,
  s.owner_id,
  s.service_value,
  s.down_payment,
  coalesce(sum(p.amount), 0) as payments_total,
  (s.down_payment + coalesce(sum(p.amount), 0)) as total_paid,
  greatest(s.service_value - (s.down_payment + coalesce(sum(p.amount), 0)), 0) as remaining,
  case
    when (s.down_payment + coalesce(sum(p.amount), 0)) <= 0 then 'pendente'
    when (s.down_payment + coalesce(sum(p.amount), 0)) >= s.service_value then 'pago'
    else 'parcial'
  end as payment_status
from public.services s
left join public.payments p on p.service_id = s.id
group by s.id, s.owner_id, s.service_value, s.down_payment;

-- ---------------------------------------------------------
-- VIEW: métricas mensais (faturamento, peças, lucro) por mês
-- ---------------------------------------------------------
create or replace view public.monthly_metrics as
select
  owner_id,
  date_trunc('month', created_at) as month,
  count(*) as services_count,
  sum(service_value) as revenue,
  sum(parts_cost) as parts_spend,
  sum(profit) as profit
from public.services
group by owner_id, date_trunc('month', created_at);

-- ---------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------
alter table public.services enable row level security;
alter table public.payments enable row level security;

drop policy if exists "services_select_own" on public.services;
create policy "services_select_own" on public.services
  for select using (auth.uid() = owner_id);

drop policy if exists "services_insert_own" on public.services;
create policy "services_insert_own" on public.services
  for insert with check (auth.uid() = owner_id);

drop policy if exists "services_update_own" on public.services;
create policy "services_update_own" on public.services
  for update using (auth.uid() = owner_id);

drop policy if exists "services_delete_own" on public.services;
create policy "services_delete_own" on public.services
  for delete using (auth.uid() = owner_id);

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments
  for select using (auth.uid() = owner_id);

drop policy if exists "payments_insert_own" on public.payments;
create policy "payments_insert_own" on public.payments
  for insert with check (auth.uid() = owner_id);

drop policy if exists "payments_update_own" on public.payments;
create policy "payments_update_own" on public.payments
  for update using (auth.uid() = owner_id);

drop policy if exists "payments_delete_own" on public.payments;
create policy "payments_delete_own" on public.payments
  for delete using (auth.uid() = owner_id);

-- ---------------------------------------------------------
-- Realtime (opcional): permite assinar mudanças nas tabelas
-- ---------------------------------------------------------
alter publication supabase_realtime add table public.services;
alter publication supabase_realtime add table public.payments;
