### **Protocols (Quick Reference)**

Ports tell you *which door* traffic is using. Protocols tell you *what's actually happening* once it's through that door.

* **HTTP/HTTPS**: How web pages load. HTTPS is the encrypted version.  
  * Example: a browser requesting a page is HTTP/HTTPS traffic on port 80/443.
* **DNS**: Translates names (google.com) into IP addresses.  
  * Example: before a device can connect to anything by name, it makes a DNS lookup first. That's why DNS logs are one of the first places analysts check to see what a machine was actually trying to reach.
* **DHCP**: Automatically hands out IP addresses to devices joining a network.  
  * Example: a new laptop joining the office Wi-Fi gets its IP address from a DHCP request/response, not a human typing one in.
* **SMTP/POP3/IMAP**: Sending and receiving email.  
  * SMTP sends mail out. POP3/IMAP are how a mail client pulls mail down from a server.

* **Fundamental:** A port narrows traffic down to a category (web, mail, name lookups). The protocol is the actual conversation happening inside that category. Knowing both is what lets you read a packet capture instead of just staring at a list of numbers.
