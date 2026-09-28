<#
.SYNOPSIS
    Builds the CaseFile lab image: a Windows Server 2022 domain controller with
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
    [string]$AwsProfile = ""
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

$base = aws ssm get-parameter --name /aws/service/ami-windows-latest/Windows_Server-2022-English-Full-Base --query Parameter.Value @aws
Write-Host "Base image: $base"

$setup = Get-Content -LiteralPath (Join-Path $PSScriptRoot "setup.ps1") -Raw
$setup = $setup.Replace("__DSRM_PASSWORD__", (New-Secret)).Replace("__INITIAL_PASSWORD__", $InitialPassword.Replace("'", "''")).Replace("__SCRIPT_URL__", $ScriptUrl)
$userData = Join-Path ([IO.Path]::GetTempPath()) "casefile-image-userdata.txt"
# persist=true: user data runs again after the forest restart.
Set-Content -LiteralPath $userData -Value "<powershell>`r`n$setup`r`n</powershell>`r`n<persist>true</persist>" -Encoding ASCII

$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$disk = '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":50,"VolumeType":"gp3","Encrypted":true,"DeleteOnTermination":true}}]'
$tags = "ResourceType=instance,Tags=[{Key=Name,Value=casefile-image-builder-$stamp},{Key=casefile-image-builder,Value=true}]"
$id = aws ec2 run-instances --image-id $base --instance-type t3.medium --subnet-id $SubnetId --security-group-ids $SecurityGroupId `
    --user-data "file://$userData" --block-device-mappings $disk --metadata-options "HttpTokens=required" `
    --credit-specification "CpuCredits=unlimited" --tag-specifications $tags --query "Instances[0].InstanceId" @aws
Remove-Item -LiteralPath $userData -Force
Write-Host "Builder $id is running setup. This takes about 30 to 45 minutes."

$deadline = (Get-Date).AddMinutes(75)
do {
    Start-Sleep -Seconds 60
    $state = aws ec2 describe-instances --instance-ids $id --query "Reservations[0].Instances[0].State.Name" @aws
    Write-Host ("  {0:HH:mm}  {1}" -f (Get-Date), $state)
    if ((Get-Date) -gt $deadline) {
        throw "The builder did not finish in 75 minutes. See its boot log with: aws ec2 get-console-output --instance-id $id --latest. Setup writes C:\ProgramData\PurveX\image-setup.log on the builder."
    }
} while ($state -ne "stopped")

$name = "casefile-dc-$stamp"
$ami = aws ec2 create-image --instance-id $id --name $name --description "CaseFile lab: PurveX Financial domain controller" `
    --tag-specifications "ResourceType=image,Tags=[{Key=Name,Value=$name},{Key=casefile-lab-image,Value=true}]" --query ImageId @aws
Write-Host "Saving image $ami ..."
aws ec2 wait image-available --image-ids $ami @aws
aws ec2 terminate-instances --instance-ids $id @aws | Out-Null
Write-Host ""
Write-Host "Image ready: $ami" -ForegroundColor Green
Write-Host "Set HOSTED_LAB_AMI=$ami in Vercel, then redeploy."
