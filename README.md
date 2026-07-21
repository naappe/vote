# Vote Operations — Villimalé 2026

Campaign operations platform for resident records, outreach, field work, assignments, election-day coordination, transportation, verification, reporting, and controlled workflow sharing.

## Live application

Canonical GitHub Pages address:

- https://naappe.github.io/Vote/

The exported application uses the `/Vote` base path configured in `next.config.js`.

## Active routes

Only these routes are part of the current application:

| Section | Route | Purpose |
|---|---|---|
| Dashboard | `/Vote/` | Operational overview and campaign metrics |
| Residents | `/Vote/residents/` | Searchable, paginated resident identity directory |
| Resident profile | `/Vote/resident-profile/?id=<resident_id>` | Read-only resident profile and contact-correction request |
| Call Center | `/Vote/call-center/` | Manual call outcomes, vote answer, support and notes |
| Door-to-Door | `/Vote/door-to-door/` | Field visit results and resident outreach |
| Assignments | `/Vote/assignments/` | Assignment workflow and responsibility tracking |
| Remarks | `/Vote/remarks/` | Operational remarks history |
| Election Day | `/Vote/election-day/` | Reach and turnout operations |
| Transportation | `/Vote/transportation/` | Election-box transport planning and status updates |
| Contact Verification | `/Vote/contact-verification/` | Review requested phone and living-place corrections |
| Reports | `/Vote/reports/` | Campaign reporting |
| Shared workflow | `/Vote/share/?token=<token>` | Restricted resident subset created by a workflow share |

Do not restore or document routes that are not present in the current sidebar and `app/` structure.

## Application model

### Resident identity master

The Supabase `Resident` table is the source of truth for resident identity data.

Resident identity is read-only inside operational sections. Requested phone or living-place corrections are submitted to `contact_verification` and reviewed separately.

### Operational tables

Workflow results are stored in their matching tables instead of overwriting resident identity:

- `call_center`
- `door_to_door`
- `assignments`
- `remarks`
- `election_day`
- `transportation`
- `contact_verification`
- `workflow_shares`

### Core workflow rules

- Residents is the read-only master directory.
- Call Center saves only call-owned fields and keeps manual call results separate from resident identity.
- Connected calls may record vote answer and support.
- Pending calls remain in the Need Call queue and do not increase attempts.
- Door-to-Door, Assignments, Election Day, Transportation and Remarks save to their own operational tables.
- Transportation is organized and filtered by election box.
- Share links contain a controlled resident ID subset and are generated from workflow filters.

## Resident directory

The Residents page supports:

- 24 residents per page
- server-facing pagination interface
- search by name, national ID, phone, record ID, address or election box
- house filter
- party filter
- gender filter
- age filter
- election-box filter
- gallery and list views
- resident profile links without Next.js prefetching

## Technology

- Next.js 15 static export
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- GitHub Pages
- GitHub Actions

## Key source files

| Area | File |
|---|---|
| Root page | `app/page.tsx` |
| Shared application layout | `layout/AppLayout.tsx` |
| Current navigation and routes | `layout/Sidebar.tsx` |
| Resident directory | `components/VoterManagementContent.tsx` |
| Call Center | `components/CallCenterContent.tsx` |
| Transportation | `components/TransportationContent.tsx` |
| Resident and call data access | `lib/supabase.ts` |
| Election, transport and share operations | `lib/operations.ts` |
| Static-export configuration | `next.config.js` |
| Pages deployment | `.github/workflows/deploy.yml` |

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`.

The workflow:

1. Checks out the latest `main` branch.
2. Uses Node.js 20.
3. Runs `npm install`.
4. Runs `npm run build`.
5. Verifies `out/index.html`.
6. Uploads `out/` to GitHub Pages.

Required repository secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Local verification:

```bash
npm install
npm run build
```

## Active file SHA baseline

| File | Blob SHA |
|---|---|
| `package.json` | `27db2072ca5cb6803a12605c7f9ff202951b1b16` |
| `next.config.js` | `c0a0e030ae27191a6b54cbff80c44a191fd89763` |
| `app/page.tsx` | `700f79b67ac14f31d1db03b9018820a462d8c148` |
| `layout/AppLayout.tsx` | `5db08dfb94fafbd72131e31cd2a318964fe3cac4` |
| `layout/Sidebar.tsx` | `3f8812d93a81b14e8990e3e29d04a53e960c9a7a` |
| `components/VoterManagementContent.tsx` | `d2cd15b34df2313f486cb271002a5c7237f70593` |
| `components/CallCenterContent.tsx` | `9047f9b5e16c5e702958c069cf3860fbadfb5c88` |
| `components/TransportationContent.tsx` | `e518d1e09a647492aefb7ef2f5edcf2e95c48158` |
| `lib/supabase.ts` | `99db428641269ea39be8011c3a7d8c5f473a051e` |
| `lib/operations.ts` | `3f7bf834688333f5e50dbad247931490bae10aab` |
| `.github/workflows/deploy.yml` | `c30bd2cfb907e0ca0b4504d9575f4a1cb831a72e` |

See `SHAS.md` for the documentation baseline and recent restore commits.

## Documentation maintenance

After a structural change:

1. Remove links to deleted routes.
2. Update the active route table from `layout/Sidebar.tsx`.
3. Update the active file SHA table.
4. Record the documentation and functional restore commits in `SHAS.md`.
5. Run `npm run build` before treating the change as deployable.
