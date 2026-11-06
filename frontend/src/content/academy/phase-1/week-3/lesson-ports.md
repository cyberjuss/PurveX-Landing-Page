### Common Ports

Once the handshake has connected two machines, the port decides which service on the far machine you're talking to. If the IP address gets you to the building, the port gets you to the right door inside it. Every service listens on its own port, which is what lets one machine run a web server, a mail server and a remote login service all at once.

Some ports are used so consistently that the number alone tells you which service is almost certainly on the other end. These are the ones you'll meet most often:

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

A domain controller adds a set of its own. These are all normal on a DC, so it's worth learning them well enough that anything else on the list stands out:

| Port | Protocol | Use |
| :---- | :---- | :---- |
| 88 | Kerberos | Sign-in tickets |
| 135 | RPC | Windows remote management calls |
| 389 / 636 | LDAP / LDAPS | Directory lookups (636 is encrypted) |
| 445 | SMB | File shares |
| 3268 / 3269 | Global Catalog | Directory lookups across the forest |
| 5985 | WinRM | Remote PowerShell |

Two entries in the first table deserve special attention. Ports 22 and 3389 both exist to let someone control a machine rather than just fetch something from it, which is why attackers reach for them once they have a foothold. So traffic on those ports between two internal machines that have no business talking to each other is one of the more useful things to watch for.

At the same time, be careful not to read more into a port number than it can tell you. A port shows which door the traffic used, but it doesn't tell you the conversation was legitimate, because anyone can run any service on any port. So before you draw a conclusion, check:

- The host involved
- The direction the connection traveled
- Whether that service has any reason to be running there at all

```match
prompt: Which port would you expect to see for each of these?
level: 2
53 = A laptop looking up portal.purvexfinancial.local
88 = A user signing in to the domain
445 = Opening a file on the Finance share
3389 = An admin taking over a Windows desktop remotely
22 = An admin opening a remote shell on a Linux server
25 = A mail server sending mail out
```
