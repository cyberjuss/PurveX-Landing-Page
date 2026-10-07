### Common Ports

A port is the second half of a network destination. If the IP address gets you to the building, the port gets you to the correct door inside it. Every meaningful service running on a device listens behind one, which is what allows a single machine with a single address to run a web server, a mail server and a remote login service at the same time without any of them interfering with the others.

A number of ports are used so consistently that seeing the number is enough to tell you what service is almost certainly on the other end. These are the ones you will meet most often.

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

Two entries in that table deserve particular attention. Traffic on port 22 or port 3389 coming from somewhere you did not expect is always worth a second look, because both of those ports exist to let somebody control a machine rather than simply retrieve something from it. That is precisely why attackers reach for them once they have a foothold, and why movement on those ports between two internal machines with no business connecting is one of the more useful things to watch for.

Be careful not to read more into a port number than it can tell you, though. A port tells you which door the traffic used, and nothing more than that. It does not tell you the conversation was legitimate, and an attacker is free to run any service they like on whichever port they choose. So before drawing a conclusion, check the host involved, the direction the connection travelled, and whether that service has any reason to be running there at all.
