### Confidentiality

Confidentiality means only the people allowed to see information can see it. When it fails, the data usually hasn't gone anywhere. Someone who shouldn't have a copy now has one. That's why we call it a **leak**. Nothing is missing, so every system still reports healthy, and a leak can run for a long time unnoticed.

It matters most where seeing the data is the damage:

- passwords
- salaries
- Social Security numbers
- medical records
- unreleased deals

You can restore a crashed system and correct altered data. Once a secret has been read, it stays read.

**Controls:** authentication, access control and encryption.

- **Authentication** establishes who somebody is.
- **Access control** decides what they can reach.
- **Encryption** makes data unreadable to anyone who gets it another way.

Each covers a gap the others leave, so you use all three. Encryption is the one people most often assume is on when it isn't. Unencrypted traffic can be read by anyone on the path between the two ends. So when someone asks if it's safe to send something, the real question is: is it encrypted in transit?

```match
prompt: Match each control to the gap it covers.
Authentication = Establishes who somebody is
Access control = Decides what that person is allowed to reach
Encryption = Makes the data unreadable to anyone who gets it by another route
```
