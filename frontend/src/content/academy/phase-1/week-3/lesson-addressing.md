### IP Addresses and Subnets

In the TCP/IP lesson, we said that IP gives every device an address. Now we will learn to read one. An address tells you more than where a device lives:

<ul>
<li>Which machines it can reach directly</li>
<li>Whether a conversation stays inside the building</li>
<li>Very often, why a computer that looks perfectly healthy cannot reach anything at all</li>
</ul>

A large share of "the network is down" tickets on a help desk come down to one of the few ideas in this lesson.

### Reading an IPv4 address

An IPv4 address is 32 bits long. We write it as four numbers separated by dots, such as `192.168.1.25`.

<ul>
<li>Each of those numbers is called an <strong>octet</strong>, because it stands for 8 bits.</li>
<li>So each octet can only run from 0 to 255.</li>
<li>An octet of 256 or higher means the address is not valid, and you are looking at a typo.</li>
</ul>

Every address has two parts, much like a street address:

<ul>
<li>The <strong>network part</strong> says which street the device is on.</li>
<li>The <strong>host part</strong> says which house on that street it is.</li>
</ul>

The address on its own does not say where one part ends and the other begins. That is the job of the subnet mask.

### The subnet mask and CIDR

The most common subnet mask is `255.255.255.0`. Read it octet by octet: 255 means "this octet belongs to the network," and 0 means "this octet belongs to the host."

<div style="display:grid;grid-template-columns:repeat(4, auto);gap:2px 0.5rem;align-items:end;font-family:var(--font-mono, ui-monospace, monospace);margin:1rem 0 0.3rem;">
<span style="font-size:1.3em;font-weight:700;color:var(--rd-accent);">192.</span>
<span style="font-size:1.3em;font-weight:700;color:var(--rd-accent);">168.</span>
<span style="font-size:1.3em;font-weight:700;color:var(--rd-accent);">1.</span>
<span style="font-size:1.3em;font-weight:700;color:var(--rd-ink-3, #94a3b8);">25</span>
<span style="font-size:0.85em;color:var(--rd-accent);">255.</span>
<span style="font-size:0.85em;color:var(--rd-accent);">255.</span>
<span style="font-size:0.85em;color:var(--rd-accent);">255.</span>
<span style="font-size:0.85em;color:var(--rd-ink-3, #94a3b8);">0</span>
<span style="grid-column:1 / span 3;font-size:0.72em;text-transform:uppercase;letter-spacing:0.05em;color:var(--rd-accent);">network</span>
<span style="font-size:0.72em;text-transform:uppercase;letter-spacing:0.05em;color:var(--rd-ink-3, #94a3b8);">host</span>
</div>

Writing out the mask every time gets tedious, so engineers use a shorter form called **CIDR notation**. The mask `255.255.255.0` gives the first 24 bits to the network, so the same address is written `192.168.1.25/24`. The number after the slash is called the **prefix**.

<div style="display:flex;align-items:baseline;gap:2px;font-family:var(--font-mono, ui-monospace, monospace);font-size:1.4em;margin:1.25rem 0 0.3rem;">
<span style="color:var(--rd-accent);font-weight:700;">192.168.1</span><span style="color:var(--rd-ink-3, #94a3b8);">.25</span>
</div>
<div style="display:flex;gap:4px;align-items:center;font-family:var(--font-mono, ui-monospace, monospace);font-size:0.8em;color:var(--rd-ink-3, #94a3b8);margin:0 0 1.25rem;">
<span style="color:var(--rd-accent);font-weight:700;">⟵ network · /24 ⟶</span><span>host</span>
</div>

| Prefix | Subnet mask | Addresses | Usable hosts |
| :---- | :---- | :---- | :---- |
| /8 | 255.0.0.0 | 16,777,216 | 16,777,214 |
| /16 | 255.255.0.0 | 65,536 | 65,534 |
| /24 | 255.255.255.0 | 256 | 254 |
| /25 | 255.255.255.128 | 128 | 126 |
| /26 | 255.255.255.192 | 64 | 62 |
| /30 | 255.255.255.252 | 4 | 2 |

Two patterns in that table are worth committing to memory. First, a subnet with prefix `/n` holds 2 to the power of (32 minus n) addresses, so every bit you add to the prefix cuts the subnet in half.

Second, the usable count is always two short: two addresses in every subnet are reserved.

