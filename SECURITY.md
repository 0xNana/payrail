# Security

## Scope

This repository includes:

- `Payrail.sol`
- `PayrailFactoryRegistry.sol`
- `PayrailToken.sol`
- the web application in `apps/web`

## Trust boundaries

- Salary and payment values are stored encrypted on-chain.
- Employees decrypt their own salary and payment history client-side.
- Employers execute payroll runs without exposing individual amounts publicly.
- Supabase stores operational and identity records outside the chain boundary.

## Key risks

- Incorrect deployment addresses exported to the SDK
- Misconfigured Supabase credentials or service-role access
- Operator approval mistakes during treasury and payroll execution
- Frontend misuse of permits or sealing keys
- Regressions in encrypted token wrap and unwrap flows

## Operational controls

- Review contract deployment outputs before exporting SDK artifacts.
- Restrict service-role secrets to server-side execution only.
- Re-run contract compile and web build checks after changing encrypted flows.
- Validate employer operator approval before running payroll.
- Treat build-time and runtime environment variables as required infrastructure.
