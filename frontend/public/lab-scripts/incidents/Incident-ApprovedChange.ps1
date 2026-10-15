# False alarm: an after-hours group change that is actually an approved change.
# Emits a real 4728 for morgan.lee joining Compliance Users. The student should
# recognise it as approved and leave it. Undo puts her back, because the group
# is her own department's and the baseline has her in it.
param([switch]$Undo)
$ErrorActionPreference = "Continue"
. "$PSScriptRoot\Incident-Common.ps1"
$sam = "morgan.lee"
$group = "Compliance Users"

# morgan.lee is in Compliance Users in the baseline -- it is her own
# department's group. So adding her to it did nothing: no 4728 was written,
# nothing in the lab changed, and the alert described an after-hours change
# that had never happened. On every lab, every time. The student was being
# asked to investigate an event that did not exist.
#
# Undo had the matching fault in reverse: it removed her, leaving her out of
# her own department group and the lab worse than it found it.
if ($Undo) {
    if (Confirm-User $sam) { Add-ADGroupMember -Identity $group -Members $sam -ErrorAction SilentlyContinue }
    return
}
if (Confirm-User $sam) {
    # Out first, so putting her back is a real change and writes a real 4728
    # for the student to find.
    Remove-ADGroupMember -Identity $group -Members $sam -Confirm:$false -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 700
    Add-ADGroupMember -Identity $group -Members $sam -ErrorAction SilentlyContinue
}
