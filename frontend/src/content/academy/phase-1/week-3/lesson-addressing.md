### IP Addresses and Subnets

In the TCP/IP lesson, we said that IP gives every device an address. Now we'll learn to read one, because an address tells you more than where a device lives. It tells you which machines it can reach directly, whether a conversation stays inside the building, and very often why a computer that looks perfectly healthy can't reach anything at all. A large share of "the network is down" tickets on a help desk come down to one of the few ideas in this lesson.

### Reading an IPv4 address

An IPv4 address is 32 bits long, and we write it as four numbers separated by dots, such as `192.168.1.25`. Each of those numbers is called an **octet**, because it stands for 8 bits, so each one can only run from 0 to 255. If you ever see an octet of 256 or higher, the address isn't valid, and you're looking at a typo.

Every address has two parts, much like a street address. The **network part** says which street the device is on, and the **host part** says which house on that street it is. The address on its own doesn't say where one part ends and the other begins. That's the job of the subnet mask.

### The subnet mask and CIDR

The most common subnet mask is `255.255.255.0`. Read it octet by octet, where 255 means "this octet belongs to the network" and 0 means "this octet belongs to the host". So for `192.168.1.25` with that mask, the network is `192.168.1` and the device is host 25 on it.

Writing out the mask every time gets tedious, so engineers use a shorter form called **CIDR notation**. It simply counts how many bits belong to the network. The mask `255.255.255.0` gives the first 24 bits to the network, so the same address is written `192.168.1.25/24`. The number after the slash is called the **prefix**.

| Prefix | Subnet mask | Addresses | Usable hosts |
| :---- | :---- | :---- | :---- |
| /8 | 255.0.0.0 | 16,777,216 | 16,777,214 |
| /16 | 255.255.0.0 | 65,536 | 65,534 |
| /24 | 255.255.255.0 | 256 | 254 |
| /25 | 255.255.255.128 | 128 | 126 |
| /26 | 255.255.255.192 | 64 | 62 |
| /30 | 255.255.255.252 | 4 | 2 |

Two patterns in that table are worth committing to memory. First, a subnet with prefix `/n` holds 2 to the power of (32 minus n) addresses, so every bit you add to the prefix cuts the subnet in half. Second, the usable count is always two short, because two addresses in every subnet are reserved. The first one is the **network address**, which names the subnet itself (`192.168.1.0`). The last one is the **broadcast address**, which reaches every device on the subnet at once (`192.168.1.255`). Neither can be given to a computer.

### Same subnet or not

This is where addressing starts to matter on the job. Two devices on the same subnet talk to each other directly. When the destination is on a different subnet, the device can't reach it on its own, so it hands the traffic to its **default gateway**, which is the router that connects its subnet to everything else.

To decide which case applies, compare the network parts. Take a workstation at `192.168.1.25/24`, where the first three octets are the network:

- `192.168.1.200` shares `192.168.1`, so it's on the same subnet and the workstation reaches it directly.
- `192.168.2.25` has a different third octet, so that traffic goes through the gateway.

With a `/16`, you'd compare only the first two octets. Prefixes larger than `/24` split the last octet itself, which catches people out. A `/26` divides it into four blocks of 64, which are `.0` to `.63`, `.64` to `.127`, `.128` to `.191` and `.192` to `.255`. So `10.0.0.70/26` and `10.0.0.130/26` sit on different subnets, even though their first three octets match.

This explains one of the most recognizable help desk patterns. When a computer's default gateway is missing or wrong, it can still reach printers and machines on its own subnet, but it can't reach anything beyond it. The user reports that "some things work and some don't", and the gateway is the first thing to check.

### Private and public addresses

Three ranges are set aside for private networks by a standard called RFC 1918:

- `10.0.0.0/8`, which is every address starting with 10
- `172.16.0.0/12`, which runs from `172.16.0.0` to `172.31.255.255`
- `192.168.0.0/16`, which is every address starting with 192.168

Routers on the internet don't carry these addresses, so any organization can reuse them internally. When a machine with a private address browses the web, the router or firewall at the edge of the network swaps its private address for a public one on the way out. That swap is called **NAT** (Network Address Translation). Two more ranges are worth recognizing on sight. `127.0.0.1` is the **loopback** address, which always means "this machine itself". An address starting with `169.254` means the device asked DHCP for an address and nobody answered, which we covered in the Protocols lesson.

For an analyst, the private ranges answer the first question you ask of any line in a capture, which is whether the traffic is internal or external. Internal machines talking to each other during working hours is ordinary. An internal machine sending a large amount of data to a public address nobody recognizes deserves a closer look, and so does a public address connecting in to a remote-control port like 3389.

### Where to read it

On Windows, `ipconfig /all` shows everything this lesson has covered, adapter by adapter. You'll find the IPv4 address, the subnet mask and the default gateway, along with whether DHCP is enabled and which DNS servers the machine uses. When a computer can't reach something, work through that output in order:

1. **Does it have a real address?** An address starting with 169.254 means DHCP failed.
2. **Are the mask and gateway right?** A wrong gateway strands the machine on its own subnet.
3. **Is the DNS server right?** If the machine can reach addresses but can't resolve names, DNS is the problem. You've already seen this in the Home Lab, where a workstation can't join the domain until its DNS server points at the domain controller.

You'll also notice a much longer address in that output, labeled Link-local IPv6 Address and starting with `fe80`. That's **IPv6**, the newer version of IP, which uses 128-bit addresses written in hexadecimal. Windows gives every adapter one automatically by default. You'll meet IPv6 properly later, so for now it's enough to recognize it and know that it doesn't replace the IPv4 address next to it.

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
