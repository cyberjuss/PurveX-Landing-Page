<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What are we protecting when we call something "secure"?</p>
</div>

```predict
prompt: A file of wire approvals still opens and looks normal, but one account number was quietly changed. Which part of security failed?
* Integrity :: The data still looks normal, but you can no longer trust what it says.
Confidentiality :: Nobody new got a copy of the file, so nothing leaked.
Availability :: The file still opens, so nobody is locked out of their work.
why: Security is three separate jobs, and each one fails in its own way. Naming which one failed is the first skill this week builds.
```

### Overview

People call systems "secure" all the time, but the word on its own doesn't tell you what to check or what to fix. That's because security isn't one property:

<ul>
<li>It's three separate jobs running at once</li>
<li>Whenever something goes wrong, one of those three jobs has failed</li>
</ul>

So the first skill we'll build this week is naming which one.

Each job fails in its own recognizable way:

- **Confidentiality** fails as a **leak**: someone who shouldn't have a copy of the data now has one.
- **Integrity** fails as a **lie**: the data still looks normal, but you can no longer trust what it says.
- **Availability** fails as a **lockout**: nothing leaked and nothing changed, yet people can't get their work done.

<svg class="lk-fig" viewBox="0 0 560 290" role="img" aria-label="The CIA triad. Three jobs protect the same data. Confidentiality fails as a leak, integrity fails as a lie, and availability fails as a lockout."><path class="f-line" d="M255 80 L130 220 M305 80 L430 220 M195 250 L365 250"/><rect class="f-acc" x="195" y="22" width="170" height="58" rx="10"/><text class="f-t" x="280" y="47" text-anchor="middle">Confidentiality</text><text class="f-s" x="280" y="67" text-anchor="middle">fails as a leak</text><rect class="f-acc" x="25" y="220" width="170" height="58" rx="10"/><text class="f-t" x="110" y="245" text-anchor="middle">Integrity</text><text class="f-s" x="110" y="265" text-anchor="middle">fails as a lie</text><rect class="f-acc" x="365" y="220" width="170" height="58" rx="10"/><text class="f-t" x="450" y="245" text-anchor="middle">Availability</text><text class="f-s" x="450" y="265" text-anchor="middle">fails as a lockout</text><text class="f-k" x="280" y="165" text-anchor="middle">THE SAME DATA</text><text class="f-s" x="280" y="185" text-anchor="middle">three jobs, three ways to fail</text></svg>

Together, these three are known as the CIA triad. Telling them apart matters:

<ul>
<li>Each failure goes to different people and gets contained in a different way</li>
<li>Label one wrong and you'll chase the wrong problem while the real one keeps going</li>
</ul>

### Naming Danger Before It Does Damage

Alongside the triad, this week pins down three words that get used loosely in every alert queue:

- A **vulnerability** is a weakness.
- A **threat** is something or someone that could take advantage of it.
- **Risk** is the chance the two meet, and what it would cost if they did.

An analyst who mixes these words up tends to rank tickets by how frightening they sound, when what really matters is what each one would cost the business.

```connect
prompt: Connect each word to what it means.
level: 1
Vulnerability = A weakness
Threat = Something or someone that could use it
Risk = The chance the two meet, and what it would cost
```
