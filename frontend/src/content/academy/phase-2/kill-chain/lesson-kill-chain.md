### The Cyber Kill Chain
<!-- art: tree -->

The Cyber Kill Chain is a model introduced in 2011 by Lockheed Martin analysts Eric Hutchins, Michael Cloppert and Rohan Amin. It breaks an intrusion into seven stages that run in order, from first contact to the attacker's final goal. The stage names matter less than the idea underneath them. An attack is a sequence, so breaking the chain at any stage stops everything that would have followed.

Here are the seven stages. Each one gets its own lesson after this one:

1. **Reconnaissance.** The attacker researches the target.
2. **Weaponization.** The attacker builds or obtains the tool that will exploit a weakness.
3. **Delivery.** The weapon reaches the target.
4. **Exploitation.** A weakness gets used.
5. **Installation.** The attacker sets up a way to keep the foothold.
6. **Command and Control.** The compromised system reaches back out to attacker-controlled infrastructure.
7. **Actions on Objectives.** The attacker does what they came for.

Each technique from this phase's ATT&CK lesson sits at one of these stages, and that stage's lesson names it. Keep in mind that a chain of incidents is more dangerous than any one of them read alone. Disable Windows Event Logging (T1562.002), for example, gains the attacker nothing by itself. Its purpose is to make every other stage harder to see.

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
