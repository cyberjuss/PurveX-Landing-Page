### TCP/IP: The Foundation

Two devices need two things before they can talk:

- Each device needs an **address**, so others can find it among everything else connected.
- Both need a shared set of **rules** for how the conversation proceeds once they have found each other.

TCP/IP is the pair of protocols that solves them, one each.

**IP** (the Internet Protocol) handles addressing. It gives every device an address and moves data from one address to another. It only makes a best effort: it doesn't promise delivery or check.

**TCP** (the Transmission Control Protocol) makes sure data arrives complete and in order. It numbers what it sends, waits for confirmation, and resends anything unconfirmed.

**IP gets the data there. TCP makes sure it arrives correctly.** When a capture looks broken, ask which failed:

- A packet that **never found the host** is an addressing or routing problem.
- A host that **never confirmed receipt** got the data, but the conversation broke down. The service may not be listening, a firewall may be dropping replies, or the host may be overloaded.

```sort
prompt: Whose job is it, IP or TCP?
IP: Giving every device an address | Moving data from one address to another | A packet that never found the host
TCP: Making sure data arrives complete and in order | Numbering what it sends and waiting for confirmation | Resending anything that goes unacknowledged
```
