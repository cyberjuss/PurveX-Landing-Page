### Setting Thresholds for Detections
<!-- art: gauge -->

Many detections work by counting something, such as failed sign-ins per account per hour, files read per minute or processes started per host. Each of them needs a number that decides when the counting turns into an alert, and that number is the threshold. Setting it is a genuine trade-off rather than a technical afterthought. If you set it too low, the detection fires on routine behavior and buries real incidents in noise, which is the alert fatigue problem you met in Week 1. If you set it too high, a real attack slips underneath it without anyone noticing.

There's no universal right number, because the answer depends on your own environment's baseline. Three failed sign-ins in an hour might be an ordinary typo rate for a busy help desk, yet a clear signal on an account that has never failed a sign-in before. That's why last week's classification lesson and this week's baseline lesson come first. You can't set a sensible threshold on data you haven't looked at.

A single scenario makes the trade-off concrete. Say a sign-in detection counts failed attempts per account per hour, and you're choosing between a threshold of 3 and a threshold of 10.

```sort
prompt: At a threshold of 3 failed sign-ins per hour, sort each real case by what happens to it.
Caught: An attacker running a password-spray script, 40 failed attempts across the account list in two minutes | A help desk account targeted by repeated guesses, 7 failures in ten minutes
Missed: A single employee who mistypes their password twice before getting it right, 2 failures in a minute
```

```sort
prompt: Now raise the threshold to 10. Sort the same kinds of cases again.
Caught: An attacker running a password-spray script, 40 failed attempts across the account list in two minutes
Missed: A help desk account targeted by repeated guesses, 7 failures in ten minutes | A single employee who mistypes their password twice before getting it right, 2 failures in a minute
```

Notice what moved between the two sorts. The password spray is caught either way, because it's loud. The targeted guessing against a single account is quieter, and arguably more dangerous because it means the attacker already has someone specific in mind, yet it's only caught at the lower threshold. So no threshold is simply correct. The right one is whichever balances the false positives your environment can tolerate against the attacks it can afford to miss.
