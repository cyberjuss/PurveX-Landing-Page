### **Common Ports**

A port is like an apartment number. The IP address gets you to the building. The port gets you to the right door.

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

* **Fundamental:** If you see traffic on port 22 or 3389 from somewhere it shouldn't be, that's worth a second look. Those ports mean someone's trying to *control* a machine, not just browse it.
