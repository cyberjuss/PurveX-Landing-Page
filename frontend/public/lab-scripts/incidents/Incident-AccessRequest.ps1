# An access request: a staff member needs a legitimate group added. The student's
# job is to ADD them; this just guarantees they start OUT of the group. Undo also
# leaves them out, so the lab is clean for the next shift.
# -Sam is the requester, -Group the access they need (defaults for a standalone run).
param([switch]$Undo, [string]$Sam = "priya.nair", [string]$Group = "Compliance Users")
$ErrorActionPreference = "Continue"
. "$PSScriptRoot\Incident-Common.ps1"
if (-not (Confirm-User $Sam)) { return }

Remove-ADGroupMember -Identity $Group -Members $Sam -Confirm:$false -ErrorAction SilentlyContinue
