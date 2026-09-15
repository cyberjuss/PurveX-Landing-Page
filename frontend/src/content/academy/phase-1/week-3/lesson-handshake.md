### **The Three-Way Handshake**

Before two computers exchange data over TCP, they "shake hands" to agree they're both ready:

1. **SYN** — Computer A: "I'd like to connect."  
2. **SYN-ACK** — Computer B: "Okay, I'm ready too."  
3. **ACK** — Computer A: "Great, let's go."

Only after these three steps does actual data start flowing.

* **Fundamental:** This handshake is why TCP is called "reliable" — both sides confirm the connection before anything important is sent.
