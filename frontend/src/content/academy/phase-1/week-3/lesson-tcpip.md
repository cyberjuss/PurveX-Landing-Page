### TCP/IP: The Foundation

Before two devices on a network can exchange anything, they have two separate problems to solve:

- Each device needs an **address**, so others can find it among everything else connected.
- Both need a shared set of **rules** for how the conversation proceeds once they have found each other.

TCP/IP is the pair of protocols that solves those problems, one each, and keeping the two jobs separate in your mind is the first step to reading a capture.

The first of the pair, **IP** (the Internet Protocol), handles the addressing. It gives every device an address, much like a building's street address, and moves data from one address to another across whatever equipment sits in between. IP only makes a best effort, though:

<ul>
<li>It tries to deliver your data</li>
<li>It does not promise that anything arrives</li>
<li>It does not check</li>
</ul>

That is where the second protocol comes in. **TCP** (the Transmission Control Protocol) makes sure the data arrives complete and in the right order, a bit like a phone call where each person keeps checking the other heard them:

<ul>
<li>It numbers everything it sends</li>
<li>It waits for the other side to confirm each piece arrived</li>
<li>If something goes unconfirmed, it sends that piece again</li>
</ul>

That split is worth committing to memory, because it tells you where to look when something goes wrong:

<div style="display:flex;gap:1rem;flex-wrap:wrap;margin:1rem 0;">
<div style="flex:1 1 200px;padding:0.9rem 1rem;border-radius:12px;background:color-mix(in srgb, var(--rd-accent) 6%, var(--rd-surface));box-shadow:0 1px 2px rgba(16,25,46,0.04), 0 14px 32px -26px rgba(16,25,46,0.18);">
<strong style="display:block;font-size:0.72em;text-transform:uppercase;letter-spacing:0.05em;color:var(--rd-accent);margin-bottom:4px;">IP</strong>
Gets the data there
</div>
<div style="flex:1 1 200px;padding:0.9rem 1rem;border-radius:12px;background:color-mix(in srgb, var(--rd-good, #16a34a) 6%, var(--rd-surface));box-shadow:0 1px 2px rgba(16,25,46,0.04), 0 14px 32px -26px rgba(16,25,46,0.18);">
<strong style="display:block;font-size:0.72em;text-transform:uppercase;letter-spacing:0.05em;color:var(--rd-good, #16a34a);margin-bottom:4px;">TCP</strong>
Makes sure it arrives correctly
</div>
</div>

So when a capture looks broken, your first question is which of the two failed:

- A packet that **never found the host** is an addressing or routing problem.
- A host that **never confirmed receipt** got the data, but the conversation broke down. A few things can cause that:
  - The service may not be listening
  - A firewall may be dropping replies
  - The host may be overloaded

```sort
prompt: Whose job is it, IP or TCP?
level: 1
IP: Giving every device an address | Moving data from one address to another | A packet that never found the host
TCP: Making sure data arrives complete and in order | Numbering what it sends and waiting for confirmation | Resending anything that goes unacknowledged
```
