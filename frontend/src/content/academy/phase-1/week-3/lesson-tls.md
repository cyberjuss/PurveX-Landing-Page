### SSL/TLS: How "Encrypted" Actually Works

SSL is the older name. **TLS** is the modern standard that replaced it, though people still say "SSL" out of habit.

TLS wraps a connection in encryption. If someone captures the traffic, in Wireshark or anywhere else, they see scrambled data instead of readable content.

- Without TLS (HTTP): anyone watching the wire can read the data
- With TLS (HTTPS): the data is encrypted and watchers see only gibberish

TLS performs its own handshake, separate from TCP's. After the TCP three-way handshake sets up the connection, both sides negotiate encryption keys before any real data moves.

TCP's handshake sets up the *connection*. TLS's handshake sets up the *privacy*. They run back to back, and mixing them up is a common mistake on a new desk.

If the capture is HTTPS, do not expect to read the payload. You can still see who talked to whom, on which port, and that a TLS handshake happened. That is often enough to decide whether the conversation belongs.
