### Common Ports

A port is best understood as an apartment number. The IP address gets you to the building. The port gets you to the correct door, and every meaningful service on a device is listening behind one.

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

* **Fundamental:** Traffic on port 22 or 3389 from somewhere it should not be is always worth a second look. Those ports exist to *control* a machine, not merely browse it, which is exactly why attackers reach for them once they are inside a network.
