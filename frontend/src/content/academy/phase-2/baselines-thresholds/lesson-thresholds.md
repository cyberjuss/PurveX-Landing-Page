### Setting Thresholds for Detections
<!-- art: gauge -->

A detection that counts something (failed sign-ins per account per hour, files read per minute, processes spawned per host) needs a number that decides when counting turns into alerting. That number is the threshold, and setting it is a real trade-off, not a technical afterthought. Set it too low and the detection fires on routine behavior, burying real incidents in noise, the alert fatigue problem Week 1 already covered. Set it too high and a real attack slips under it, uncaught.

Picking the number is a question about your own environment's baseline, not a universal constant. Three failed sign-ins in an hour might be a normal typo rate for your help desk's call volume and a clear signal on an account that has never once failed a sign-in. That is why last week's classification lesson and this week's baseline lesson both come before this one: you cannot set a sane threshold on data you have not actually looked at.

A single scenario makes the trade-off concrete. Say a sign-in detection counts failed attempts per account per hour, and you are choosing between a threshold of 3 or a threshold of 10.

```sort
prompt: At a threshold of 3 failed sign-ins per hour, sort each real case by what happens to it.
Caught: An attacker running a password-spray script, 40 failed attempts across the account list in two minutes | A help desk account targeted by repeated guesses, 12 failures in ten minutes
Missed: A single employee who mistypes their password twice before getting it right, 2 failures in a minute
```

```sort
prompt: Now raise the threshold to 10. Sort the same kinds of cases again.
Caught: An attacker running a password-spray script, 40 failed attempts across the account list in two minutes
Missed: A help desk account targeted by repeated guesses, 12 failures in ten minutes | A single employee who mistypes their password twice before getting it right, 2 failures in a minute
```

Notice what moved between the two sorts. The password spray gets caught either way, because it is loud. The targeted guess against one account, a quieter and arguably more dangerous pattern because it means the attacker already has a specific target, only gets caught at the lower threshold. There is no threshold that is simply correct. There is only the threshold that matches what your environment's baseline can tolerate in false positives against what it can afford to miss.

<details class="academy-deeper">
<summary>From the field</summary>

[Add your own experience here: a real detection you had to tune, what number you landed on and why, or a time a threshold was set wrong in either direction and what it cost.]

</details>
