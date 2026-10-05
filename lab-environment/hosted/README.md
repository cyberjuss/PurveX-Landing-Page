# Range hosted labs

Each student gets their own pod: a PurveX Financial domain controller and an Ubuntu server beside it on the same small network. They click the lab button in Range and both open in a browser tab. On first boot the domain controller links itself to the student with its own lab key and installs the same sync task a self-hosted lab uses, so Coach, the MCP server, mission checks and the portfolio see it the same way.

```
Student ── lab button ──> Range ── AWS API ──> their pod: dc01 (Windows) + web01 (Ubuntu)
Student ── browser tab ─> lab.purvex.io (Guacamole) ── RDP to dc01 · SSH to web01
dc01 ── sync every minute ──> Range ──> Coach · MCP · missions · portfolio
```

The Ubuntu server boots standalone. It is not joined to the domain: joining it is a lab the student does by hand, and the tools a join needs are already installed.

## How one student's pod stays out of another's

A pod is one security group, claimed when the pod is built and released when it is torn down. Inside the group the two machines reach each other on every port, which is what the student needs and what makes the pod feel like a real network. Outside it there is nothing:

- **No student can reach another's lab.** A security group is default-deny, and a pod's group names only itself and the gateway. Student A's Ubuntu box has no route to student B's domain controller even though both sit in the same subnet.
- **Nothing on the internet can open a connection to a lab.** No pod rule names `0.0.0.0/0` inbound. The machines have public addresses so they can reach out for updates, and no rule lets anything reach back.
- **Labs reach the web on 80 and 443 only.** Enough for apt, Windows update and the sync to Range. Not enough to be a useful host for scanning, mail or a shell out.
- **Range cannot change any of that.** The key in Vercel can launch a machine into a group tagged `casefile-pod` and nothing else. It cannot create or edit a group, a subnet or a route, cannot launch into the gateway's group, and cannot launch anything bigger than a lab. Terraform owns the shape of the network, so a leaked key cannot open a lab up or put two students in one group.
- **Two students never share a group.** The slot is claimed under a unique index, so two people pressing Start at the same moment get different groups.

The gateway is the one shared piece. It can reach every pod on 3389 and 22, because that is its job. It has no open port but 443, no shell but Session Manager, and keeps no passwords: each link carries its own, signed and short-lived.

| Folder | What it is |
|---|---|
| `terraform/` | The shared AWS pieces: network, the pool of pod security groups, the Guacamole gateway, Range's limited AWS login, a budget alert. |
| `image/` | Builds the Windows image: forest, PurveX Financial, ticket-queue objects, speed tuning. The Ubuntu side needs no image -- it is Canonical's, set up by cloud-init at first boot. |
| `frontend/src/lib/academy-hosted.ts` | Range side: creates, starts, stops and resets each student's lab, and signs the browser link. |

## Build the first lab

You need the AWS CLI signed in as an admin (`aws sts get-caller-identity` works) and Terraform.

**1. Shared AWS pieces** (about 5 minutes; the pod groups make it a few minutes longer)

```powershell
cd lab-environment/hosted/terraform
terraform init
terraform apply -var "alert_email=you@example.com"
```

Pass the same `alert_email` every time. It is baked into the gateway's start-up script, so a different address changes the script, and Terraform then rebuilds the gateway and re-requests its certificate. Check `terraform plan` for `aws_instance.gateway must be replaced` before applying; if you see it and you did not mean to rebuild the gateway, the email is wrong.

**2. DNS.** Add an A record for `lab.purvex.io` pointing at the `gateway_ip` output. The gateway gets its HTTPS certificate on its own once the record resolves.

**3. The lab image** (about 30 to 45 minutes, unattended)

```powershell
cd ../image
./build-image.ps1 -SubnetId (terraform -chdir=../terraform output -raw lab_subnet_id) `
                  -SecurityGroupId (terraform -chdir=../terraform output -raw lab_security_group_id)
