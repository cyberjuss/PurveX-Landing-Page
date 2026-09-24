#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Promotes a clean Windows Server into the root domain controller for the
    purvexfinancial.local forest used by the "Think Like a SOC Analyst 101"
    home lab.

.DESCRIPTION
    One-time bootstrap step. Only run this on a fresh server that is not yet
    a domain controller and does not already belong to a domain. It installs
    the AD DS role and promotes the box to a new forest root domain.

    The server reboots automatically at the end of promotion. After reboot,
    log back in as purvexfinancial\Administrator and run
    Build-Environment.ps1 to create the OUs, groups, users, and workstation
    object described on the course's Home Lab page.

.NOTES
    You will be prompted for a Directory Services Restore Mode (DSRM)
    password. This is separate from any domain account password and is only
    used for AD recovery scenarios -- keep it, don't lose it.
#>

[CmdletBinding()]
param(
    [string]$DomainName = "purvexfinancial.local",
    [string]$DomainNetbiosName = "PURVEXFINANCIAL"
)

$ErrorActionPreference = "Stop"

Write-Host "Installing AD DS role..." -ForegroundColor Cyan
Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools

Write-Host "Promoting this server to a new forest root domain: $DomainName" -ForegroundColor Cyan
Write-Host "You will be prompted for a DSRM (recovery mode) password." -ForegroundColor Yellow

Install-ADDSForest `
    -DomainName $DomainName `
    -DomainNetbiosName $DomainNetbiosName `
    -InstallDns:$true `
    -SafeModeAdministratorPassword (Read-Host -AsSecureString -Prompt "DSRM password") `
    -Force:$true

# The server reboots automatically after this cmdlet completes.
