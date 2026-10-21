### Determining Outliers and Baseline
<!-- art: search -->

A baseline is simply what normal looks like for a specific account, host, or process, measured over enough time that you have actually seen its range. An outlier is anything that falls outside that range. Neither half of that definition is fixed. A login time that is an outlier for a help desk account is the baseline for a night-shift administrator, which is exactly why last week's investigation mindset insists you check the baseline for the specific thing in front of you, not a generic idea of what "normal" means across the whole company.

The method for spotting an outlier is not one trick. It changes with what kind of data you are looking at, because a sign-in pattern, a file-access pattern, and a process launch each have a different shape of normal. Practicing on all three is the only way the skill transfers to data you have not seen before.

**Sign-in pattern.** The baseline is built from account, time, location, and device together. The same login at 3 AM is routine for one account and alarming for another.

```sort
prompt: Sort each sign-in by whether it fits a routine baseline or is an outlier worth a second look.
Fits the baseline: A night-shift admin signs in at 3 AM from their usual workstation | An employee signs in from the same laptop they use every day, during business hours
Outlier: A help desk account that has never worked a night shift signs in at 3 AM from a device it has never used | An account signs in from two countries nine minutes apart
```

**File-access pattern.** The baseline is built from which accounts normally touch which files, and how much of a share they normally read.

```sort
prompt: Sort each file access by whether it fits a routine baseline or is an outlier worth a second look.
Fits the baseline: A payroll clerk opens a handful of payroll records during business hours | An engineer reads and modifies files inside their own team's project folder
Outlier: A help desk account reads every file on a file share in under a minute | An account that has never touched the finance share copies its entire contents overnight
```

**Process-execution pattern.** The baseline is built from which processes a host normally runs, and what normally launches what.

```sort
prompt: Sort each process launch by whether it fits a routine baseline or is an outlier worth a second look.
Fits the baseline: A scheduled backup task launches its usual backup executable every night at 1 AM | A user opens their usual browser and office applications during the day
Outlier: Microsoft Word spawns a PowerShell process that then reaches out to the internet | An unfamiliar executable launches from a temp folder right after a user opened an email attachment
```

Notice the shape repeats across all three: establish what normally happens, for whom, and when, then flag whatever breaks that pattern. That repeatable shape, not memorizing any one example above, is the actual skill.

<details class="academy-deeper">
<summary>From the field</summary>

[Add your own experience here: a real outlier you caught by knowing the baseline cold, or a time something that looked like an outlier turned out to be a new, legitimate baseline you hadn't accounted for yet.]

</details>
