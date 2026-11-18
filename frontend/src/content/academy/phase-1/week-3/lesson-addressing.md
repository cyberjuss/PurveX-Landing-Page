### IP Addresses and Subnets

In the TCP/IP lesson, we said that IP gives every device an address. Now we will learn to read one, because an address tells you more than where a device lives. It tells you:

<ul>
<li>Which machines it can reach directly</li>
<li>Whether a conversation stays inside the building</li>
<li>Very often, why a computer that looks perfectly healthy cannot reach anything at all</li>
</ul>

A large share of "the network is down" tickets on a help desk come down to one of the few ideas in this lesson.

### Reading an IPv4 address

An IPv4 address is 32 bits long, written as four numbers separated by dots, such as `192.168.1.25`.

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

The most common subnet mask is `255.255.255.0`. Read it octet by octet, where 255 means "this octet belongs to the network" and 0 means "this octet belongs to the host". So for `192.168.1.25` with that mask, the network is `192.168.1` and the device is host 25 on it.

Writing out the mask every time gets tedious, so engineers use a shorter form called **CIDR notation**. It simply counts how many bits belong to the network. The mask `255.255.255.0` gives the first 24 bits to the network, so the same address is written `192.168.1.25/24`. The number after the slash is called the **prefix**.

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

Two patterns in that table are worth committing to memory:

<ul>
<li>A subnet with prefix <code>/n</code> holds 2 to the power of (32 minus n) addresses, so every bit you add to the prefix cuts the subnet in half.</li>
<li>The usable count is always two short, because two addresses in every subnet are reserved. The <strong>network address</strong> names the subnet itself (<code>192.168.1.0</code>), and the <strong>broadcast address</strong> reaches every device on the subnet at once (<code>192.168.1.255</code>). Neither can be given to a computer.</li>
</ul>

### Same subnet or not

This is where addressing starts to matter on the job. Two devices on the same subnet talk to each other directly. When the destination is on a different subnet, the device cannot reach it on its own, so it hands the traffic to its **default gateway**, which is the router that connects its subnet to everything else.

To decide which case applies, compare the network parts. Take a workstation at `192.168.1.25/24`, where the first three octets are the network:

<div style="display:flex;gap:1rem;flex-wrap:wrap;margin:1rem 0;">
<div style="flex:1 1 220px;padding:0.1rem 0 0.1rem 0.9rem;border-left:3px solid var(--rd-good, #16a34a);">
<strong style="display:block;font-size:0.75em;text-transform:uppercase;letter-spacing:0.05em;color:var(--rd-good, #16a34a);margin-bottom:2px;">Same subnet</strong>
<code>192.168.1.200</code> shares <code>192.168.1</code> with the workstation, so it reaches it directly.
</div>
<div style="flex:1 1 220px;padding:0.1rem 0 0.1rem 0.9rem;border-left:3px solid var(--rd-warn, #d97706);">
<strong style="display:block;font-size:0.75em;text-transform:uppercase;letter-spacing:0.05em;color:var(--rd-warn, #d97706);margin-bottom:2px;">Through the gateway</strong>
<code>192.168.2.25</code> has a different third octet, so that traffic goes through the gateway.
</div>
</div>

With a `/16`, you would compare only the first two octets. Prefixes larger than `/24` split the last octet itself, which catches people out. A `/26` divides it into four blocks of 64:

<ul>
<li><code>.0</code> to <code>.63</code></li>
<li><code>.64</code> to <code>.127</code></li>
<li><code>.128</code> to <code>.191</code></li>
<li><code>.192</code> to <code>.255</code></li>
</ul>

So `10.0.0.70/26` and `10.0.0.130/26` sit on different subnets, even though their first three octets match.

This explains one of the most recognizable help desk patterns. When a computer's default gateway is missing or wrong, it can still reach printers and machines on its own subnet, but it cannot reach anything beyond it. The user reports that "some things work and some do not," and the gateway is the first thing to check.

### Private and public addresses

Three ranges are set aside for private networks by a standard called RFC 1918:

<ul>
<li><code>10.0.0.0/8</code>, which is every address starting with 10</li>
<li><code>172.16.0.0/12</code>, which runs from <code>172.16.0.0</code> to <code>172.31.255.255</code></li>
<li><code>192.168.0.0/16</code>, which is every address starting with 192.168</li>
</ul>

Routers on the internet do not carry these addresses, so any organization can reuse them internally. When a machine with a private address browses the web, the router or firewall at the edge of the network swaps its private address for a public one on the way out. That swap is called **NAT** (Network Address Translation).

<div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;margin:1rem 0 0.3rem;font-family:var(--font-mono, ui-monospace, monospace);font-size:0.95em;">
<span style="padding:0.4rem 0.7rem;border-left:3px solid var(--rd-accent);">192.168.1.25</span>
<span aria-hidden style="color:var(--rd-ink-3, #94a3b8);">→ NAT →</span>
<span style="padding:0.4rem 0.7rem;border-left:3px solid var(--rd-good, #16a34a);">203.0.113.9</span>
</div>
<p style="font-size:0.8em;color:var(--rd-ink-3, #94a3b8);margin:0 0 1.25rem;">The private address never leaves the building. Only its public stand-in does.</p>

Two more ranges are worth recognizing on sight:

<ul>
<li><code>127.0.0.1</code> is the <strong>loopback</strong> address, which always means "this machine itself."</li>
<li>An address starting with <code>169.254</code> means the device asked DHCP for an address and nobody answered, which we covered in the Protocols lesson.</li>
</ul>

For an analyst, the private ranges answer the first question you ask of any line in a capture, which is whether the traffic is internal or external. Internal machines talking to each other during working hours is ordinary. Two patterns deserve a closer look:

<ul>
<li>An internal machine sending a large amount of data to a public address nobody recognizes</li>
<li>A public address connecting in to a remote-control port like 3389</li>
</ul>

### Where to read it

On Windows, `ipconfig /all` shows everything this lesson has covered, adapter by adapter. You will find the IPv4 address, the subnet mask and the default gateway, along with whether DHCP is enabled and which DNS servers the machine uses. When a computer cannot reach something, work through that output in order:

1. **Does it have a real address?** An address starting with 169.254 means DHCP failed.
2. **Are the mask and gateway right?** A wrong gateway strands the machine on its own subnet.
3. **Is the DNS server right?** If the machine can reach addresses but cannot resolve names, DNS is the problem. You have already seen this in the Home Lab, where a workstation cannot join the domain until its DNS server points at the domain controller.

You will also notice a much longer address in that output, labeled Link-local IPv6 Address and starting with `fe80`. That is **IPv6**, the newer version of IP, which uses 128-bit addresses written in hexadecimal. Windows gives every adapter one automatically by default. You will meet IPv6 properly later, so for now it is enough to recognize it and know that it does not replace the IPv4 address next to it.

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
