### The Cyber Kill Chain
<!-- art: tree -->

The Cyber Kill Chain is a model Lockheed Martin analysts Eric Hutchins, Michael Cloppert, and Rohan Amin introduced in 2011. It breaks an intrusion into seven stages that run in order, from first contact to the attacker's final goal. What matters is the idea underneath the specific names: an attack is a sequence, not a single event, and breaking the chain at any earlier stage stops everything that would have followed it.

The seven stages are:

1. **Reconnaissance.** The attacker researches the target: employees, technology, exposed services, anything that helps plan the attack.
2. **Weaponization.** The attacker builds or obtains the tool that will exploit a weakness, such as malware paired with an exploit.
3. **Delivery.** The weapon reaches the target, commonly through a phishing email, a malicious link, or a compromised website.
4. **Exploitation.** A vulnerability actually gets used, whether a technical flaw or a human one, to get the attacker's code running or gain the attacker a foothold.
5. **Installation.** The attacker sets up a way to keep that foothold, such as a backdoor account or persistent malware, so getting in once does not mean getting found and locked out once.
6. **Command and Control.** The compromised system reaches back out to infrastructure the attacker controls, giving them a channel to issue further instructions.
7. **Actions on Objectives.** The attacker does what they actually came for: stealing data, encrypting it for ransom, or disrupting operations.

The techniques you already know from this phase's ATT&CK lesson each sit at one of these stages. Password Spraying (T1110.003) is an Exploitation move: an attempt to actually get in. Create Account: Domain Account (T1136.002) is Installation: a way to keep that access. Disable Windows Event Logging (T1562.002), a sub-technique of Impair Defenses, does not fit neatly into any single stage on its own. Its purpose is to make every other stage harder to see. That is exactly why a chain of incidents is more dangerous than any one of them read in isolation.

```order
prompt: Put the seven Cyber Kill Chain stages in order.
Reconnaissance
Weaponization
Delivery
Exploitation
Installation
Command and Control
Actions on Objectives
```

<details class="academy-deeper">
<summary>From the field</summary>

[Add your own experience here: a real intrusion you worked that you could map onto these seven stages, or where you think the model breaks down against how attacks actually happen today.]

</details>
