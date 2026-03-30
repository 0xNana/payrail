# Supabase Verification Checklist

Run [`schema.sql`](/home/elegant/payrail/payrail-app/supabase/schema.sql) first, then optionally run [`seed.sql`](/home/elegant/payrail/payrail-app/supabase/seed.sql).

## 1. Confirm core tables exist

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'company',
    'company_onchain_binding',
    'person',
    'person_identity',
    'person_wallet',
    'employment',
    'employment_chain_binding',
    'payroll_period',
    'payroll_entry',
    'authority_submission',
    'access_audit_log',
    'data_subject_request'
  )
order by table_name;
```

Expected: 12 rows.

## 2. Confirm the most important unique indexes work

```sql
select indexname
from pg_indexes
where schemaname = 'public'
  and indexname in (
    'unique_chain_employer_wallet',
    'unique_chain_payroll_contract',
    'unique_person_wallet_chain_address',
    'unique_employment_chain_binding',
    'unique_payroll_period_company_code',
    'unique_payroll_entry_period_employment'
  )
order by indexname;
```

Expected: 6 rows.

## 3. If you ran the seed, confirm the sample company binding exists

```sql
select *
from public.company_onchain_binding
where employer_wallet_address = '0x1111111111111111111111111111111111111111';
```

Expected: 1 row on chain `421614`.

## 4. Confirm employee discovery join works

```sql
select
  c.legal_name,
  cob.payroll_contract_address,
  pw.wallet_address,
  ecb.active
from public.company c
join public.company_onchain_binding cob on cob.company_id = c.company_id
join public.employment_chain_binding ecb on ecb.company_onchain_binding_id = cob.company_onchain_binding_id
join public.person_wallet pw on pw.person_wallet_id = ecb.person_wallet_id
where pw.wallet_address = '0x2222222222222222222222222222222222222222';
```

Expected: 1 row for `Payrail Demo Institution`.

## 5. Confirm payroll logging tables are writable

```sql
select
  pp.period_code,
  pe.currency_code,
  pe.gross_amount_minor,
  pe.net_amount_minor,
  pe.onchain_payment_status
from public.payroll_period pp
join public.payroll_entry pe on pe.payroll_period_id = pp.payroll_period_id
where pp.company_id = '11111111-1111-1111-1111-111111111111';
```

Expected: 1 seeded payroll record.

## 6. Smoke-test the routes from the app

After setting `.env.local` to the correct Supabase project:

- open the landing page and register/sync a company
- call `/api/company/binding`
- call `/api/employee/bindings`
- open employer roster
- confirm the app no longer throws `Could not find the table 'public.company_onchain_binding' in the schema cache`
