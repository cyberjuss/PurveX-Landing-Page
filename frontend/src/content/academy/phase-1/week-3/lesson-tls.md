### SSL/TLS: What "Encrypted" Means

Before we get into how it works, a quick word on the name. SSL is the older term, and **TLS** is the modern standard that replaced it. The old name stuck around in conversation and in product documentation, so for the rest of your career you'll hear people say SSL when they mean TLS. Either way, they're talking about the same job.

That job has two parts. TLS wraps a connection in encryption, and it uses the server's certificate to prove that the client has reached the site it meant to reach. As a result, anybody capturing the traffic sees scrambled data where the content used to be. You can see the difference by comparing the two cases:

- Without TLS (HTTP): anyone watching the wire can read the data
- With TLS (HTTPS): the data is encrypted and watchers see only gibberish

To set up that encryption, TLS performs a handshake of its own, separate from the TCP handshake you learned about earlier this week. The order of the two is what confuses people at first. The TCP three-way handshake always runs first and establishes the connection itself. Only after it completes do the two sides start negotiating encryption keys, and only once that second negotiation finishes does any real data move.

The clearest way to keep the two apart is by what each one produces:

- **TCP's handshake** sets up the **connection**.
- **TLS's handshake** sets up the **privacy**.

Because they run back to back on the same conversation, a capture shows them one after the other, and mistaking one for the other is a common slip on a new desk.

All of this changes what you can expect to get out of a capture, and it's better to adjust that expectation now than to spend an afternoon fighting it. If a conversation is HTTPS, you won't be able to read the payload, and no amount of work in Wireshark will change that.

The good news is that encryption hides surprisingly little else. Even with HTTPS, you can still see:

- which two machines talked
- which ports they used
- when the conversation happened
- how much data moved, and in which direction
- that a TLS handshake took place at all
- in most connections, the name of the site requested, because the client sends it before encryption starts

In practice, that outside information is often enough to decide whether the conversation belongs there, which was the decision you were trying to make all along. In fact, analysts work from this kind of information far more often than they read payloads.

```match
prompt: Match each one to what it does.
TCP's handshake = Sets up the connection
TLS's handshake = Sets up the privacy
HTTP = Anyone watching the wire can read the data
HTTPS = The data is encrypted and watchers see only gibberish
```
