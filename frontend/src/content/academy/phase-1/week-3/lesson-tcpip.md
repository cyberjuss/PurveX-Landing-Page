### TCP/IP: The Foundation

Before two devices on a network can exchange anything at all, they have two separate problems to solve:

- Each device needs an **address**, so others can find it among everything else connected.
- Both need a shared set of **rules** for how the conversation proceeds once they have found each other.

TCP/IP is the pair of protocols that solves those two problems, one each. Keeping the two jobs separate in your mind is the first step to reading a capture.

The first of the pair, **IP** (the Internet Protocol), handles the addressing. It gives every device an address, much like a building's street address. It's responsible for getting data from one address to another across whatever network equipment sits in between. It's worth knowing that IP only makes a best effort. It tries to deliver your data, but it doesn't promise that anything arrives, and it doesn't check.

That's where the second protocol comes in. **TCP** (the Transmission Control Protocol) handles the conversation itself, making sure the data arrives complete and in the right order. It does that by numbering everything it sends and waiting for the other side to confirm it arrived. A good way to picture it is a phone call where each person keeps checking that the other heard them. So if something goes unconfirmed, TCP sends it again rather than assuming it got through.

That split is worth committing to memory, because it tells you where to look when something goes wrong. **IP gets the data there. TCP makes sure it arrives correctly.** So when a capture looks broken, your first question is which of the two failed:

- A packet that **never found the host** is an addressing or routing problem.
- A host that **never confirmed receipt** is a different problem. The data reached the machine, but the conversation broke down: the service may not be listening, a firewall may be dropping the replies, or the host may be overloaded. That has a different cause and a different set of people who need to know.

```sort
prompt: Whose job is it, IP or TCP?
IP: Giving every device an address | Moving data from one address to another | A packet that never found the host
TCP: Making sure data arrives complete and in order | Numbering what it sends and waiting for confirmation | Resending anything that goes unacknowledged
```
