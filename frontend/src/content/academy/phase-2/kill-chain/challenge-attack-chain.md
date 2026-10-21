### Challenge: The Five-Stage Intrusion

This challenge does not add anything new to your Shift console. It gives you a reason to look at five incidents already in it differently: not as five unrelated alerts, but as one intrusion, read in Cyber Kill Chain order. Real attackers do not announce which stage they are on. Watching for the next move, not only the one in front of you, is the actual skill this challenge is testing.

Work these five real Shift incidents in this order, the next time each one appears in your queue:

1. **"Burst of failed sign-ins across many accounts"** — Password Spraying, T1110.003. The attacker is testing stolen or guessed credentials against many accounts at once, looking for one that works. This is Exploitation: the attempt to actually get in.
2. **"Service principal name set on a user account"** (or its hunt variant, **"Hunt: find the kerberoastable account"**) — Kerberoasting, T1558.003. Once inside with any valid account, the attacker looks for a weaker one to crack offline. This is still Exploitation, deepening the foothold rather than ending it.
3. **"Standard user added to Domain Admins"** — Account Manipulation, T1098. The cracked or compromised account is used to grant itself (or another account) full control of the domain. This is Privilege Escalation, the moment a foothold becomes real power.
4. **"Audit logging was turned off"** — Impair Defenses, T1562.002. With domain admin rights in hand, the attacker's next move is to blind the SOC to what happens next. This is Defense Evasion, and it is why this incident should raise more alarm read after the first three than it would read alone.
5. **"New account created with no HR record"** — Create Account: Domain Account, T1136.002. The last move is insurance: a backdoor account that works even if the original compromised credential gets reset. This is Installation, the attacker making sure getting caught once does not mean getting locked out for good.

Each of these five already exists in your Shift console with its own resolution steps and its own evidence to check. The challenge is noticing the pattern, not solving any one of them differently: once the third or fourth of these lands in your queue in the same shift, you may not be looking at separate problems. You may be looking at one attacker who is still inside, and the next item in the chain is the one you have not seen yet.

<details class="academy-deeper">
<summary>From the field</summary>

[Add your own experience here: a real case where recognizing the chain, not just the individual alert, changed how you responded, or a different five-stage chain from your own experience you'd want substituted here.]

</details>
