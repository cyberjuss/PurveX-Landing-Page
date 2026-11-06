### SSL/TLS: What "Encrypted" Means

SSL is the old name. **TLS** replaced it, but people still say SSL.

TLS encrypts a connection and uses the server's certificate to prove the client reached the right site.

- Without TLS (HTTP): anyone watching the wire can read the data
- With TLS (HTTPS): the data is encrypted and watchers see only gibberish

TLS has its own handshake. TCP's handshake runs first and sets up the connection. Then the TLS handshake agrees keys. Only then does data move.

Keep them apart by what each produces:

- **TCP's handshake** sets up the **connection**.
- **TLS's handshake** sets up the **privacy**.

You can't read an HTTPS payload in Wireshark.

But you can still see:

- which two machines talked
- which ports they used
- when the conversation happened
- how much data moved, and in which direction
- that a TLS handshake took place at all
- in most connections, the name of the site requested, because the client sends it before encryption starts

That's usually enough to decide whether the conversation belongs. Analysts work from this far more often than from payloads.

```match
prompt: Match each one to what it does.
TCP's handshake = Sets up the connection
TLS's handshake = Sets up the privacy
HTTP = Anyone watching the wire can read the data
HTTPS = The data is encrypted and watchers see only gibberish
```
