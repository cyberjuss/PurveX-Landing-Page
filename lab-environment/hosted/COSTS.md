# What a pod costs

One pod is one student: a `t3.large` Windows domain controller and a `t3.small` Ubuntu server, each with its own disk and public address.

Rates below are us-east-1 on-demand list price, read from the AWS Price List API on 2026-10-05. Re-check with:

```bash
aws pricing get-products --region us-east-1 --service-code AmazonEC2 \
  --filters Type=TERM_MATCH,Field=instanceType,Value=t3.large \
            Type=TERM_MATCH,Field=operatingSystem,Value=Windows \
            Type=TERM_MATCH,Field=tenancy,Value=Shared \
            Type=TERM_MATCH,Field=preInstalledSw,Value=NA \
            Type=TERM_MATCH,Field=capacitystatus,Value=Used \
            Type=TERM_MATCH,Field=regionCode,Value=us-east-1
```

| Line | Rate |
|---|---|
| `t3.large` Windows (dc01) | $0.1108 / hr |
| `t3.small` Linux (web01) | $0.0208 / hr |
| Public IPv4, in use | $0.0050 / hr each |
| gp3 storage | $0.08 / GB-month |
| NAT gateway | $0.045 / hr + $0.045 / GB |

## Per student, per month

Two different clocks. Compute and addresses bill only while a pod runs. Disks bill every hour of the month whether or not the student signs in.

| | Rate | At the 20-hour cap |
|---|---|---|
| dc01 compute | $0.1108 / hr | $2.22 |
| web01 compute | $0.0208 / hr | $0.42 |
| 2 public addresses | $0.0100 / hr | $0.20 |
| **While running** | **$0.1416 / hr** | **$2.83** |
| dc01 disk, 60 GB | | $4.80 |
| web01 disk, 20 GB | | $1.60 |
| **Always** | | **$6.40** |
| **Total** | | **$9.23** |

Against Range Pro at $20/month that is a gross margin of $10.77, or 54%.

**Disks are 69% of it.** The student's own usage is the smaller half of their bill. A pod that nobody opens still costs $6.40 a month, which is what the 21-day idle reclaim exists to stop.

## What the second machine added

| | dc01 only | Pod |
|---|---|---|
| While running | $0.1158 / hr | $0.1416 / hr |
| 20 hours | $2.32 | $2.83 |
| Disks | $4.80 | $6.40 |
| **Per student, per month** | **$7.12** | **$9.23** |

The Ubuntu server costs **$2.12 per student per month**: $1.60 of idle disk, $0.42 of compute, $0.10 of address. Three quarters of it is a disk sitting still, so stopping web01 separately from dc01 would save about $0.42 and is not worth the extra moving part.

## Fixed, whatever the class size

| Line | Monthly |
|---|---|
| Gateway `t3.small`, 24/7 | $15.18 |
| Gateway elastic IP | $3.65 |
| Gateway disk, 20 GB | $1.60 |
| **Total** | **$20.43** |

Lab-to-gateway traffic is free: both sit in the same subnet in one availability zone. Gateway-to-student traffic leaves AWS at $0.09/GB past the first 100 GB a month. A remote-desktop session with wallpaper and theming off runs roughly 100 MB an hour, so about 2 GB per student per month. It stays free below 50 students and costs single-digit dollars at 100.

## At class size

Twenty lab hours each, which is the cap.

| Students | AWS | Revenue at $20 | Gross | Margin |
|---|---|---|---|---|
| 10 | $113 | $200 | $87 | 44% |
| 25 | $251 | $500 | $249 | 50% |
| 50 | $482 | $1,000 | $518 | 52% |
| 100 | $953 | $2,000 | $1,047 | 52% |

Margin flattens near 52% once the fixed $20 is spread thin. Past about 100 students the gateway needs a bigger instance, which adds $45 a month at `t3.large` and does not move the margin.

## Two things to raise before a cohort

- **vCPU quota.** The account allows 64 on-demand standard vCPUs. A pod is 4, so **16 pods can run at once** today. This bites long before cost does.
- **Budget alert.** `var.monthly_budget_usd` is $300. The bill crosses it at about 25 active students, so the alert starts firing on normal growth rather than on anomalies. Set it per cohort.

## The cap is what makes $20 work

Without the monthly cap a student running 8 hours a day, 22 days a month, costs $31.32 against $20 of revenue. The three controls that hold the price together:

| Control | Where | Effect |
|---|---|---|
| 3-hour session | `HOSTED_LAB_SESSION_HOURS` | A forgotten lab stops itself |
| 20 hours a month | `HOSTED_LAB_MONTHLY_HOURS` | Caps one student at $2.83 of compute |
| 21-day reclaim | `HOSTED_LAB_IDLE_DAYS` | Stops paying $6.40 for an abandoned pod |

One pod-hour now costs 22% more than a lab-hour did, because the cap is spent on two machines rather than one. Twenty hours still costs under $3, so the cap did not need moving.

## Levers, if the margin needs it

| Lever | Saves | Cost of pulling it |
|---|---|---|
| Windows disk 60 GB → 40 GB | $1.60 / student / mo | Rebuild the image. Leave room for 8 GB of hibernated memory. |
| Ubuntu disk 20 GB → 12 GB | $0.64 / student / mo | Little headroom left for what a student installs. |
| dc01 `t3.large` → `t3.medium` | $1.02 / student / mo | Active Directory and the lab on 4 GB. Try it before a cohort, not during. |
| Idle reclaim 21 → 10 days | Up to $6.40 per abandoned pod | A student who takes a three-week break loses their lab's state. |
| Savings Plan on the gateway | ~$4.50 / mo | A one-year commitment for small money. Labs are too bursty to commit. |

## Why public addresses rather than a NAT gateway

A NAT gateway would take the public addresses off the labs entirely, which is tidier: nothing to reach even by mistake. It costs $32.85 a month flat plus $0.045 a gigabyte. Two public addresses cost $0.01 per pod-hour, so the NAT gateway only becomes the cheaper option past 3,285 pod-hours a month, which is about 164 students at the cap, and its per-gigabyte charge pushes that further out.

Public addresses stay, because the isolation does not depend on them. No pod rule names the internet inbound, so an address on a lab is an address nothing can use. Revisit at roughly 150 active students, when the two prices meet and the security case comes free.
