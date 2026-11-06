### How Malware Gets In

Malware almost never appears out of nowhere. It arrives through a delivery path, and knowing the common paths tells you where to look first and how to stop the next one.

These are the paths you'll see most:

- Phishing
- Malicious downloads
- Removable media
- Exploited software

Notice that most of these depend on a person or an unpatched weakness, which is what a SOC watches for.

#### Phishing

Phishing is the most common way in. An email or message tricks the user into opening an attachment or clicking a link, which then runs the malicious code.

That's why, when a machine is infected, the user's recent email is one of the first things to check. Finding the message that started it tells you both what was delivered and who else received it.

#### Malicious downloads

With a malicious download, the user downloads and runs what looks like a normal installer, often from a search result or a cracked-software site. This is how many trojans arrive.

To trace one, look at the browser history and downloads folder, which show what was fetched and when. That timeline usually lines up with the moment the alert fired.

#### Removable media

A USB drive can also carry malware onto a machine, even one with no internet access. Windows no longer runs files from a USB drive automatically, so someone usually has to open a file on it. That's why attackers name the file to look worth opening.

In an environment that shouldn't allow unknown USB devices at all, an infection like this is a policy finding as well as a cleanup job.

#### Exploited software

The last path needs no user at all. Unpatched software can be attacked directly over the network, and that's how worms spread, along with many targeted intrusions.

This is why patching counts as a security control, not just maintenance. So if an infection happened with no user action, suspect this path, and ask what else on the network shares the same flaw.

Whatever the path turns out to be, closing it is part of the fix, because cleaning one machine without closing the way in just leaves the next infection waiting.

```sort
prompt: Which path did it come in through?
Phishing: An email tricks the user into opening an attachment
Malicious downloads: A normal-looking installer from a cracked-software site
Removable media: A USB drive on a machine with no internet access
Exploited software: An infection with no user action at all
```
