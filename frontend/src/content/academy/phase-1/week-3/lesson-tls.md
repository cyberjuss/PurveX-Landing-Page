### SSL/TLS: What "Encrypted" Means

First, a quick word on the name. SSL is the older term and **TLS** is the modern standard that replaced it, but the old name stuck, so you'll hear people say SSL when they mean TLS for the rest of your career.

TLS does two jobs. It wraps a connection in encryption, and it uses the server's certificate to prove that the client has reached the site it meant to reach. You can see what that changes by comparing the two cases:

- Without TLS (HTTP): anyone watching the wire can read the data
- With TLS (HTTPS): the data is encrypted and watchers see only gibberish

To set up that encryption, TLS performs a handshake of its own, and the order is what confuses people at first. The TCP three-way handshake always runs first and establishes the connection. Only after it completes do the two sides negotiate encryption keys, and only once that finishes does any real data move. The clearest way to keep the two apart is by what each one produces:

- **TCP's handshake** sets up the **connection**.
- **TLS's handshake** sets up the **privacy**.

This changes what you can expect from a capture, and it's better to adjust that expectation now than to spend an afternoon fighting it. If a conversation is HTTPS, you won't be able to read the payload in Wireshark. The good news is that encryption hides surprisingly little else, and you can still see:

- which two machines talked
- which ports they used
- when the conversation happened
- how much data moved, and in which direction
- that a TLS handshake took place at all
- in most connections, the name of the site requested, because the client sends it before encryption starts

In practice, that outside information is usually enough to decide whether a conversation belongs, which was the decision you were trying to make all along. Analysts work from it far more often than they read payloads.

```match
prompt: Match each one to what it does.
TCP's handshake = Sets up the connection
TLS's handshake = Sets up the privacy
HTTP = Anyone watching the wire can read the data
HTTPS = The data is encrypted and watchers see only gibberish
```
