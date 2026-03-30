# GDPR

## Positioning

Payrail is designed as a privacy-by-design payroll system for institutional use.

## Data model

- Salary values remain encrypted on-chain.
- Employee wallet addresses are used for payroll execution and access control.
- Operational company, roster, and identity records are stored off-chain.
- Only authorized application flows should decrypt employee-visible payroll data.

## Privacy principles

- Minimize plaintext exposure.
- Keep payroll amounts encrypted by default.
- Separate public execution metadata from private employment records.
- Limit server-side access to only the operational data needed for payroll administration.

## Required operational controls

- Maintain valid processor agreements for the infrastructure you actually use.
- Document hosting regions and cross-border data flows for Supabase and RPC providers.
- Restrict service-role credentials and audit access paths.
- Keep retention and deletion policies aligned with the actual schema and business process.

## Important note

This document should be updated whenever the deployed privacy stack, processors, or data flows change.
