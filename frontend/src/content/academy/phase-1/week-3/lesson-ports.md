### Common Ports

If the IP address gets you to the building, the port gets you to the right door. Each service listens on its own port, so one machine can run a web server, a mail server and remote login at once.

Some ports are so standard the number tells you the service:

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

A domain controller adds its own. Know them, so anything else stands out:

| Port | Protocol | Use |
| :---- | :---- | :---- |
| 88 | Kerberos | Sign-in tickets |
| 135 | RPC | Windows remote management calls |
| 389 / 636 | LDAP / LDAPS | Directory lookups (636 is encrypted) |
| 445 | SMB | File shares |
| 3268 / 3269 | Global Catalog | Directory lookups across the forest |
| 5985 | WinRM | Remote PowerShell |

Watch 22 and 3389. Both let someone control a machine, so attackers reach for them once inside. Traffic on them between two internal machines with no reason to talk is worth a look.

A port only tells you which door was used, not that the traffic is legitimate. Anyone can run any service on any port. Before concluding, check:

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
