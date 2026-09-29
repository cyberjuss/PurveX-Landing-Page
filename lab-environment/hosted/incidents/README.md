# Shift incident scripts

Each `Incident-*.ps1` plants one real incident in the student's own domain
controller, and undoes it with `-Undo`.

The scripts themselves live in `frontend/public/lab-scripts/incidents/` so the
site serves them. The image build (`image/setup.ps1`) downloads them to
`C:\ProgramData\PurveX\incidents`, and Range fires them through AWS Systems
Manager when an incident arrives during a Shift (see
`frontend/src/lib/academy-hosted.ts` → `injectIncident`).

Everything they do is real: a real group change emits a real 4728, real failed
sign-ins emit 4625, a real lockout emits 4740. The student investigates in
Event Viewer and Active Directory Users and Computers, exactly as on the job.
The lab's minute-by-minute sync then reports the end state, and Range grades it.

Most incidents rotate their victim each shift: Range picks an account from the
roster and passes it as `-Sam` (or `-Targets`/`-Sprayed` for the spray), so no
two shifts hit the same person. The defaults below are what each script does when
run on its own with no args.

| Script | Plants | Resolved when the student… | Undo |
|---|---|---|---|
| Incident-Lockout.ps1 | `-Sam` locked out (default riley.kwan) | unlocks the account | unlock + clear |
| Incident-Spray.ps1 | many 4625, `-Targets` locked (default priya.nair, jordan.ellis) | unlocks the targets, keeps lockout policy | unlock the targets |
| Incident-Disable.ps1 | `-Sam` disabled (default taylor.osei) | re-enables the account | enable the account |
| Incident-PreAuth.ps1 | `-Sam` set to not require Kerberos pre-auth (default priya.nair) | re-requires pre-auth | restore pre-auth |
| Incident-RogueAdmin.ps1 | svc.helpdesk added to IT Admins | removes it from IT Admins | remove from IT Admins |
| Incident-ApprovedChange.ps1 | morgan.lee added to Compliance Users (approved) | leaves it in place | remove morgan.lee |
| Incident-Compromise.ps1 | 4625 then a 4624 on `-Sam` (default jamie.torres) | disables the account | enable the account |
| Incident-WeakPolicy.ps1 | domain password policy weakened | restores length ≥ 12 and lockout | restore baseline |

Notes:
- Account passwords come from the image's `InitialPassword` (default
  `PurveX-Lab-2026!`). Pass `-Password` if the image was built with another.
- On a domain controller, Group Management (4728) and Authentication Policy
  Change (4739) auditing are on by the default DC policy. If an incident's
  event does not appear, enable those audit subcategories in the image.
- These run only on a hosted lab and only when Range fires them; nothing here
  targets a real network. They must be tested on a rebuilt image before a class.
