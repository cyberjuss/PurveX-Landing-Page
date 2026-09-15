### **SSL/TLS: How "Encrypted" Actually Works**

SSL is the older name; **TLS** is the modern standard — people often still say "SSL" out of habit.

TLS wraps a connection in encryption so that even if someone captures the traffic (like in Wireshark), they see scrambled data instead of readable content.

* Without TLS (HTTP): anyone watching the wire can read the data  
* With TLS (HTTPS): the data is encrypted; watchers see gibberish

TLS also does a "handshake" of its own — after the TCP three-way handshake, both sides agree on encryption keys before any real data moves.

* **Fundamental:** TCP's handshake sets up the *connection*. TLS's handshake sets up the *privacy*. Two separate handshakes, back to back.
