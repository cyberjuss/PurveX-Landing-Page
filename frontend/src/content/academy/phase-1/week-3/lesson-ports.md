### Common Ports

A port is like an apartment number. The IP address gets you to the building, and the port gets you to the correct door. Every meaningful service on a device listens behind a port.

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

Traffic on port 22 or 3389 from somewhere unexpected is always worth a second look. Those ports exist to *control* a machine, not just browse it. That is why attackers reach for them once they are inside a network.

A port tells you which door was used. It does not tell you the conversation was allowed. Verify these:

- the host
- the direction
- whether that service belongs there
