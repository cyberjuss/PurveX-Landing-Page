### TCP/IP: The Foundation

Before two devices on a network can exchange anything, they have two separate problems to solve:

- Each device needs an **address**, so others can find it among everything else connected.
- Both need a shared set of **rules** for how the conversation proceeds once they have found each other.

TCP/IP is the pair of protocols that solves those problems, one each, and keeping the two jobs separate in your mind is the first step to reading a capture.

The first of the pair, **IP** (the Internet Protocol), handles the addressing. It gives every device an address, much like a building's street address, and moves data from one address to another across whatever equipment sits in between. It's worth knowing that IP only makes a best effort. It tries to deliver your data, but it doesn't promise that anything arrives, and it doesn't check.

That's where the second protocol comes in. **TCP** (the Transmission Control Protocol) makes sure the data arrives complete and in the right order. It numbers everything it sends and waits for the other side to confirm it arrived, a bit like a phone call where each person keeps checking the other heard them, and if something goes unconfirmed, TCP sends it again.

That split is worth committing to memory, because it tells you where to look when something goes wrong. **IP gets the data there, and TCP makes sure it arrives correctly.** So when a capture looks broken, your first question is which of the two failed:

- A packet that **never found the host** is an addressing or routing problem.
- A host that **never confirmed receipt** got the data, but the conversation broke down. The service may not be listening, a firewall may be dropping replies, or the host may be overloaded.

```sort
prompt: Whose job is it, IP or TCP?
level: 1
IP: Giving every device an address | Moving data from one address to another | A packet that never found the host
TCP: Making sure data arrives complete and in order | Numbering what it sends and waiting for confirmation | Resending anything that goes unacknowledged
```
