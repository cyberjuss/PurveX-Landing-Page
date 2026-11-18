### TCP/IP: The Foundation

Before two devices on a network can exchange anything, they have two separate problems to solve:

- Each device needs an **address**, so others can find it among everything else connected.
- Both need a shared set of **rules** for how the conversation proceeds once they have found each other.

TCP/IP is the pair of protocols that solves those problems, one each, and keeping the two jobs separate in your mind is the first step to reading a capture.

The first of the pair, **IP** (the Internet Protocol), handles the addressing. It gives every device an address, much like a building's street address, and moves data from one address to another across whatever equipment sits in between. IP only makes a best effort, though:

- It tries to deliver your data
- It does not promise that anything arrives
- It does not check

That is where the second protocol comes in. **TCP** (the Transmission Control Protocol) makes sure the data arrives complete and in the right order, a bit like a phone call where each person keeps checking the other heard them:

- It numbers everything it sends
- It waits for the other side to confirm each piece arrived
- If something goes unconfirmed, it sends that piece again

That split is worth committing to memory, because it tells you where to look when something goes wrong. **IP gets the data there, and TCP makes sure it arrives correctly.** So when a capture looks broken, your first question is which of the two failed:

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
