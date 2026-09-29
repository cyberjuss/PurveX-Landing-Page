# Range hosted labs

Each student gets their own PurveX Financial domain controller in AWS. They click the lab button in Range and it opens in a browser tab. On first boot the lab links itself to the student with its own lab key and installs the same sync task a self-hosted lab uses, so Coach, the MCP server, mission checks and the portfolio see it the same way.

```
Student ── lab button ──> Range ── AWS API ──> their EC2 lab (cloned from the image)
Student ── browser tab ─> lab.purvex.io (Guacamole) ── remote desktop ──> their lab
Their lab ── sync every minute ──> Range ──> Coach · MCP · missions · portfolio
```

| Folder | What it is |
|---|---|
| `terraform/` | The shared AWS pieces: network, security groups, the Guacamole gateway, Range's limited AWS login, a budget alert. |
| `image/` | Builds the lab image: forest, PurveX Financial, ticket-queue objects, speed tuning. |
| `frontend/src/lib/academy-hosted.ts` | Range side: creates, starts, stops and resets each student's lab, and signs the browser link. |

## Build the first lab

You need the AWS CLI signed in as an admin (`aws sts get-caller-identity` works) and Terraform.

**1. Shared AWS pieces** (about 5 minutes)

```powershell
cd lab-environment/hosted/terraform
terraform init
terraform apply -var "alert_email=you@example.com"
```

**2. DNS.** Add an A record for `lab.purvex.io` pointing at the `gateway_ip` output. The gateway gets its HTTPS certificate on its own once the record resolves.

**3. The lab image** (about 30 to 45 minutes, unattended)

```powershell
cd ../image
./build-image.ps1 -SubnetId (terraform -chdir=../terraform output -raw lab_subnet_id) `
                  -SecurityGroupId (terraform -chdir=../terraform output -raw lab_security_group_id)
```

It prints the new image ID at the end.

**4. Supabase.** Run the end of `frontend/supabase/academy.sql` (the `academy_lab_keys` and `academy_hosted_labs` tables).

**5. Vercel environment.** Print the values with `terraform -chdir=terraform output -json vercel_env` and add each one, plus:

| Name | Value |
|---|---|
| `HOSTED_LAB_AMI` | The image ID from step 3 |
| `HOSTED_LAB_EMAILS` | Who can use a hosted lab. Start with your own email. `*` turns it on for everyone. |
| `CRON_SECRET` | Any long random string. Vercel sends it to the auto-stop job. |

Redeploy.

**6. Test it.** Sign in to Range with an email on the list. The lab button appears in the header.

- [ ] **Start my lab**: first start takes about 3 minutes, then the button says **Open lab**
- [ ] **Open lab** opens the desktop in a new tab, signed in as Administrator
- [ ] The computer name is unchanged and Active Directory Users and Computers shows PurveX Financial
- [ ] The lab light in Range turns green and Coach can describe the lab
- [ ] Claude connected with an MCP key sees the same lab (`get_lab_state`)
- [ ] An Operation Day One answer passes the lab check
- [ ] Disabling `riley.kwan` shows up in Range within a minute
- [ ] **Stop lab**, then start again: back in about a minute with windows still open
- [ ] It stops on its own after 3 hours unless extended

## Copy it for every student

Nothing to copy by hand. Every student who clicks **Start my lab** gets their own lab from the same image. To open it to a class, add their emails to `HOSTED_LAB_EMAILS` (or use `*`).

Before a class starts, raise the EC2 quota: Service Quotas, "Running On-Demand Standard (A, C, D, H, I, M, R, T, Z) instances". Each lab uses 2 vCPUs, so 20 labs running at once need 40.

## Keeping it running

- **Monthly:** rebuild the image (step 3) and update `HOSTED_LAB_AMI`. New and reset labs use it. Existing labs keep theirs.
- **Costs:** labs stop 3 hours after they start unless the student extends. During the day, Range stops overdue labs whenever anyone checks their lab (at most every 5 minutes). A daily Vercel Cron job at 07:00 UTC stops anything left running overnight. On a Vercel Pro plan you can make the cron run every 15 minutes in `frontend/vercel.json`. The budget alert emails you at 80%.
- **Reset:** a student can reset their own lab from the lab menu. It deletes the old lab and starts a fresh one.
- **Removing a student:** terminate their instance (tag `casefile-user`) and delete their row in `academy_hosted_labs`.

## Things to check on the first build

These depend on AWS behaviour that can only be confirmed on a real account:

- EC2Launch runs each lab's own first-boot script after `EC2Launch.exe reset --clean` in the image. If a lab never links, look at `C:\ProgramData\PurveX\first-boot.log` on it.
- The cloned domain controller keeps its computer name. If EC2Launch renames it, remove the rename task from `C:\ProgramData\Amazon\EC2Launch\config\agent-config.yml` before building the image.
- Hibernation is ready a few minutes after first boot. Before that, Stop does a normal stop, which still keeps the disk.
