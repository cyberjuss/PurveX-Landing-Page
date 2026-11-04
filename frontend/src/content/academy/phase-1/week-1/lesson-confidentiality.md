### Confidentiality

Confidentiality means that only the people who are allowed to see a piece of information can see it. Here's the part that catches people out: when confidentiality fails, the data usually hasn't gone anywhere. It's still sitting exactly where it always was. What's changed is that someone who was never supposed to have a copy now has one. That's why we call this failure a **leak** rather than a loss. Because nothing is missing, every system keeps reporting that it's healthy, and a leak can go on for a long time before anyone notices.

Confidentiality matters most for information where simply seeing it does the damage, such as:

- passwords
- salaries
- Social Security numbers
- medical records
- unreleased deals

With each of these, the harm happens the moment someone reads the data, and nothing you do afterwards can take that back. That's what sets confidentiality apart from the other two jobs. You can bring a crashed system back online, and you can correct data that was altered, but once a secret has been read, it stays read.

**Controls:** authentication, access control and encryption.

- **Authentication** establishes who somebody is.
- **Access control** decides what that person is allowed to reach.
- **Encryption** makes the data unreadable to anyone who gets hold of it by another route.

Each of these covers a gap the other two leave open, so in practice you use all three together rather than picking one. Of the three, encryption is the one people most often assume is switched on when it isn't. Data sent without encryption can be read by anyone sitting on the network path between the two ends, and that path runs through far more equipment than most people imagine. So when a colleague asks you whether it's safe to send something through a particular system, the real question you're answering is usually: is that traffic encrypted while it travels?

```match
prompt: Match each control to the gap it covers.
Authentication = Establishes who somebody is
Access control = Decides what that person is allowed to reach
Encryption = Makes the data unreadable to anyone who gets it by another route
```
