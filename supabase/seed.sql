-- Payrail sample seed
-- Run after supabase/schema.sql
--
-- This seeds one sample company, one employer binding, one employee, and one
-- payroll period/entry. Encrypted identity fields are placeholders so the app's
-- custom AES-GCM decrypt route will not produce meaningful plaintext until real
-- employee data is written through the application.

insert into public.company (
  company_id,
  legal_name,
  country_code
) values (
  '11111111-1111-1111-1111-111111111111',
  'Payrail Demo Institution',
  'US'
)
on conflict (company_id) do update
set legal_name = excluded.legal_name,
    country_code = excluded.country_code;

insert into public.company_onchain_binding (
  company_onchain_binding_id,
  company_id,
  chain_id,
  payroll_contract_address,
  employer_wallet_address,
  active
) values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  421614,
  '0x6815d8d4e3a306afc20b05b7c1deb8bef6441936',
  '0x1111111111111111111111111111111111111111',
  true
)
on conflict (chain_id, employer_wallet_address) do update
set company_id = excluded.company_id,
    payroll_contract_address = excluded.payroll_contract_address,
    active = excluded.active;

insert into public.person (
  person_id,
  status
) values (
  '33333333-3333-3333-3333-333333333333',
  'active'
)
on conflict (person_id) do update
set status = excluded.status;

insert into public.person_identity (
  person_id,
  given_name_enc,
  family_name_enc,
  dni_type,
  dni_value_enc,
  dni_search_hmac,
  email_enc,
  encryption_key_ref
) values (
  '33333333-3333-3333-3333-333333333333',
  'seed-placeholder-given-name',
  'seed-placeholder-family-name',
  'PASSPORT',
  'seed-placeholder-dni',
  'seed-passport-hmac-demo-employee',
  'seed-placeholder-email',
  'seed'
)
on conflict (person_id) do update
set given_name_enc = excluded.given_name_enc,
    family_name_enc = excluded.family_name_enc,
    dni_type = excluded.dni_type,
    dni_value_enc = excluded.dni_value_enc,
    dni_search_hmac = excluded.dni_search_hmac,
    email_enc = excluded.email_enc,
    encryption_key_ref = excluded.encryption_key_ref;

insert into public.person_wallet (
  person_wallet_id,
  person_id,
  chain_id,
  wallet_address,
  active
) values (
  '44444444-4444-4444-4444-444444444444',
  '33333333-3333-3333-3333-333333333333',
  421614,
  '0x2222222222222222222222222222222222222222',
  true
)
on conflict (chain_id, wallet_address) do update
set person_id = excluded.person_id,
    active = excluded.active;

insert into public.employment (
  employment_id,
  company_id,
  person_id,
  employment_status,
  start_date,
  job_title,
  payroll_cadence
) values (
  '55555555-5555-5555-5555-555555555555',
  '11111111-1111-1111-1111-111111111111',
  '33333333-3333-3333-3333-333333333333',
  'active',
  '2026-01-01',
  'Operations Analyst',
  'monthly'
)
on conflict (company_id, person_id, start_date) do update
set employment_status = excluded.employment_status,
    job_title = excluded.job_title,
    payroll_cadence = excluded.payroll_cadence;

insert into public.employment_chain_binding (
  employment_chain_binding_id,
  employment_id,
  company_onchain_binding_id,
  person_wallet_id,
  active
) values (
  '66666666-6666-6666-6666-666666666666',
  '55555555-5555-5555-5555-555555555555',
  '22222222-2222-2222-2222-222222222222',
  '44444444-4444-4444-4444-444444444444',
  true
)
on conflict (employment_id, company_onchain_binding_id, person_wallet_id) do update
set active = excluded.active,
    unlinked_at = null;

insert into public.payroll_period (
  payroll_period_id,
  company_id,
  period_code,
  period_start,
  period_end,
  pay_date,
  status
) values (
  '77777777-7777-7777-7777-777777777777',
  '11111111-1111-1111-1111-111111111111',
  'monthly-2026-03',
  '2026-03-01',
  '2026-03-31',
  '2026-03-31',
  'paid'
)
on conflict (company_id, period_code) do update
set status = excluded.status,
    period_start = excluded.period_start,
    period_end = excluded.period_end,
    pay_date = excluded.pay_date;

insert into public.payroll_entry (
  payroll_entry_id,
  payroll_period_id,
  employment_id,
  currency_code,
  gross_amount_minor,
  net_amount_minor,
  tax_withheld_minor,
  social_security_minor,
  onchain_payment_tx_hash,
  onchain_payment_status
) values (
  '88888888-8888-8888-8888-888888888888',
  '77777777-7777-7777-7777-777777777777',
  '55555555-5555-5555-5555-555555555555',
  'USD',
  1000000,
  850000,
  100000,
  50000,
  '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
  'confirmed'
)
on conflict (payroll_period_id, employment_id) do update
set gross_amount_minor = excluded.gross_amount_minor,
    net_amount_minor = excluded.net_amount_minor,
    tax_withheld_minor = excluded.tax_withheld_minor,
    social_security_minor = excluded.social_security_minor,
    onchain_payment_tx_hash = excluded.onchain_payment_tx_hash,
    onchain_payment_status = excluded.onchain_payment_status;
