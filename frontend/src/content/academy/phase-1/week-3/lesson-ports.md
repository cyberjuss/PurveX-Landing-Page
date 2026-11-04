### Common Ports

Once the handshake has connected two machines, the port decides which service on the far machine you're talking to. In other words, a port is the second half of a network destination: if the IP address gets you to the building, the port gets you to the right door inside it. Every network service on a device listens on its own port, which is what lets a single machine with one address run a web server, a mail server and a remote login service all at once, without any of them getting in each other's way.

Some ports are used so consistently that the number alone tells you what service is almost certainly on the other end. Here are the ones you'll meet most often.

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

Two entries in that table deserve special attention. If you see traffic on port 22 or port 3389 coming from somewhere you didn't expect, it's always worth a second look, because both ports exist to let someone control a machine rather than just fetch something from it. That's exactly why attackers reach for them once they've got a foothold. It's also why traffic on those ports between two internal machines that have no business talking to each other is one of the more useful things to watch for.

At the same time, be careful not to read more into a port number than it can tell you. A port tells you which door the traffic used, and nothing more. It doesn't tell you the conversation was legitimate, because an attacker is free to run any service on any port they like. So before you draw a conclusion, check three things:

- The host involved
- The direction the connection traveled
- Whether that service has any reason to be running there at all

```sort
prompt: Match each port to its protocol.
SSH: 22
Telnet: 23
SMTP: 25
DNS: 53
HTTPS: 443
RDP: 3389
```
