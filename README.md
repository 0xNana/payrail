# Payrail

Payrail is a compliant, auditable, encrypted payroll rail for institutions.

It is a privacy-by-design payroll system where:

- salaries remain encrypted on-chain
- only the employee can decrypt their own pay
- employers can execute payroll without exposing amounts publicly
- auditors can verify payroll totals without seeing individual salaries

## What This Repo Contains

This monorepo includes:

- a Next.js web app for employer and employee workflows
- Solidity contracts for confidential payroll on Arbitrum Sepolia
- a generated SDK that exports deployed contract addresses and ABIs
- Supabase-backed off-chain metadata and identity synchronization

## Current Network Target

- Primary test network: `Arbitrum Sepolia` (`421614`)
- Live deployed contracts:
- `PayrailFactoryRegistry`: `0x6815D8d4E3a306AfC20B05b7c1dEb8beF6441936`
- `PayrailToken`: `0xf514A04Ca0e188478EDf920C73C3D44BEb7c9f4e`

These addresses are exported from [`packages/sdk/src/generated/arbitrumSepolia.ts`](/home/elegant/payrail/payrail-app/packages/sdk/src/generated/arbitrumSepolia.ts).

## Architecture

Payrail is split into two layers.

On-chain:

- `PayrailFactoryRegistry`
- `PayrailToken`
- one `Payrail` contract per employer

Off-chain:

- company registration and wallet bindings
- employee identity and employment records
- payroll period and payroll entry logging
- GDPR-oriented audit and subject-request tables

The design principle is:

- confidential salary state lives on-chain
- legal identity and operational metadata live off-chain
- the frontend coordinates both sides without exposing plaintext salary data publicly

## Architecture Diagrams

### System Overview

```text
┌──────────────────────────────────────────────────────────────────────┐
│                               Payrail                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Frontend                                                            │
│  apps/web                                                            │
│  ├─ Landing / company registration                                   │
│  ├─ Employer workspace                                               │
│  ├─ Employee workspace                                               │
│  └─ API routes for Supabase-backed orchestration                     │
│                                                                      │
│                 │ wallet / wagmi / viem / Fhenix client              │
│                 ▼                                                    │
│  On-chain                                                            │
│  Arbitrum Sepolia                                                    │
│  ├─ PayrailFactoryRegistry                                           │
│  ├─ PayrailToken                                                     │
│  └─ Payrail (1 per employer)                                         │
│                                                                      │
│                 │ binding / sync / audit / identity                  │
│                 ▼                                                    │
│  Off-chain                                                           │
│  Supabase                                                            │
│  ├─ company / company_onchain_binding                                │
│  ├─ person / person_identity / person_wallet                         │
│  ├─ employment / employment_chain_binding                            │
│  ├─ payroll_period / payroll_entry                                   │
│  └─ audit and GDPR-related tables                                    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Employer Registration and Payroll Flow

```text
Employer wallet
   │
   ├─ registerCompany() on PayrailFactoryRegistry
   │      └─ deploys a dedicated Payrail contract
   │
   ├─ POST /api/company/register-sync
   │      └─ persists company + on-chain binding in Supabase
   │
   ├─ POST /api/company/register-employee
   │      └─ creates person, identity, wallet, employment, binding
   │
   ├─ setSalary() / employer payroll actions on Payrail
   │
   ├─ confidential treasury funding and payroll execution
   │
   └─ POST /api/company/log-payroll-run
          └─ writes payroll_period + payroll_entry records
```

### Employee Discovery and Private Read Flow

```text
Employee wallet
   │
   ├─ GET /api/employee/bindings?wallet=...&chainId=421614
   │      └─ discovers active employment bindings
   │
   ├─ selects payroll contract in employee workspace
   │
   ├─ reads encrypted handles from Payrail / PayrailToken
   │
   └─ decrypts only personal salary / payment / balance views
