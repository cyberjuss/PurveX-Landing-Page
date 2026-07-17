[Version]
Class=IEXPRESS
SEDVersion=3

[Options]
PackagePurpose=InstallApp
ShowInstallProgramWindow=1
HideExtractAnimation=0
UseLongFileName=1
InsideCompressed=0
CAB_FixedSize=0
CAB_ResvCodeSigning=0
RebootMode=N
InstallPrompt=%InstallPrompt%
DisplayLicense=%DisplayLicense%
FinishMessage=%FinishMessage%
TargetName=%TargetName%
FriendlyName=%FriendlyName%
AppLaunched=%AppLaunched%
PostInstallCmd=%PostInstallCmd%
AdminQuietInstCmd=%AdminQuietInstCmd%
UserQuietInstCmd=%UserQuietInstCmd%
SourceFiles=SourceFiles

[SourceFiles]
SourceFiles0=C:\Users\justi\OneDrive\Documentos\Purvex\PurveX\frontend\installer\

[SourceFiles0]
%FILE0%=
%FILE1%=

[Strings]
InstallPrompt=
DisplayLicense=
FinishMessage=PurveX setup has finished launching.
TargetName=C:\Users\justi\OneDrive\Documentos\Purvex\PurveX\frontend\public\downloads\PurveX-Setup.exe
FriendlyName=PurveX Setup
AppLaunched=cmd.exe /c PurveX-Setup.cmd
PostInstallCmd=<None>
AdminQuietInstCmd=
UserQuietInstCmd=
FILE0=bootstrap_windows.ps1
FILE1=PurveX-Setup.cmd