<div style="display:flex;gap:2px;margin:1rem 0;font-family:var(--font-mono, ui-monospace, monospace);font-size:0.8em;text-align:center;">
<span style="flex:0 0 72px;padding:0.5rem 0.2rem;background:color-mix(in srgb, var(--rd-bad, #dc2626) 14%, transparent);border-bottom:3px solid var(--rd-bad, #dc2626);">.0<br><span style="font-size:0.82em;text-transform:uppercase;letter-spacing:0.04em;">network</span></span>
<span style="flex:1;padding:0.5rem 0.2rem;background:color-mix(in srgb, var(--rd-good, #16a34a) 10%, transparent);border-bottom:3px solid var(--rd-good, #16a34a);">.1 – .254<br><span style="font-size:0.82em;text-transform:uppercase;letter-spacing:0.04em;">usable hosts</span></span>
<span style="flex:0 0 72px;padding:0.5rem 0.2rem;background:color-mix(in srgb, var(--rd-bad, #dc2626) 14%, transparent);border-bottom:3px solid var(--rd-bad, #dc2626);">.255<br><span style="font-size:0.82em;text-transform:uppercase;letter-spacing:0.04em;">broadcast</span></span>
</div>

Neither the network address nor the broadcast address can be given to a computer.

### Same subnet or not

This is where addressing starts to matter on the job. Two devices on the same subnet talk to each other directly. When the destination is on a different subnet, the device cannot reach it on its own. It hands the traffic instead to its **default gateway**: the router that connects its subnet to everything else.

To decide which case applies, compare the network parts. Take a workstation at `192.168.1.25/24`, where the first three octets are the network:

<div style="display:flex;gap:1rem;flex-wrap:wrap;margin:1rem 0;">
<div style="flex:1 1 220px;padding:0.9rem 1rem;border-radius:12px;background:color-mix(in srgb, var(--rd-good, #16a34a) 6%, var(--rd-surface));box-shadow:0 1px 2px rgba(16,25,46,0.04), 0 14px 32px -26px rgba(16,25,46,0.18);">
<strong style="display:block;font-size:0.72em;text-transform:uppercase;letter-spacing:0.05em;color:var(--rd-good, #16a34a);margin-bottom:4px;">Same subnet</strong>
<code>192.168.1.200</code> shares <code>192.168.1</code> with the workstation, so it reaches it directly.
</div>
<div style="flex:1 1 220px;padding:0.9rem 1rem;border-radius:12px;background:color-mix(in srgb, var(--rd-warn, #d97706) 6%, var(--rd-surface));box-shadow:0 1px 2px rgba(16,25,46,0.04), 0 14px 32px -26px rgba(16,25,46,0.18);">
<strong style="display:block;font-size:0.72em;text-transform:uppercase;letter-spacing:0.05em;color:var(--rd-warn, #d97706);margin-bottom:4px;">Through the gateway</strong>
<code>192.168.2.25</code> has a different third octet, so that traffic goes through the gateway.
</div>
</div>

With a `/16`, you would compare only the first two octets. Prefixes larger than `/24` split the last octet itself, which catches people out. A `/26` divides it into four blocks of 64:

<div style="display:flex;gap:2px;margin:1rem 0;font-family:var(--font-mono, ui-monospace, monospace);font-size:0.8em;text-align:center;">
<span style="flex:1;padding:0.5rem 0.2rem;background:color-mix(in srgb, var(--rd-accent) 14%, transparent);border-bottom:3px solid var(--rd-accent);">.0 – .63</span>
<span style="flex:1;padding:0.5rem 0.2rem;background:color-mix(in srgb, var(--rd-good, #16a34a) 14%, transparent);border-bottom:3px solid var(--rd-good, #16a34a);">.64 – .127</span>
<span style="flex:1;padding:0.5rem 0.2rem;background:color-mix(in srgb, var(--rd-warn, #d97706) 14%, transparent);border-bottom:3px solid var(--rd-warn, #d97706);">.128 – .191</span>
<span style="flex:1;padding:0.5rem 0.2rem;background:color-mix(in srgb, var(--rd-bad, #dc2626) 14%, transparent);border-bottom:3px solid var(--rd-bad, #dc2626);">.192 – .255</span>
</div>

So `10.0.0.70/26` and `10.0.0.130/26` sit on different subnets, even though their first three octets match.