```

## Workspace Layout

```text
payrail-app/
├── apps/
│   └── web/                 # Next.js application
├── packages/
│   ├── contracts/           # Hardhat project and Solidity contracts
│   └── sdk/                 # Generated addresses + ABIs
└── dbdiagrams.io/           # Database modeling artifacts
```

## Core Contracts

### `PayrailToken.sol`

Confidential payroll token layer used by the platform.

Current role:

- stores confidential balances
- supports encrypted balance operations for payroll
- acts as the token rail used by employer payroll contracts

### `PayrailFactoryRegistry.sol`

Factory and registry for employer payroll instances.

Current role:

- deploys one `Payrail` contract per employer
- tracks the caller-to-company payroll contract mapping
- provides the canonical entrypoint for employer registration

### `Payrail.sol`

The per-employer payroll contract.

Current role:

- manages employee roster membership
- stores encrypted salary state
- records last-payment state
- runs confidential payroll transfers

## Web App

The web app lives in [`apps/web`](/home/elegant/payrail/payrail-app/apps/web).

Major surfaces:

- landing page
- employer workspace
- employee workspace
- Supabase-backed company and employee APIs

Key libraries:

- `next`
- `react`
- `wagmi`
- `viem`
- `fhenixjs`
- `@supabase/supabase-js`
- `radix-ui`

## Contracts Package

The contracts package lives in [`packages/contracts`](/home/elegant/payrail/payrail-app/packages/contracts).

Key tooling:

- `hardhat`
- `hardhat-deploy`
- `ethers`
- `typechain`
- `@fhenixprotocol/cofhe-contracts`

Deployment entrypoint:

- [`deploy/001_deploy_platform.js`](/home/elegant/payrail/payrail-app/packages/contracts/deploy/001_deploy_platform.js)

Hardhat config:

- [`hardhat.config.js`](/home/elegant/payrail/payrail-app/packages/contracts/hardhat.config.js)

## SDK Package

The SDK package lives in [`packages/sdk`](/home/elegant/payrail/payrail-app/packages/sdk).

It exposes:

- local deployment artifacts
- Arbitrum Sepolia deployment artifacts
- `sdkByChainId` lookup used by the web app

Current supported chain IDs:

- `31337`
- `421614`

## Supabase Data Model

The generated database typings live in [`apps/web/lib/schema.ts`](/home/elegant/payrail/payrail-app/apps/web/lib/schema.ts).

Core tables currently used by the app:

- `company`
- `company_onchain_binding`
- `person`
- `person_identity`
- `person_wallet`
- `employment`
- `employment_chain_binding`
- `payroll_period`
- `payroll_entry`
- `authority_submission`
- `access_audit_log`
- `data_subject_request`

Important note:

- this repo contains generated Supabase TypeScript types
- this repo does not currently contain a checked-in SQL bootstrap or migration set for a fresh Supabase project

## API Route Inventory

All current API routes live under [`apps/web/app/api`](/home/elegant/payrail/payrail-app/apps/web/app/api).

### Company routes

- `GET /api/company/binding`
  - resolves the active company binding for an employer wallet and chain ID

- `DELETE /api/company/delete`
  - deletes company-linked Supabase records after on-chain deactivation is already handled client-side

- `GET /api/company/employee-identity`
  - decrypts employer-visible employee identity fields for an owned employment binding

- `PATCH /api/company/employee-identity`
  - updates encrypted employee identity fields for an owned employment binding

- `POST /api/company/employee-sync`
  - toggles an employee’s active chain binding for a company

- `POST /api/company/log-payroll-run`
  - writes or updates `payroll_period` and `payroll_entry` records after payroll execution

- `POST /api/company/register-employee`
  - creates employee identity, wallet, employment, and employment-chain binding records

- `POST /api/company/register-sync`
  - upserts company metadata and the company’s on-chain binding

- `DELETE /api/company/remove-employee`
  - removes an employee and deletes linked off-chain records in FK-safe order

- `GET /api/company/roster`
  - returns the employer roster with payroll cadence and last/next pay period context

- `PATCH /api/company/update-employee`
  - updates employment metadata and binding activity for an owned employee record

### Employee routes

- `GET /api/employee/bindings`
  - returns active payroll contracts associated with a wallet and chain ID

### Auth note

Current employer-scoped routes enforce ownership through the `x-employer-wallet` header and Supabase binding checks. This is workable for controlled testing but should be hardened to signed-session or SIWE-style auth before production deployment.

## Environment Variables

Create [`/home/elegant/payrail/payrail-app/.env.local`](/home/elegant/payrail/payrail-app/.env.local).

### Required for web app

- `NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

### Required for deployment and SDK export

- `ARBITRUM_SEPOLIA_RPC_URL`
- `PRIVATE_KEY`
- `ARBISCAN_API_KEY`

### Required for full backend and identity flows

- `SUPABASE_SERVICE_ROLE_KEY`
- `IDENTITY_ENCRYPTION_KEY`
- `IDENTITY_HMAC_SECRET`

### Optional

- `REPORT_GAS`

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start the web app

```bash
pnpm payrail:web
```

### 3. Run workspace typecheck

