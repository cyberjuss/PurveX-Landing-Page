<#
.SYNOPSIS
    Builds the Range lab image: a Windows Server 2022 domain controller with
    PurveX Financial and the ticket-queue objects already in it.

.DESCRIPTION
    Launches a builder server with setup.ps1 as user data, waits while it
    creates the forest, restarts, builds the lab and shuts itself down (about
    30 to 45 minutes), then saves it as an image and removes the builder.
    Rebuild monthly, then set HOSTED_LAB_AMI in Vercel to the new image.

.EXAMPLE
    ./build-image.ps1 -SubnetId subnet-0abc -SecurityGroupId sg-0abc
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)] [string]$SubnetId,
    [Parameter(Mandatory)] [string]$SecurityGroupId,
    [string]$Region = "us-east-1",
    [string]$ScriptUrl = "https://purvex.io/lab-scripts/Build-Environment.ps1",
    [string]$InitialPassword = "PurveX-Lab-2026!",
    [string]$AwsProfile = "",
    # Lets you open a shell on the builder through Session Manager if setup fails. Not kept in the image.
    [string]$SessionProfile = "casefile-lab-gateway"
)

$ErrorActionPreference = "Stop"
$aws = @("--region", $Region, "--output", "text")
if ($AwsProfile) { $aws += @("--profile", $AwsProfile) }

# The recovery password is never needed again, so it is random and not kept.
function New-Secret {
    $bytes = New-Object byte[] 18
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    "Dsrm-" + [Convert]::ToBase64String($bytes).Replace("+", "x").Replace("/", "y").Replace("=", "") + "-7q"
}

# Runs the AWS CLI and stops the script if it fails. Windows PowerShell 5.1 does not stop on a
# failed native command by itself, and it strips double quotes from JSON arguments, so JSON goes
# through files.
function Invoke-Aws {
    $ErrorActionPreference = "Continue"
    $out = & aws @args @aws 2>&1
    if ($LASTEXITCODE -ne 0) { throw "aws $($args[0]) $($args[1]) failed: $($out | Out-String)" }
    return ($out | Out-String).Trim()
}

$tmp = [IO.Path]::GetTempPath()
$base = Invoke-Aws ssm get-parameter --name /aws/service/ami-windows-latest/Windows_Server-2022-English-Full-Base --query Parameter.Value
Write-Host "Base image: $base"

$setup = Get-Content -LiteralPath (Join-Path $PSScriptRoot "setup.ps1") -Raw
$setup = $setup.Replace("__DSRM_PASSWORD__", (New-Secret)).Replace("__INITIAL_PASSWORD__", $InitialPassword.Replace("'", "''")).Replace("__SCRIPT_URL__", $ScriptUrl)
$userData = Join-Path $tmp "casefile-image-userdata.txt"
# persist=true: user data runs again after the forest restart.
Set-Content -LiteralPath $userData -Value "<powershell>`r`n$setup`r`n</powershell>`r`n<persist>true</persist>" -Encoding ASCII
$disk = Join-Path $tmp "casefile-image-disk.json"
Set-Content -LiteralPath $disk -Encoding ASCII -Value '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":60,"VolumeType":"gp3","Encrypted":true,"DeleteOnTermination":true}}]'

$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$tags = "ResourceType=instance,Tags=[{Key=Name,Value=casefile-image-builder-$stamp},{Key=casefile-image-builder,Value=true}]"
try {
    $id = Invoke-Aws ec2 run-instances --image-id $base --instance-type t3.medium --subnet-id $SubnetId --security-group-ids $SecurityGroupId `
        --user-data "file://$userData" --block-device-mappings "file://$disk" --metadata-options "HttpTokens=required" `
        --credit-specification "CpuCredits=unlimited" --tag-specifications $tags --query "Instances[0].InstanceId" `
        --iam-instance-profile "Name=$SessionProfile"
}
finally {
    Remove-Item -LiteralPath $userData, $disk -Force -ErrorAction SilentlyContinue
}
Write-Host "Builder $id is running setup. This takes about 30 to 45 minutes."

# setup.ps1 writes RANGE: lines to the serial console. Show new ones as they arrive.
$seen = @{}
$deadline = (Get-Date).AddMinutes(75)
do {
    Start-Sleep -Seconds 60
    $state = Invoke-Aws ec2 describe-instances --instance-ids $id --query "Reservations[0].Instances[0].State.Name"
    $console = try { Invoke-Aws ec2 get-console-output --instance-id $id --latest --query Output } catch { "" }
    foreach ($line in ($console -split "`r?`n" | Where-Object { $_ -match "RANGE:" })) {
        $text = $line.Substring($line.IndexOf("RANGE:"))
        if (-not $seen[$text]) { $seen[$text] = $true; Write-Host "  $text" }
        if ($text -match "FAILED") { throw "The builder reported a failure. It is still running as $id so you can read C:\ProgramData\PurveX\image-setup.log through Session Manager." }
    }
    if ((Get-Date) -gt $deadline) {
        throw "The builder did not finish in 75 minutes. It is still running as $id. Read C:\ProgramData\PurveX\image-setup.log through Session Manager."
    }
} while ($state -ne "stopped")

$name = "casefile-dc-$stamp"
$ami = Invoke-Aws ec2 create-image --instance-id $id --name $name --description "Range lab: PurveX Financial domain controller" `
    --tag-specifications "ResourceType=image,Tags=[{Key=Name,Value=$name},{Key=casefile-lab-image,Value=true}]" --query ImageId
Write-Host "Saving image $ami (about 10 to 20 minutes) ..."
# The CLI waiter gives up after 10 minutes, and a 50 GB Windows image can take longer.
do {
    Start-Sleep -Seconds 30
    $imageState = Invoke-Aws ec2 describe-images --image-ids $ami --query "Images[0].State"
    if ($imageState -eq "failed") { throw "AWS could not save the image. The builder $id is still there to try again." }
} while ($imageState -ne "available")
Invoke-Aws ec2 terminate-instances --instance-ids $id | Out-Null
Write-Host ""
Write-Host "Image ready: $ami" -ForegroundColor Green
Write-Host "Set HOSTED_LAB_AMI=$ami in Vercel, then redeploy."
