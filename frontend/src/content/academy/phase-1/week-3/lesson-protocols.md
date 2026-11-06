### Protocols

If a port is the door, a protocol is the rules for the conversation inside. Convention ties them so closely you can usually guess one from the other, but they're separate. Attackers use that gap, for example running their traffic over port 443 so it passes for web browsing.

#### HTTP and HTTPS

HTTP (port 80) and HTTPS (port 443) load web pages.

HTTPS is HTTP encrypted, so nobody on the wire can read it. Almost all legitimate web traffic is HTTPS now, so plain HTTP carrying credentials or business data is worth asking about.

#### DNS

DNS turns names into IP addresses. The network only routes on addresses, so a device looks up a name such as google.com before connecting.

So DNS logs are one of the best records of what a machine tried to reach, including attempts that failed. They miss cached answers, direct-to-IP connections and encrypted DNS (DoH). A device looking up a name it has no business wanting is often the first sign of trouble.

#### DHCP

DHCP hands out addresses as devices join a network, along with the gateway and DNS server to use.

DHCP is almost universal, so an exception is interesting. An address starting 169.254 means the device asked and nobody answered, a network fault. Any other address no DHCP server issued was set by hand. Find out why.

#### SMTP, POP3, and IMAP

SMTP sends mail outward. POP3 and IMAP let a mail client pull messages down from a server.

Only mail servers and mail clients should speak these. SMTP from a host with no reason to send mail is worth following up, because sending mail is a common use of a compromised machine.

```sort
prompt: Match each job to the protocol that does it.
DNS: Turns a name like google.com into an IP address
DHCP: Hands an address to a laptop joining the Wi-Fi
SMTP: Carries mail outward toward its destination
IMAP: Lets a mail client pull messages down from a server
```
