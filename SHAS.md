# Vote Operations — Active SHA Ledger

This file records the current `main` branch baseline for the Next.js static-export application.

## Live deployment

- Repository: `naappe/Vote`
- Branch: `main`
- GitHub Pages: https://naappe.github.io/Vote/
- Base path: `/Vote`
- Supabase resident identity table: `Resident`

Only routes currently defined by `layout/Sidebar.tsx` and the `app/` directory belong in documentation.

## Documentation baseline

| File | Blob SHA | Commit |
|---|---|---|
| `README.md` | `3b766f0e2ca5dd27385041cbd2058402fb750475` | `c8ba30c0343f5c5b5ff0ff28f13d1cda5d4b4ba4` |

## Active application files

| File | Blob SHA | Responsibility |
|---|---|---|
| `package.json` | `27db2072ca5cb6803a12605c7f9ff202951b1b16` | Next.js, React and build scripts |
| `next.config.js` | `c0a0e030ae27191a6b54cbff80c44a191fd89763` | Static export, `/Vote` base path and unoptimized images |
| `app/page.tsx` | `700f79b67ac14f31d1db03b9018820a462d8c148` | Dashboard entry |
| `layout/AppLayout.tsx` | `5db08dfb94fafbd72131e31cd2a318964fe3cac4` | Shared page shell |
| `layout/Sidebar.tsx` | `3f8812d93a81b14e8990e3e29d04a53e960c9a7a` | Active navigation and route ownership |
| `components/VoterManagementContent.tsx` | `d2cd15b34df2313f486cb271002a5c7237f70593` | Residents filters, paging, gallery and list |
| `components/CallCenterContent.tsx` | `9047f9b5e16c5e702958c069cf3860fbadfb5c88` | Call queue and result editor |
| `components/TransportationContent.tsx` | `e518d1e09a647492aefb7ef2f5edcf2e95c48158` | Election-box transportation workflow |
| `lib/supabase.ts` | `99db428641269ea39be8011c3a7d8c5f473a051e` | Resident, Call Center and verification data access |
| `lib/operations.ts` | `3f7bf834688333f5e50dbad247931490bae10aab` | Election Day, transportation and workflow shares |
| `.github/workflows/deploy.yml` | `c30bd2cfb907e0ca0b4504d9575f4a1cb831a72e` | GitHub Pages build and deployment |

## Current restore commits

| Commit | Restore point |
|---|---|
| `c8ba30c0343f5c5b5ff0ff28f13d1cda5d4b4ba4` | Current README, active links and source SHA baseline |
| `7f3433bcac0aa4ac0c897095f5911644906a1cf0` | Resident election-box filter and paging type fix |
| `23bcf95f7108d76fb50d8f611db81dcb9417ae9f` | GitHub Pages workflow without lock-file cache requirement |
| `c6f37cc8a05583f5211ec1ec27d157fb30bbcce6` | Fresh Pages deployment trigger and export verification |
| `aea1209110ab7fafc207657465d6d6ba200f2b5f` | Transportation organized by election box |

## Rules for future updates

1. Use `layout/Sidebar.tsx` as the active route list.
2. Do not add links for deleted or experimental routes.
3. Update blob SHAs after changing an active file.
4. Record a restore commit only after the change exists on `main`.
5. Confirm `npm run build` passes before marking a baseline deployable.
6. Resident identity remains read-only; workflow results belong in matching operational tables.
