### SSL/TLS: How "Encrypted" Actually Works

SSL is the older name. **TLS** is the modern standard that replaced it. The field still says "SSL" out of habit more often than accuracy.

TLS wraps a connection in encryption so that even if someone captures the traffic, in Wireshark or otherwise, what they see is scrambled data rather than readable content.

- Without TLS (HTTP): anyone watching the wire can read the data
- With TLS (HTTPS): the data is encrypted and watchers see only gibberish

TLS performs a handshake of its own separate from TCP's. After the TCP three-way handshake establishes the connection both sides negotiate encryption keys before any real data moves.

TCP's handshake sets up the *connection*. TLS's handshake sets up the *privacy*. Two separate handshakes back to back. Mixing them up is a common mistake on a new desk.

If the capture is HTTPS do not expect to read the payload. You can still see who talked to whom, which port, and that a TLS handshake happened. That is often enough to decide whether the conversation belongs.
