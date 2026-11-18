### SSL/TLS: What "Encrypted" Means

First, a quick word on the name. SSL is the older term and **TLS** is the modern standard that replaced it, but the old name stuck, so you will hear people say SSL when they mean TLS for the rest of your career.

TLS does two jobs:

- It wraps a connection in encryption.
- It uses the server's certificate to prove that the client has reached the site it meant to reach.

You can see what that changes by comparing the two cases:

<ul>
<li>Without TLS (HTTP): anyone watching the wire can read the data</li>
<li>With TLS (HTTPS): the data is encrypted and watchers see only gibberish</li>
</ul>

To set up that encryption, TLS performs a handshake of its own, and the order is what confuses people at first:

1. The TCP three-way handshake always runs first and establishes the connection.
2. Only after it completes do the two sides negotiate encryption keys.
3. Only once that finishes does any real data move.

The clearest way to keep the two apart is by what each one produces:

<div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;margin:1rem 0;font-size:0.92em;">
<span style="padding:0.5rem 0.8rem;border-left:3px solid var(--rd-accent);">TCP handshake<br><span style="font-size:0.85em;color:var(--rd-ink-3, #94a3b8);">sets up the connection</span></span>
<span aria-hidden style="color:var(--rd-ink-3, #94a3b8);">→</span>
<span style="padding:0.5rem 0.8rem;border-left:3px solid var(--rd-good, #16a34a);">TLS handshake<br><span style="font-size:0.85em;color:var(--rd-ink-3, #94a3b8);">sets up the privacy</span></span>
</div>

This changes what you can expect from a capture, and it is better to adjust that expectation now than to spend an afternoon fighting it. If a conversation is HTTPS, you will not be able to read the payload in Wireshark. The good news is that encryption hides surprisingly little else, and you can still see:

- which two machines talked
- which ports they used
- when the conversation happened
- how much data moved, and in which direction
- that a TLS handshake took place at all
- in most connections, the name of the site requested, because the client sends it before encryption starts

In practice, that outside information is usually enough to decide whether a conversation belongs, which was the decision you were trying to make all along. Analysts work from it far more often than they read payloads.

```sort
prompt: You captured an HTTPS session in Wireshark. What can you still see?
level: 3
Visible: Which two machines talked | The port they used | How much data moved, and which way | The site name, in most connections
Hidden: The password typed into the form | The content of the page
```


### Check yourself

A workstation sends traffic on port 443 to an address nobody recognizes, every five minutes, day and night. You cannot read the payload. Do you have anything to go on?

<details class="lk-answer">
<summary>Compare your answer</summary>

Plenty. A connection on a fixed interval around the clock is a pattern people do not make, so it suggests software calling home. You can see:

<ul>
<li>The destination</li>
<li>The site name in the TLS handshake</li>
<li>How much data moves, and in which direction</li>
<li>The DNS lookup that came before it</li>
</ul>

Find out which process on the workstation is making the connection, and escalate with that evidence.

</details>
