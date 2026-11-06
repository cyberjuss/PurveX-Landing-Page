### Baselines and Outliers
<!-- art: search -->

A baseline is what normal looks like for a specific account, host or process. You only get that picture by watching it long enough to see its real range, and anything that falls outside that range is an outlier. Keep in mind that neither half of the definition is fixed. A login time that's an outlier for a help desk account might be completely routine for a night-shift administrator. That's why the investigation mindset from SOC Mindset asks you to check the baseline for the thing in front of you. A company-wide idea of "normal" isn't enough.

Spotting an outlier isn't a single trick, either. The method changes with the kind of data, because sign-ins, file access and process launches each have their own shape of normal. So we'll practice on all three, which is what lets the skill carry over to data you haven't seen before.

**Sign-in pattern.** Here the baseline comes from the account, time, location and device taken together. That's how the same 3 AM login can be routine for one account and alarming for another.

```sort
prompt: Sort each sign-in by whether it fits a routine baseline or is an outlier worth a second look.
Fits the baseline: A night-shift admin signs in at 3 AM from their usual workstation | An employee signs in from the same laptop they use every day, during business hours
Outlier: A help desk account that has never worked a night shift signs in at 3 AM from a device it has never used | An account signs in from two countries nine minutes apart
```

**File-access pattern.** For files, the baseline comes from which accounts normally touch which files, and how much of a share they usually read.

```sort
prompt: Sort each file access by whether it fits a routine baseline or is an outlier worth a second look.
Fits the baseline: A payroll clerk opens a handful of payroll records during business hours | An engineer reads and modifies files inside their own team's project folder
Outlier: A help desk account reads every file on a file share in under a minute | An account that has never touched the finance share copies its entire contents overnight
```

**Process-execution pattern.** On a host, the baseline comes from which processes normally run there, and which process normally launches which.

```sort
prompt: Sort each process launch by whether it fits a routine baseline or is an outlier worth a second look.
Fits the baseline: A scheduled backup task launches its usual backup executable every night at 1 AM | A user opens their usual browser and office applications during the day
Outlier: Microsoft Word spawns a PowerShell process that then reaches out to the internet | An unfamiliar executable launches from a temp folder right after a user opened an email attachment
```

Did you notice the same shape in all three? First you establish what normally happens, for whom and when, and then you flag whatever breaks that pattern. That repeatable shape is the real skill, much more than any one of the examples above.
