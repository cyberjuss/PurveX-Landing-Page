### Common Ports

Once the handshake has connected two machines, the port decides which service on the far machine you're talking to. A port is the second half of a network destination. If the IP address gets you to the building, the port gets you to the right door inside it. Every network service on a device listens on its own port. That's what lets one machine with one address run a web server, a mail server and a remote login service at once, without any of them getting in each other's way.

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

A domain controller adds its own set. These are normal on a DC, so learn them well enough that anything else on the list stands out.

| Port | Protocol | Use |
| :---- | :---- | :---- |
| 88 | Kerberos | Sign-in tickets |
| 135 | RPC | Windows remote management calls |
| 389 / 636 | LDAP / LDAPS | Directory lookups (636 is encrypted) |
| 445 | SMB | File shares |
| 3268 / 3269 | Global Catalog | Directory lookups across the forest |
| 5985 | WinRM | Remote PowerShell |

Two entries in the first table deserve special attention. Traffic on port 22 or port 3389 from somewhere you didn't expect is always worth a second look. Both ports exist to let someone control a machine, not just fetch something from it. That's why attackers reach for them once they've got a foothold. It's also why traffic on those ports between two internal machines that have no business talking to each other is one of the more useful things to watch for.

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
