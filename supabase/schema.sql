-- Payrail Supabase bootstrap
-- Run this in the Supabase SQL Editor for a fresh project.

create extension if not exists pgcrypto;

create table if not exists public.company (
  company_id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  country_code char(2) not null,
  created_at timestamptz not null default now(),
  constraint company_country_code_len check (char_length(country_code) = 2)
);

create table if not exists public.company_onchain_binding (
  company_onchain_binding_id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.company(company_id) on delete cascade,
  chain_id bigint not null,
  payroll_contract_address text not null,
  employer_wallet_address text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists unique_chain_payroll_contract
  on public.company_onchain_binding (chain_id, payroll_contract_address);

create unique index if not exists unique_chain_employer_wallet
  on public.company_onchain_binding (chain_id, employer_wallet_address);

create table if not exists public.person (
  person_id uuid primary key default gen_random_uuid(),
  status text not null,
  created_at timestamptz not null default now(),
  constraint person_status_check check (status in ('active', 'inactive'))
);

create table if not exists public.person_identity (
  person_id uuid primary key references public.person(person_id) on delete cascade,
  given_name_enc text not null,
  family_name_enc text not null,
  dni_type text not null,
  dni_value_enc text not null,
  dni_search_hmac text not null unique,
  ssn_value_enc text,
  email_enc text,
  address_enc text,
  encryption_key_ref text not null,
  updated_at timestamptz not null default now(),
  constraint person_identity_dni_type_check check (dni_type in ('DNI', 'NIE', 'NIF', 'PASSPORT'))
);

create table if not exists public.person_wallet (
  person_wallet_id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.person(person_id) on delete cascade,
  chain_id bigint not null,
  wallet_address text not null,
  active boolean not null default true,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists unique_person_wallet_chain_address
  on public.person_wallet (chain_id, wallet_address);

create table if not exists public.employment (
  employment_id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.company(company_id) on delete cascade,
  person_id uuid not null references public.person(person_id) on delete cascade,
  employment_status text not null,
  start_date date not null,
  end_date date,
  job_title text,
  payroll_cadence text not null default 'monthly',
  created_at timestamptz not null default now(),
  constraint employment_status_check check (employment_status in ('active', 'suspended', 'terminated')),
  constraint employment_payroll_cadence_check check (payroll_cadence in ('monthly', 'semiMonthly', 'weekly')),
  constraint employment_date_order_check check (end_date is null or end_date >= start_date)
);

create unique index if not exists unique_employment_company_person_start_date
  on public.employment (company_id, person_id, start_date);

create table if not exists public.employment_chain_binding (
  employment_chain_binding_id uuid primary key default gen_random_uuid(),
  employment_id uuid not null references public.employment(employment_id) on delete cascade,
  company_onchain_binding_id uuid not null references public.company_onchain_binding(company_onchain_binding_id) on delete cascade,
  person_wallet_id uuid not null references public.person_wallet(person_wallet_id) on delete cascade,
  active boolean not null default true,
  linked_at timestamptz not null default now(),
  unlinked_at timestamptz,
  constraint employment_chain_binding_unlinked_check check (unlinked_at is null or unlinked_at >= linked_at)
);

create unique index if not exists unique_employment_chain_binding
  on public.employment_chain_binding (employment_id, company_onchain_binding_id, person_wallet_id);

create table if not exists public.payroll_period (
  payroll_period_id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.company(company_id) on delete cascade,
  period_code text not null,
  period_start date not null,
  period_end date not null,
  pay_date date not null,
  status text not null,
  created_at timestamptz not null default now(),
  constraint payroll_period_status_check check (status in ('open', 'approved', 'paid', 'reported', 'closed', 'pending')),
  constraint payroll_period_date_order_check check (period_end >= period_start),
  constraint payroll_period_pay_date_check check (pay_date >= period_start)
);

create unique index if not exists unique_payroll_period_company_code
  on public.payroll_period (company_id, period_code);

create table if not exists public.payroll_entry (
  payroll_entry_id uuid primary key default gen_random_uuid(),
  payroll_period_id uuid not null references public.payroll_period(payroll_period_id) on delete cascade,
  employment_id uuid not null references public.employment(employment_id) on delete cascade,
  currency_code char(3) not null,
  gross_amount_minor bigint not null,
  net_amount_minor bigint not null,
  tax_withheld_minor bigint,
  social_security_minor bigint,
  onchain_payment_tx_hash text,
  onchain_payment_status text not null,
  created_at timestamptz not null default now(),
  constraint payroll_entry_amounts_check check (gross_amount_minor >= 0 and net_amount_minor >= 0),
  constraint payroll_entry_status_check check (onchain_payment_status in ('pending', 'confirmed', 'failed', 'reverted', 'n/a'))
);

create unique index if not exists unique_payroll_entry_period_employment
  on public.payroll_entry (payroll_period_id, employment_id);

create table if not exists public.authority_submission (
  authority_submission_id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.company(company_id) on delete cascade,
  payroll_period_id uuid references public.payroll_period(payroll_period_id) on delete set null,
  authority_type text not null,
  submission_type text not null,
  status text not null,
  payload_enc text,
  submitted_at timestamptz,
  acknowledgement_ref text,
  created_at timestamptz not null default now(),
  constraint authority_submission_type_check check (authority_type in ('tax', 'social_security', 'labor')),
  constraint authority_submission_status_check check (status in ('draft', 'sent', 'accepted', 'rejected'))
);

create table if not exists public.access_audit_log (
  access_audit_log_id uuid primary key default gen_random_uuid(),
  actor_id text not null,
  action text not null,
  target_type text not null,
  target_id uuid,
  legal_purpose text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.data_subject_request (
  dsr_id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.person(person_id) on delete cascade,
  request_type text not null,
  status text not null,
  received_at timestamptz not null default now(),
  due_at timestamptz not null,
  closed_at timestamptz,
  constraint data_subject_request_type_check check (request_type in ('access', 'rectification', 'erasure', 'restriction', 'portability')),
  constraint data_subject_request_status_check check (status in ('received', 'in_progress', 'completed', 'rejected')),
  constraint data_subject_request_due_check check (closed_at is null or closed_at >= received_at)
);

create index if not exists idx_company_onchain_binding_company_id
  on public.company_onchain_binding (company_id);

create index if not exists idx_person_wallet_person_id
  on public.person_wallet (person_id);

create index if not exists idx_employment_company_id
  on public.employment (company_id);

create index if not exists idx_employment_person_id
  on public.employment (person_id);

create index if not exists idx_employment_chain_binding_company_binding_id
  on public.employment_chain_binding (company_onchain_binding_id);

create index if not exists idx_employment_chain_binding_person_wallet_id
  on public.employment_chain_binding (person_wallet_id);

create index if not exists idx_payroll_period_company_id
  on public.payroll_period (company_id);

create index if not exists idx_payroll_entry_employment_id
  on public.payroll_entry (employment_id);

create index if not exists idx_authority_submission_company_id
  on public.authority_submission (company_id);

create index if not exists idx_data_subject_request_person_id
  on public.data_subject_request (person_id);