```bash
pnpm typecheck
```

## Common Commands

### Web

```bash
pnpm payrail:web
pnpm payrail:web:build
pnpm --filter @payrail/web typecheck
```

### Contracts

```bash
pnpm --filter @payrail/contracts compile
pnpm payrail:test:contracts
pnpm payrail:chain
```

### Local deployment

```bash
pnpm payrail:deploy:local
pnpm payrail:export:sdk
```

### Arbitrum Sepolia deployment

```bash
pnpm payrail:deploy:arbitrum-sepolia
pnpm payrail:export:sdk:arbitrum-sepolia
```

### Direct package scripts

```bash
pnpm --filter @payrail/contracts deploy:arbitrumSepolia
pnpm --filter @payrail/contracts export:sdk:arbitrumSepolia
```

## Local Development Flow

Use this sequence when working end-to-end locally:

1. `pnpm install`
2. `pnpm payrail:chain`
3. `pnpm payrail:deploy:local`
4. `pnpm payrail:export:sdk`
5. `pnpm payrail:web`

## Arbitrum Sepolia Flow

Use this sequence when targeting the live testnet:

1. populate `.env.local`
2. `pnpm --filter @payrail/contracts compile`
3. `pnpm payrail:deploy:arbitrum-sepolia`
4. `pnpm payrail:export:sdk:arbitrum-sepolia`
5. `pnpm payrail:web:build`

## Product Flows

### Employer

An employer can:

- register a company on-chain
- sync legal metadata to Supabase
- register employees
- set confidential salary state
- fund confidential treasury balance
- execute payroll
- inspect operational payroll state

### End-to-End Employer Walkthrough

1. Connect an employer wallet on Arbitrum Sepolia.
2. Open the landing page and register the company on-chain through `PayrailFactoryRegistry`.
3. Complete backend sync so the company and on-chain payroll binding are written to Supabase.
4. Open the employer workspace and register an employee.
5. Enter employee identity data, wallet address, employment metadata, and cadence.
6. Set confidential salary state on the employer’s dedicated `Payrail` contract.
7. Fund the confidential treasury balance through the token flow exposed in the employer app.
8. Run payroll from the employer workspace.
9. Persist the payroll run off-chain through `POST /api/company/log-payroll-run`.
10. Verify `payroll_period` and `payroll_entry` rows exist and reflect the run.

### Employer Flow: On-chain vs Off-chain

- On-chain:
  - company registration
  - payroll contract deployment
  - salary state
  - treasury and payroll execution

- Off-chain:
  - company legal metadata
  - employee identity
  - employment metadata
  - payroll run logs and period records

### Employee

An employee can:

- connect wallet
- discover employment bindings
- decrypt their own salary
- decrypt their own last payment
- inspect their confidential balance view

### End-to-End Employee Walkthrough

1. Connect the employee wallet in the employee workspace.
2. Let the app discover active bindings through `GET /api/employee/bindings`.
3. Select the relevant payroll contract if more than one binding is returned.
4. Read encrypted salary and payment state from the selected `Payrail` contract.
5. Decrypt salary, last payment, and balance views locally in the employee UI.
6. Confirm that only employee-visible compensation data is revealed in the session.

### Payroll Logging Walkthrough

1. Employer executes payroll on-chain.
2. Frontend collects the affected employment IDs and run metadata.
3. Frontend calls `POST /api/company/log-payroll-run`.
4. API resolves the company binding and verifies employer ownership.
5. API computes the payroll period for the cadence and reference date.
6. API inserts or updates `payroll_period`.
7. API inserts or updates `payroll_entry` records for each employment row.

## Security and Compliance Notes

Current design goals:

- encrypted salary state on-chain
- employee-only compensation visibility
- auditable payroll records
- GDPR-oriented off-chain identity storage

Repo-level docs:

- [`GDPR.md`](/home/elegant/payrail/payrail-app/GDPR.md)
- [`SECURITY.md`](/home/elegant/payrail/payrail-app/SECURITY.md)

## Known Gaps

These are the main repo-level limitations today:

- webpack build still emits a generic circular chunk warning
- Supabase SQL bootstrap is not checked in
- some production hardening remains, especially stronger auth for employer-scoped API routes
- full end-to-end browser QA should still be treated as required before production rollout

## Validation Status

These commands have been used repeatedly on the current repo state:

```bash
pnpm --filter @payrail/contracts compile
pnpm --filter @payrail/web typecheck
pnpm --filter @payrail/web build
```

## License

MIT
