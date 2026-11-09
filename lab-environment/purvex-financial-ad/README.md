# PurveX Financial AD lab -- build scripts

Builds the Active Directory environment described in the course's Home Lab
(starting at `/range/phase-1/home-lab-setup`): 5 departments, 9 users,
8 custom security groups, and 1 workstation, all under the
`purvexfinancial.local` domain. It also plants the extra accounts and the
`ServiceAccounts` OU that the Phase 1 challenges are graded against.

**Instructor-only.** This is infrastructure tooling for standing up the
actual lab VMs/network, not student-facing content -- it isn't linked from
the site and shouldn't be.

> **These are copies.** The live scripts, the ones the site serves, hosted
> labs download and the Build the Environment lesson embeds, are in
> `frontend/public/lab-scripts/`, and `Build-Environment.ps1` there is signed.
> Edit those, run `npm run sign:lab-script`, then copy them here. These copies
> were last synced from the live scripts on 2026-11-09.

## What's here

| File | Purpose |
| --- | --- |
| `Install-Forest.ps1` | One-time bootstrap: promotes a clean Windows Server to the `purvexfinancial.local` forest root. Skip this if the domain already exists. |
| `Build-Environment.ps1` | Idempotent: creates the OUs, groups, users, and workstation object. Safe to re-run any time. |
| `Remove-Environment.ps1` | Removes what `Build-Environment.ps1` created, to start the lab over. |

## Prerequisites

- A Windows Server (2019+) that will act as the domain controller, **or**
  a domain that already exists if you're just re-running `Build-Environment.ps1`
  on a management box.
- Run from an elevated (Administrator) PowerShell session.
- `Build-Environment.ps1` needs the `ActiveDirectory` PowerShell module
  (installed automatically with the AD DS role, or via RSAT on a
  management workstation).

## Order of operations

1. **New environment only:** run `Install-Forest.ps1` on the server that
   will be the DC. It installs the AD DS role, promotes the forest, and
   reboots automatically.
2. Log back in as `PURVEXFINANCIAL\Administrator` after reboot.
3. Run `Build-Environment.ps1`. You'll be prompted once for an initial
   password used for all 9 created accounts (every account is created with
   "must change password at next logon," so this password is never a
   long-term credential).
4. Verify (see below).

To preview exactly what a run would do without changing anything:

```powershell
./Build-Environment.ps1 -WhatIf
```

## What gets created

Matches the site's Home Lab tabs directly:

- **The Org Chart and The Data tabs** -> 5 department OUs (`IT`,
  `Compliance`, `WealthManagement`, `Operations`, `FinanceAccounting`)
  under `OU=Departments`, each with a `Users` sub-OU and a standard
  security group (`IT Users`, `Compliance Users`, `Wealth Management Users`,
  `Operations Users`, `Finance Accounting Users`).
- **Access Levels tab** -> Level 1 is the built-in `Domain Admins`
  group (nothing to create). Level 2 (`Server Admins`) and Level 3
  (`Helpdesk`) are created as empty groups under `OU=AccessLevels` --
  membership isn't specified on the site, so the script doesn't guess at
  it; assign accounts to these as your specific investigation scenarios
  call for it.
- **Accounts tab** -> all 9 users, in the right department OU,
  in the right group, with title and department set as AD attributes. Alex
  Rivera is additionally added to `IT Admins` (the one elevated-access user
  described on the site).
- **Join a Computer tab** -> a pre-staged computer object under
  `IT/Workstations`, named `IT-WKS01`. This only
  creates the AD object -- join an actual machine to the domain with that
  name to complete it (`Add-Computer -DomainName purvexfinancial.local
  -NewName IT-WKS01`, run on the workstation itself).

## Verifying the build

```powershell
# OU tree
Get-ADOrganizationalUnit -Filter * | Sort-Object DistinguishedName

# All 9 users with their department/title
Get-ADUser -Filter * -SearchBase "OU=Departments,$((Get-ADDomain).DistinguishedName)" -Properties Title, Department |
    Select-Object Name, SamAccountName, Title, Department

# Group membership check, e.g. IT Admins
Get-ADGroupMember -Identity "IT Admins"
```

## Resetting

`Build-Environment.ps1` is additive and idempotent -- it never deletes or
resets anything. To tear down and start clean, run `Remove-Environment.ps1`.
It deletes the `Departments`, `AccessLevels`, and `ServiceAccounts` OUs and
everything inside them, and asks you to confirm first:

```powershell
./Remove-Environment.ps1 -WhatIf   # preview
./Remove-Environment.ps1
```

## Keeping this in sync with the site

If the Home Lab page's content changes (a department, user, or group is
added/renamed), update the data tables in `Build-Environment.ps1` to match
-- the script doesn't read the site's content automatically.
