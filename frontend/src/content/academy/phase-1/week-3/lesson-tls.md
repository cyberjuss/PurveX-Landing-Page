### SSL/TLS: How "Encrypted" Actually Works

SSL is the older name. **TLS** is the modern standard that replaced it, though the field still says "SSL" out of habit more often than accuracy.

TLS wraps a connection in encryption so that even if someone captures the traffic, in Wireshark or otherwise, what they see is scrambled data rather than readable content.

* Without TLS (HTTP): anyone watching the wire can read the data
* With TLS (HTTPS): the data is encrypted, and watchers see only gibberish

TLS performs a "handshake" of its own, separate from TCP's. After the TCP three-way handshake establishes the connection, both sides negotiate encryption keys before any real data moves.

* **Fundamental:** TCP's handshake sets up the *connection*. TLS's handshake sets up the *privacy*. Two separate handshakes, back to back, and conflating them is one of the more common mistakes a new analyst makes.
