### Confidentiality

Confidentiality means that only the people who are allowed to see a piece of information can see it. Here's the part that catches people out: when confidentiality fails, the data usually hasn't gone anywhere. It's still sitting exactly where it was, and what's changed is that someone who was never supposed to have a copy now has one. That's why we call this failure a **leak**. And because nothing is missing, every system keeps reporting that it's healthy, so a leak can run for a long time before anyone notices.

Confidentiality matters most for information where simply seeing it does the damage, such as:

- passwords
- salaries
- Social Security numbers
- medical records
- unreleased deals

What sets this apart from the other two failures is that you can't undo it. You can bring a crashed system back online, and you can correct data that was altered, but once a secret has been read, it stays read.

**Controls:** authentication, access control and encryption.

- **Authentication** establishes who somebody is.
- **Access control** decides what that person is allowed to reach.
- **Encryption** makes the data unreadable to anyone who gets hold of it some other way.

Each of these covers a gap the other two leave open, which is why you use all three together. Of the three, encryption is the one people most often assume is switched on when it isn't, and that assumption is costly, because unencrypted traffic can be read by anyone on the network path between the two ends. So when a colleague asks whether it's safe to send something through a particular system, the question you're really answering is whether that traffic is encrypted while it travels.

```match
prompt: Match each control to the gap it covers.
Authentication = Establishes who somebody is
Access control = Decides what that person is allowed to reach
Encryption = Makes the data unreadable to anyone who gets it by another route
```
