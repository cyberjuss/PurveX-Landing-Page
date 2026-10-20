<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>When a ticket asks for a change you have not made before, where do you start?</p>
</div>

### How to Use These Guides

Each guide below is one job the help desk does on the domain controller, written as steps you can follow in your own lab. The challenges link here from the task that needs it.

Read the whole ticket first. These guides show how to make a change. The ticket tells you which object to change and whether you should.

### Create a User

New accounts belong in their department's Users OU, never in the default Users container.

1. Open Active Directory Users and Computers with Win+R and `dsa.msc`.
2. Expand Departments, then the department, then Users.
3. Right-click Users and choose **New → User**. Enter the first name, last name and the user logon name in the firm's `first.last` format.
4. Set a temporary password. The domain refuses a short or simple one, so use a long one with mixed case and a number.
5. Tick **User must change password at next logon**.
6. Open the new account, go to **Member Of** and add the groups the role needs. Copy them from a current colleague in the same role, after checking that colleague's groups are right.

In PowerShell:

`New-ADUser -Name "First Last" -SamAccountName first.last -Path "OU=Users,OU=<Department>,OU=Departments,DC=purvexfinancial,DC=local" -AccountPassword (Read-Host -AsSecureString) -ChangePasswordAtLogon $true -Enabled $true`

### Disable an Account

A leaver or an unused machine is disabled, not deleted. A disabled object keeps its history, its groups and its Description for auditors, and it can be turned back on.

1. Open Active Directory Users and Computers with Win+R and `dsa.msc`.
2. Find the user or computer. Right-click the domain and choose **Find** if you do not know which OU it is in.
3. Read the Description on the General tab before you change anything. It often names a ticket or an owner.
4. Right-click the object and choose **Disable Account**.
5. The icon gains a small down arrow. That is the confirmation.

In PowerShell:

`Disable-ADAccount <username>`

`Get-ADComputer <computername> | Disable-ADAccount`

### Security and Distribution Groups

Active Directory has two types of group, and only one of them can grant access.

- A **Security** group can be given permissions on files, shares and policy.
- A **Distribution** group is a mailing list. Put it on a folder's permissions and it grants nothing.

To check or change the type:

1. Open the group in Active Directory Users and Computers.
2. Read **Group type** on the General tab.
3. To change it, select the other type and click Apply. The members stay the same.

In PowerShell:

`Get-ADGroup "<group name>" | Select-Object Name, GroupCategory`

`Set-ADGroup "<group name>" -GroupCategory Security`

### Clear Password Never Expires

**Password never expires** is set on purpose on a service account, because a job cannot type a new password. On a person's account it is an audit finding.

1. Find every account with the setting by running `Search-ADAccount -PasswordNeverExpires -UsersOnly | Select-Object Name, SamAccountName`.
2. Skip service accounts. They are named `svc-` and live in ServiceAccounts.
3. Open the person's account, go to the **Account** tab, and scroll the Account options list.
4. Clear **Password never expires** and click Apply. Do not disable the account.

### Find Objects in the Default Containers

A user or computer created without choosing an OU lands in a default container at the top of the domain. No OU-linked Group Policy reaches it there.

1. In Active Directory Users and Computers, expand the domain and open each default container.
2. If a container looks empty, choose **View → Filter Options** and show all types of objects.
3. Right-click a stray object and choose **Move**, then pick the right OU.
4. Press F5 if the move does not show. The console keeps the view it drew first.

In PowerShell, an object's distinguished name shows exactly where it sits:

`(Get-ADComputer <computername>).DistinguishedName`

### Fix a DNS Record

When an IP address works but a name does not, the network is fine and the name points somewhere wrong.

1. On the domain controller, run `Resolve-DnsName <name>` to see what the name resolves to.
2. Run `ipconfig` to see the domain controller's own address.
3. Open DNS Manager with Win+R and `dnsmgmt.msc`, then go to Forward Lookup Zones → `purvexfinancial.local`.
4. Find the host record. If one name has two A records, DNS hands them out in turn, so one bad address breaks every other lookup.
5. Edit the wrong record or delete the stale one. Change only the record the ticket is about.
6. Run `Clear-DnsClientCache`. The old answer sits in the cache and makes a correct fix look wrong.

