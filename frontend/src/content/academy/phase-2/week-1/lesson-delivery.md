### How Malware Gets In

Malware almost never appears from nowhere. It arrives through a delivery path, and knowing the common paths tells you where to look first and how to stop the next one.

The paths you will see most are:

Phishing
Malicious downloads
Removable media
Exploited software

As you read, notice that most of these depend on a person or an unpatched weakness, which is exactly what a SOC watches for.

#### Phishing

Phishing is the most common way in. An email or message tricks the user into opening an attachment or clicking a link that runs the payload.

When a machine is infected, the user's recent email is one of the first things to check. Finding the message that started it tells you what was delivered and who else received it.

#### Malicious downloads

A user downloads what looks like a normal file or installer, often from a search result or a cracked-software site, and runs it. This is how many trojans arrive.

The browser history and downloads folder show what was fetched and when. That timeline usually lines up with the moment the alert fired.

#### Removable media

A USB drive can carry malware onto a machine, including machines with no internet access. Plugging it in can be enough if autorun is allowed.

In an environment that should not allow unknown USB devices, a removable-media infection is also a policy finding, not just a cleanup job.

#### Exploited software

Unpatched software can be attacked directly over the network, with no user action at all. Worms spread this way, and so do targeted intrusions.

This is why patching is a security control, not just maintenance. An infection with no user action points here, and it raises the question of what else on the network shares the same flaw.

In a later section, you will trace an infection back to the path it came in through, because closing that path is part of the fix.