This explains one of the most recognizable help desk patterns. When a computer's default gateway is missing or wrong, it can still reach printers and machines on its own subnet, but nothing beyond it. The user reports that "some things work and some do not," so the gateway is the first thing to check.

### Private and public addresses

Three ranges are set aside for private networks by a standard called RFC 1918:

<ul>
<li><code>10.0.0.0/8</code>, which is every address starting with 10</li>
<li><code>172.16.0.0/12</code>, which runs from <code>172.16.0.0</code> to <code>172.31.255.255</code></li>
<li><code>192.168.0.0/16</code>, which is every address starting with 192.168</li>
</ul>

Routers on the internet do not carry these addresses, so any organization can reuse them internally. A router or firewall swaps one for a public address on the way out, called **NAT** (Network Address Translation):

<div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;margin:1rem 0 0.3rem;font-family:var(--font-mono, ui-monospace, monospace);font-size:0.95em;">
<span style="padding:0.5rem 0.9rem;border-radius:10px;background:color-mix(in srgb, var(--rd-accent) 8%, var(--rd-surface));box-shadow:0 1px 2px rgba(16,25,46,0.04), 0 14px 32px -26px rgba(16,25,46,0.18);">192.168.1.25</span>
<span aria-hidden style="color:var(--rd-ink-3, #94a3b8);">→ NAT →</span>
<span style="padding:0.5rem 0.9rem;border-radius:10px;background:color-mix(in srgb, var(--rd-good, #16a34a) 8%, var(--rd-surface));box-shadow:0 1px 2px rgba(16,25,46,0.04), 0 14px 32px -26px rgba(16,25,46,0.18);">203.0.113.9</span>
</div>
<p style="font-size:0.8em;color:var(--rd-ink-3, #94a3b8);margin:0 0 1.25rem;">The private address never leaves the building. Only its public stand-in does.</p>

Two more ranges are worth recognizing on sight:

<ul>
<li><code>127.0.0.1</code> is the <strong>loopback</strong> address, which always means "this machine itself."</li>
<li>An address starting with <code>169.254</code> means the device asked DHCP for an address and nobody answered, which we covered in the Protocols lesson.</li>
</ul>

For an analyst, the private ranges answer a basic question: is the traffic internal or external? Internal machines talking to each other during working hours is ordinary, but two patterns deserve a closer look:

<ul>
<li>An internal machine sending a large amount of data to a public address nobody recognizes</li>
<li>A public address connecting in to a remote-control port like 3389</li>
</ul>

### Where to read it

On Windows, `ipconfig /all` shows everything this lesson has covered, adapter by adapter. You will find the IPv4 address, the subnet mask and the default gateway: it also shows whether DHCP is enabled and which DNS servers the machine uses. When a computer cannot reach something, work through that output in order:

1. **Does it have a real address?** An address starting with 169.254 means DHCP failed.
2. **Are the mask and gateway right?** A wrong gateway strands the machine on its own subnet.
3. **Is the DNS server right?** If the machine can reach addresses but cannot resolve names, DNS is the problem. You have already seen this in the Home Lab, where a workstation cannot join the domain until its DNS server points at the domain controller.

You will also notice a much longer address in that output, labeled Link-local IPv6 Address and starting with `fe80`. That is **IPv6**, the newer version of IP. It uses 128-bit addresses written in hexadecimal, and Windows gives every adapter one automatically by default. You will meet IPv6 properly later. For now, it is enough to recognize it: it does not replace the IPv4 address next to it.

```sort
prompt: Private or public? Watch the edges of each range.
level: 1
Private: 10.20.30.40 | 172.16.5.9 | 172.31.200.1 | 192.168.0.12
Public: 8.8.8.8 | 11.0.0.1 | 172.32.0.5 | 192.169.1.1
```

```match
prompt: Match each prefix to its mask and the number of hosts it can hold.
level: 2
/24 = 255.255.255.0, with 254 usable hosts
/16 = 255.255.0.0, with 65,534 usable hosts
/26 = 255.255.255.192, with 62 usable hosts
/30 = 255.255.255.252, with 2 usable hosts
```

```sort
prompt: A workstation is at 10.40.8.25/24. Which addresses can it reach directly, and which go through its default gateway?
level: 3
Same subnet: 10.40.8.1 | 10.40.8.200 | 10.40.8.254
Through the gateway: 10.40.9.25 | 10.41.8.25 | 8.8.8.8
```
