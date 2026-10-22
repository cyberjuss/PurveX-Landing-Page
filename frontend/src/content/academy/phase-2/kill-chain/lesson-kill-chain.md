### The Cyber Kill Chain
<!-- art: tree -->

The Cyber Kill Chain is a model Lockheed Martin analysts Eric Hutchins, Michael Cloppert, and Rohan Amin introduced in 2011. It breaks an intrusion into seven stages that run in order, from first contact to the attacker's final goal. What matters is the idea underneath the specific names. An attack is a sequence of stages, and breaking the chain at any earlier stage stops everything that would have followed it.

The seven stages, each covered in its own lesson next, are:

1. **Reconnaissance.** The attacker researches the target.
2. **Weaponization.** The attacker builds or obtains the tool that will exploit a weakness.
3. **Delivery.** The weapon reaches the target.
4. **Exploitation.** A vulnerability actually gets used.
5. **Installation.** The attacker sets up a way to keep the foothold.
6. **Command and Control.** The compromised system reaches back out to attacker-controlled infrastructure.
7. **Actions on Objectives.** The attacker does what they actually came for.

The techniques you already know from this phase's ATT&CK lesson each sit at one of these stages, which the lesson for that stage names directly. A chain of incidents is more dangerous than any one of them read in isolation, because a technique like Disable Windows Event Logging (T1562.002) does not win anything for the attacker on its own. Its purpose is to make every other stage harder to see.

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
