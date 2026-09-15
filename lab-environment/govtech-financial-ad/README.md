# GovTech Financial AD lab -- build scripts

Builds the Active Directory environment described on the course's Home Lab
page (`/academy/phase-1/home-lab-active-directory`): 5 departments, 9 users,
8 custom security groups, and 1 workstation, all under the
`govtechfinancial.local` domain.

**Instructor-only.** This is infrastructure tooling for standing up the
actual lab VMs/network, not student-facing content -- it isn't linked from
the site and shouldn't be.

## What's here

| File | Purpose |
| --- | --- |
| `Install-Forest.ps1` | One-time bootstrap: promotes a clean Windows Server to the `govtechfinancial.local` forest root. Skip this if the domain already exists. |
| `Build-Environment.ps1` | Idempotent: creates the OUs, groups, users, and workstation object. Safe to re-run any time. |

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
2. Log back in as `GOVTECHFINANCIAL\Administrator` after reboot.
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

- **The Org Chart / Data Categories tabs** -> 5 department OUs (`IT`,
  `Compliance`, `WealthManagement`, `Operations`, `FinanceAccounting`)
  under `OU=Departments`, each with a `Users` sub-OU and a standard
  security group (`IT Users`, `Compliance Users`, `Wealth Management Users`,
  `Operations Users`, `Finance Accounting Users`).
- **Administrative Roles tab** -> Level 1 is the built-in `Domain Admins`
  group (nothing to create). Level 2 (`Server Admins`) and Level 3
  (`Helpdesk`) are created as empty groups under `OU=AccessLevels` --
  membership isn't specified on the site, so the script doesn't guess at
  it; assign accounts to these as your specific investigation scenarios
  call for it.
- **Full User Directory tab** -> all 9 users, in the right department OU,
  in the right group, with title and department set as AD attributes. Alex
  Rivera is additionally added to `IT Admins` (the one elevated-access user
  described on the site).
- **The Client Workstation tab** -> a pre-staged computer object under
  `IT/Workstations`. The site names it "IT WKS01"; since AD computer names
  can't contain spaces, the object is created as `IT-WKS01`. This only
  creates the AD object -- join an actual machine to the domain with that
  name to complete it (`Add-Computer -DomainName govtechfinancial.local
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

The script is additive and idempotent -- it never deletes or resets
anything. To tear down and start clean, remove the `Departments` and
`AccessLevels` OUs (you'll need to turn off
`ProtectedFromAccidentalDeletion` first, since the build script sets it):

```powershell
Get-ADOrganizationalUnit -Filter * |
    Where-Object { $_.DistinguishedName -match "OU=(Departments|AccessLevels)," } |
    Set-ADObject -ProtectedFromAccidentalDeletion $false -PassThru |
    Remove-ADOrganizationalUnit -Recursive -Confirm:$false
```

## Keeping this in sync with the site

If the Home Lab page's content changes (a department, user, or group is
added/renamed), update the data tables in `Build-Environment.ps1` to match
-- the script doesn't read the site's content automatically.
