### TCP/IP: The Foundation

Before two devices on a network can exchange anything at all, two separate problems have to be solved:

- Each device needs an **address**, so others can find it among everything else connected.
- Both need a shared set of **rules** for how the conversation proceeds once they have found each other.

TCP/IP is the pair of protocols that solve those two problems, and keeping them separate in your mind is the first step to reading a capture.

**IP**, the Internet Protocol, handles the addressing. It gives every device an address in much the same way a building has a street address, and it is responsible for getting a piece of data from one address to another across whatever network equipment sits between them. IP does this on a best effort basis. It will try to deliver, but it makes no promise that anything arrives, and it does not check.

**TCP**, the Transmission Control Protocol, handles the conversation. It makes sure the data arrives complete and in the right order, which it does by numbering what it sends and waiting for the other side to confirm receipt. A useful way to picture it is a phone call where each side keeps checking that the other heard them. If something goes unacknowledged, TCP sends it again rather than assuming it got through.

The split is worth committing to memory, because it tells you where to look when something has gone wrong. **IP gets the data there. TCP makes sure it arrives correctly.** So when a capture looks broken, your first question is which of the two failed:

- A packet that **never found the host** is an addressing or routing problem.
- A host that **never confirmed receipt** is a different problem, with a different cause and a different set of people who need to know.
