## **Introduction to Basic Networking Concepts**

### **Essential Question**

How does data actually move between two computers, and how do analysts tell ordinary traffic from something worth a second look?

### **Overview**

This lesson builds the networking foundation the rest of the course depends on: TCP/IP addressing, the TCP three-way handshake, common ports and protocols, and how TLS layers encryption on top of an established connection.

### **TCP/IP: The Foundation**

Every device on a network needs two things: an address (so others can find it) and a set of rules for how to talk. That's what TCP/IP provides.

* **IP (Internet Protocol):** Gives every device an address (like a street address) so data knows where to go.  
* **TCP (Transmission Control Protocol):** Makes sure data arrives complete and in order — like a phone call where you confirm "did you get that?"

**Fundamental:** IP gets the data *there*. TCP makes sure it arrives *correctly*.

### **The Three-Way Handshake**

Before two computers exchange data over TCP, they "shake hands" to agree they're both ready:

1. **SYN** — Computer A: "I'd like to connect."  
2. **SYN-ACK** — Computer B: "Okay, I'm ready too."  
3. **ACK** — Computer A: "Great, let's go."

Only after these three steps does actual data start flowing.

* **Fundamental:** This handshake is why TCP is called "reliable" — both sides confirm the connection before anything important is sent.

### **Common Ports**

A port is like an apartment number — the IP address gets you to the building, the port gets you to the right door.

| Port | Protocol | Use |
| :---- | :---- | :---- |
| 20/21 | FTP | File transfer |
| 22 | SSH | Secure remote login |
| 23 | Telnet | Remote login (unencrypted) |
| 25 | SMTP | Sending email |
| 53 | DNS | Domain name lookups |
| 80 | HTTP | Web traffic (unencrypted) |
| 443 | HTTPS | Web traffic (encrypted) |
| 3389 | RDP | Remote desktop |

* **Fundamental:** If you see traffic on port 22 or 3389 from somewhere it shouldn't be, that's worth a second look — those ports mean someone's trying to *control* a machine, not just browse it.

### **Protocols (Quick Reference)**

* **HTTP/HTTPS** — how web pages load; HTTPS is the encrypted version  
* **DNS** — translates names (google.com) into IP addresses  
* **DHCP** — automatically hands out IP addresses to devices joining a network  
* **SMTP/POP3/IMAP** — sending and receiving email

### **SSL/TLS: How "Encrypted" Actually Works**

SSL is the older name; **TLS** is the modern standard — people often still say "SSL" out of habit.

TLS wraps a connection in encryption so that even if someone captures the traffic (like in Wireshark), they see scrambled data instead of readable content.

* Without TLS (HTTP): anyone watching the wire can read the data  
* With TLS (HTTPS): the data is encrypted; watchers see gibberish

TLS also does a "handshake" of its own — after the TCP three-way handshake, both sides agree on encryption keys before any real data moves.

* **Fundamental:** TCP's handshake sets up the *connection*. TLS's handshake sets up the *privacy*. Two separate handshakes, back to back.

