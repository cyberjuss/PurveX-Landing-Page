import type { Check } from "@/lib/academy-drills";

/**
 * The PowerShell that satisfies one resolve check, so a live test can play the
 * student and prove an incident is winnable.
 *
 * Firing an incident and watching the damage appear only shows half of it. The
 * half that matters to someone paying for this is whether doing the right
 * thing closes the incident, and that half had never been tested: the first
 * live run could not even measure it for the four ticket-kind incidents,
 * because they plant no damage at all. They ask for work. Nobody had ever
 * checked that the work, once done, is accepted.
 *
 * Derived from the check rather than written per incident, so a new incident
 * is covered the moment its checks are declared. A check with no remediation
 * here returns null and the harness says so instead of guessing.
 */
export function remediate(c: Check): string | null {
  const q = (v: string) => `'${v.replace(/'/g, "''")}'`;
  switch (c.t) {
    case "member":
      return c.want
        ? `Add-ADGroupMember -Identity ${q(c.group)} -Members ${q(c.sam)} -ErrorAction SilentlyContinue`
        : `Remove-ADGroupMember -Identity ${q(c.group)} -Members ${q(c.sam)} -Confirm:$false -ErrorAction SilentlyContinue`;
    case "enabled":
      return `${c.want ? "Enable-ADAccount" : "Disable-ADAccount"} -Identity ${q(c.sam)} -ErrorAction SilentlyContinue`;
    case "flag":
      if (c.flag === "lockedOut") {
        // Only one direction is a fix. Locking somebody out is the incident.
        return c.want ? null : `Unlock-ADAccount -Identity ${q(c.sam)} -ErrorAction SilentlyContinue`;
      }
      if (c.flag === "passwordExpired") {
        return c.want ? null : `Set-ADUser -Identity ${q(c.sam)} -ChangePasswordAtLogon $false -ErrorAction SilentlyContinue`;
      }
      return `Set-ADAccountControl -Identity ${q(c.sam)} -${
        { pwdNotRequired: "PasswordNotRequired", noPreAuth: "DoesNotRequirePreAuth", delegation: "TrustedForDelegation" }[c.flag]
      } $${c.want} -ErrorAction SilentlyContinue`;
    case "noexpire":
      return `Set-ADUser -Identity ${q(c.sam)} -PasswordNeverExpires $${c.want} -ErrorAction SilentlyContinue`;
    case "container":
      // Double quotes on purpose: the domain DN is a subexpression and
      // PowerShell does not expand anything inside single quotes, so quoting
      // this the way every other case is quoted moved the account to a
      // container literally called "$($d.DistinguishedName)" -- which fails,
      // quietly, because the whole line carries -ErrorAction SilentlyContinue.
      return `Move-ADObject -Identity (Get-ADUser ${q(c.sam)}).DistinguishedName -TargetPath "${c.ou},$($d.DistinguishedName)" -ErrorAction SilentlyContinue`;
    case "spn":
      // Clearing them is the fix; adding one is the attack.
      return c.want ? null : `Set-ADUser -Identity ${q(c.sam)} -ServicePrincipalNames @{Replace=@()} -ErrorAction SilentlyContinue`;
    case "computer":
      return `${c.enabled ? "Enable-ADAccount" : "Disable-ADAccount"} -Identity (Get-ADComputer ${q(c.name)}).DistinguishedName -ErrorAction SilentlyContinue`;
    case "policy": {
      const map: Record<string, string> = {
        minLength: "MinPasswordLength",
        complexity: "ComplexityEnabled",
        history: "PasswordHistoryCount",
        lockoutThreshold: "LockoutThreshold",
        reversible: "ReversibleEncryptionEnabled",
      };
      if (c.key === "lockoutDurationMin" || c.key === "lockoutWindowMin") {
        const name = c.key === "lockoutDurationMin" ? "LockoutDuration" : "LockoutObservationWindow";
        return `Set-ADDefaultDomainPasswordPolicy -Identity $d.DistinguishedName -${name} (New-TimeSpan -Minutes ${Math.max(c.min ?? 30, 30)}) -ErrorAction SilentlyContinue`;
      }
      const name = map[c.key];
      if (!name) return null;
      if (c.bool !== undefined) return `Set-ADDefaultDomainPasswordPolicy -Identity $d.DistinguishedName -${name} $${c.bool} -ErrorAction SilentlyContinue`;
      // A max with no min means "bring it back down", and a min means "raise it".
      const value = c.min !== undefined ? c.min : c.max;
      if (value === undefined) return null;
      return `Set-ADDefaultDomainPasswordPolicy -Identity $d.DistinguishedName -${name} ${value} -ErrorAction SilentlyContinue`;
    }
    case "group":
      if (c.category) return `Set-ADGroup -Identity ${q(c.name)} -GroupCategory ${c.category} -ErrorAction SilentlyContinue`;
      return null;
    case "audit": {
      // Not an AD cmdlet, but auditpol is exactly what the ticket's own
      // runbook tells the student to use, so it is the real fix rather than a
      // stand-in for one.
      const success = c.need === "Success" || c.need === "Both" ? " /success:enable" : "";
      const failure = c.need === "Failure" || c.need === "Both" ? " /failure:enable" : "";
      return `auditpol /set /subcategory:"${c.sub}"${success}${failure} | Out-Null`;
    }
    case "pso": {
      // Two steps, because a policy that applies to nobody satisfies nothing.
      const name = "Range Test Admin Policy";
      const lock = c.maxLockout ?? 5;
      return [
        `if (-not (Get-ADFineGrainedPasswordPolicy -Filter "Name -eq '${name}'" -ErrorAction SilentlyContinue)) {`,
        `  New-ADFineGrainedPasswordPolicy -Name '${name}' -Precedence 10 -MinPasswordLength ${c.minLength}`,
        `    -LockoutThreshold ${lock} -LockoutDuration (New-TimeSpan -Minutes 30) -LockoutObservationWindow (New-TimeSpan -Minutes 30) -ErrorAction SilentlyContinue }`,
        `Add-ADFineGrainedPasswordPolicySubject -Identity '${name}' -Subjects ${q(c.appliesTo)} -ErrorAction SilentlyContinue`,
      ].join(" ");
    }
    // DNS records, firewall rules, GPO links and files are not one cmdlet
    // away, and guessing at them would test the guess.
    default:
      return null;
  }
}
