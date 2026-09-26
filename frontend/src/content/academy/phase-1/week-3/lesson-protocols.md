### Protocols (Quick Reference)

A port tells you *which door* traffic is using. A protocol tells you *what happens* once it is through that door. New analysts mix the two up until they have seen enough traffic.

* **HTTP/HTTPS**: How web pages load. HTTPS is the encrypted version.
  * Example: a browser requesting a page is HTTP/HTTPS traffic on port 80/443.
* **DNS**: Translates names (google.com) into IP addresses.
  * Example: before a device can connect to anything by name, it makes a DNS lookup. That is why analysts check DNS logs early to see what a machine was trying to reach.
* **DHCP**: Hands out IP addresses to devices joining a network.
  * Example: a new laptop joining the office Wi-Fi gets its IP address through a DHCP request and response.
* **SMTP/POP3/IMAP**: Sending and receiving email.
  * SMTP sends mail out. POP3/IMAP are how a mail client pulls mail down from a server.

A port narrows traffic down to a category:

- web
- mail
- name lookups

The protocol is the conversation inside that category. You need both to read a packet capture with any confidence.

When you open a capture, name the door first, then the conversation. If the pair does not match what that host should be doing, that row is worth a second look.
