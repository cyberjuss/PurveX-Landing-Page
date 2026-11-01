### SSL/TLS: What "Encrypted" Means

A word on names before anything else. SSL is the older term and **TLS** is the modern standard that replaced it. The old name stuck in conversation and in product documentation, so you will hear people say SSL when they mean TLS for the rest of your career. They are referring to the same job.

That job is to wrap a connection in encryption, and to prove through the server's certificate that the client has reached the site it meant to. Anybody capturing the traffic sees scrambled data where the content used to be. Compare the two cases:

- Without TLS (HTTP): anyone watching the wire can read the data
- With TLS (HTTPS): the data is encrypted and watchers see only gibberish

TLS performs a handshake of its own, separate from the TCP handshake covered earlier in the week. The order of the two is what confuses people at first. The TCP three-way handshake runs first and establishes the connection itself. Only once that has completed do the two sides begin negotiating encryption keys, and only once that second negotiation finishes does any actual data move.

The cleanest way to hold the two apart is by what each one produces:

- **TCP's handshake** sets up the **connection**.
- **TLS's handshake** sets up the **privacy**.

They run back to back on the same conversation, so a capture shows them one after another. Reading one as the other is a common mistake on a new desk.

This changes what you can expect to get out of a capture, and it is better to adjust that expectation early than to spend an afternoon fighting it. If a conversation is HTTPS, you are not going to read the payload. No amount of work in Wireshark will change that.

What encryption does not hide is almost everything else. You can still see:

- which two machines talked
- which ports they used
- when the conversation happened
- how much data moved, and in which direction
- that a TLS handshake took place at all
- in most connections, the name of the site requested, because the client sends it before encryption starts

In practice that is frequently enough to decide whether the conversation belongs there, which is the decision you were trying to make. Analysts work from this outside information far more often than they read payloads.

```match
prompt: Match each one to what it does.
TCP's handshake = Sets up the connection
TLS's handshake = Sets up the privacy
HTTP = Anyone watching the wire can read the data
HTTPS = The data is encrypted and watchers see only gibberish
```