### Disable a Firewall Rule

1. Open Windows Defender Firewall with Advanced Security with Win+R and `wf.msc`.
2. Select **Inbound Rules** and sort by Name or Group.
3. Open the rule and read its **Protocols and Ports** and **Scope** tabs, so you know what it lets in and from where.
4. Right-click the rule and choose **Disable Rule**. Disable rather than delete, so the change can be reversed.
5. Leave the built-in Remote Desktop rules enabled. They carry your own connection to the lab.

In PowerShell:

`Get-NetFirewallRule -Direction Inbound -Enabled True | Select-Object DisplayName, Description`

`Disable-NetFirewallRule -DisplayName "<rule name>"`

### Link a GPO to an OU

A GPO applies only where it is linked. The policy itself lives once under Group Policy Objects, and each link points to it.

1. Open Group Policy Management with Win+R and `gpmc.msc`.
2. Expand Group Policy Objects, select the GPO and read its **Scope** tab. It lists every place the GPO is linked.
3. To add a link, right-click the OU and choose **Link an Existing GPO**.
4. To remove a link, right-click the link under the OU and choose **Delete**. That removes the link only.
5. Never delete the GPO under Group Policy Objects to remove a link. That deletes the policy everywhere.

### Set the Account Lockout Policy

Lockout for domain accounts lives in the Default Domain Policy, not on each account.

1. Open Group Policy Management with Win+R and `gpmc.msc`.
2. Right-click **Default Domain Policy** under the domain and choose **Edit**.
3. Go to Computer Configuration → Policies → Windows Settings → Security Settings → Account Policies → Account Lockout Policy.
4. Set the threshold, the lockout duration and the time before the counter resets.
5. Run `gpupdate /force`, then confirm with `Get-ADDefaultDomainPasswordPolicy`.

A duration of 0 means an administrator has to unlock the account by hand.

### Apply a Fine-Grained Password Policy

The domain password policy covers everyone. A stricter one for a single group is a Password Settings Object.

1. Open Active Directory Administrative Center with Win+R and `dsac.exe`.
2. Go to System → Password Settings Container, then **New → Password Settings**.
3. Give it a name and a precedence. A lower number wins when two policies apply.
4. Set the minimum length and the lockout settings.
5. Under **Directly Applies To**, add the group, not each person.
6. Confirm with `Get-ADFineGrainedPasswordPolicy -Filter *`.

### Turn On Process Auditing

Recording every program that starts is an advanced audit setting, not one of the nine basic audit categories.

1. Open Group Policy Management with Win+R and `gpmc.msc`, then edit **Default Domain Controllers Policy**.
2. Go to Computer Configuration → Policies → Windows Settings → Security Settings → Advanced Audit Policy Configuration → Audit Policies → Detailed Tracking.
3. Open **Audit Process Creation**, tick Configure, and tick Success.
4. Run `gpupdate /force`, then confirm with `auditpol /get /subcategory:"Process Creation"`.
5. Start any program and look for the new event in the Security log.

### Change the Security Log Size

A Security log that is too small overwrites the evidence you need before anyone reads it.

1. Open Event Viewer with Win+R and `eventvwr.msc`.
2. Expand Windows Logs, right-click **Security** and choose **Properties**.
3. Note the current maximum size before you change it. Once it is raised, the old value is gone.
4. Enter the new size in KB. 512 MB is 524288 KB.
5. Leave it set to overwrite events as needed, so the log never stops recording.

In PowerShell, which reports bytes:

`Get-WinEvent -ListLog Security | Select-Object MaximumSizeInBytes`

### Quarantine a File

A file you suspect is moved out of reach without being opened. Opening it is what runs it.

1. In File Explorer, open the **View** tab and tick **File name extensions**. Windows hides them by default, so a program can pass for a document.
2. Compare the files' types, sizes and modified times.
3. **Cut** the file and paste it into `C:\PurveX\Quarantine`. Cut rather than copy, so it no longer sits on the share.
4. Do not open, rename or double-click it on the way.

In PowerShell:

`Get-ChildItem <folder> | Select-Object Name, Length, LastWriteTime`

`Move-Item <file> C:\PurveX\Quarantine`