```

It prints the new image ID at the end.

**4. Supabase.** Run the end of `frontend/supabase/academy.sql` (the `academy_lab_keys` and `academy_hosted_labs` tables, and the `pod_slot` columns and unique index that follow them). The unique index is what keeps two students out of one security group, so this step is not optional.

**5. Vercel environment.** Print the values with `terraform -chdir=terraform output -json vercel_env` and add each one, plus:

| Name | Value |
|---|---|
| `HOSTED_LAB_AMI` | The Windows image ID from step 3 |
| `HOSTED_LAB_EMAILS` | Who can use a hosted lab. Start with your own email. `*` turns it on for everyone. |
| `CRON_SECRET` | Any long random string. Vercel sends it to the auto-stop job. |

`HOSTED_LAB_LINUX_AMI`, `HOSTED_LAB_LINUX_INSTANCE_TYPE` and `HOSTED_LAB_POD_SLOTS` come through in `vercel_env` already. Leaving `HOSTED_LAB_LINUX_AMI` unset builds pods with the domain controller alone, which is how labs ran before the Ubuntu server -- useful if you want to roll the two halves out separately.

Redeploy.

**6. Test it.** Sign in to Range with an email on the list. The lab button appears in the header.

- [ ] **Start my lab**: first start takes about 3 minutes, then the button says **Open lab**
- [ ] **Open lab** opens the desktop in a new tab, signed in as Administrator
- [ ] The Guacamole menu offers **web01 (Ubuntu)** as well, and it opens a shell as `student`
- [ ] On web01, `ping dc01` reaches the domain controller and `sudo apt-get update` still works
- [ ] On web01, `realm --version` runs: the join tools are installed and the join lab is doable
- [ ] From web01, nothing else is reachable: `nc -vz 10.60.1.x 3389` against another pod's address times out
- [ ] The computer name is unchanged and Active Directory Users and Computers shows PurveX Financial
- [ ] The lab light in Range turns green and Coach can describe the lab
- [ ] Claude connected with an MCP key sees the same lab (`get_lab_state`)
- [ ] An Operation Day One answer passes the lab check
- [ ] Disabling `riley.kwan` shows up in Range within a minute
- [ ] **Stop lab**, then start again: back in about a minute with windows still open
- [ ] It stops on its own after 3 hours unless extended

## Copy it for every student

Nothing to copy by hand. Every student who clicks **Start my lab** gets their own lab from the same image. To open it to a class, add their emails to `HOSTED_LAB_EMAILS` (or use `*`).

Two things cap how many students can have a lab at once, and both need raising before a class:

- **vCPU quota.** Service Quotas, "Running On-Demand Standard (A, C, D, H, I, M, R, T, Z) instances". A pod is 4 vCPUs -- 2 for the domain controller, 2 for the Ubuntu server -- so 20 pods running at once need 80. The account default is 64, which is 16 pods.
- **Pod slots.** `var.pod_slots` in Terraform, 60 by default. A pod holds one slot while it exists, whether or not it is running, so size this to the class rather than to the hour. Empty slots cost nothing. Raise it and `terraform apply` again; the ceiling is the 2,500 security groups a region allows.

## Keeping it running

- **Monthly:** rebuild the Windows image (step 3) and update `HOSTED_LAB_AMI`, and re-read `terraform output -raw linux_ami` for a current Ubuntu. New and reset pods use both. Existing pods keep what they were built with, which is deliberate: a cohort should not get a different Ubuntu halfway through.
- **Costs:** labs stop 3 hours after they start unless the student extends. During the day, Range stops overdue labs whenever anyone checks their lab (at most every 5 minutes). A daily Vercel Cron job at 07:00 UTC stops anything left running overnight. On a Vercel Pro plan you can make the cron run every 15 minutes in `frontend/vercel.json`. The budget alert emails you at 80%.
- **Reset:** a student can reset their own lab from the lab menu. It deletes the old lab and starts a fresh one.
- **Removing a student:** terminate both their instances (tag `casefile-user`) and delete their row in `academy_hosted_labs`. Deleting the row is what hands their pod slot back.
- **Costs per student:** see `COSTS.md` for the arithmetic and the levers.

## Things to check on the first build

These depend on AWS behaviour that can only be confirmed on a real account:

- The Range login is allowed into a security group by its `casefile-pod` tag. Confirm the tag condition really gates it before a class, with the Range key loaded and a pod group id to hand:

  ```bash
  # Should succeed with DryRunOperation.
  aws ec2 run-instances --dry-run --image-id $AMI --instance-type t3.small     --subnet-id $SUBNET --security-group-ids $POD_SG     --tag-specifications 'ResourceType=instance,Tags=[{Key=casefile-lab,Value=true}]'

  # Should fail with UnauthorizedOperation: the gateway group carries no pod tag.
  aws ec2 run-instances --dry-run --image-id $AMI --instance-type t3.small     --subnet-id $SUBNET --security-group-ids $GATEWAY_SG     --tag-specifications 'ResourceType=instance,Tags=[{Key=casefile-lab,Value=true}]'
  ```

  If the second one succeeds, the tag condition is not holding and every pod shares a reachable group. Stop and fix it before letting students in.

- Applying the login change swaps an inline policy for a managed one. Terraform may delete the old one before attaching the new one, so lab buttons can fail for a few seconds. Apply it when nobody is mid-session.

- EC2Launch runs each lab's own first-boot script after `EC2Launch.exe reset --clean` in the image. If a lab never links, look at `C:\ProgramData\PurveX\first-boot.log` on it.
- The cloned domain controller keeps its computer name. If EC2Launch renames it, remove the rename task from `C:\ProgramData\Amazon\EC2Launch\config\agent-config.yml` before building the image.
- Hibernation is ready a few minutes after first boot. Before that, Stop does a normal stop, which still keeps the disk.
