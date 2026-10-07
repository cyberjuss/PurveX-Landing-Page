### Confidentiality

Confidentiality means that only the people authorized to see a piece of information are able to see it. When it fails, the data itself is usually untouched and still sits exactly where it always did, but a copy of it now rests with somebody who was never meant to hold one. That is why the failure is a **leak** rather than a loss. Nothing has gone missing, so the systems carry on reporting themselves healthy and the failure can run a long time before anyone notices.

It matters most where simply seeing the data is the harm:

- passwords
- salaries
- Social Security numbers
- medical records
- unreleased deals

In each of those the damage is done at the moment of reading, and there is no undoing it afterwards. That is what separates a confidentiality failure from the other two. An unavailable system can be brought back and altered data can be corrected, but a secret that has been read stays read.

**Controls:** encryption, authentication and access control.

- **Authentication** establishes who somebody is.
- **Access control** decides what that person is allowed to reach.
- **Encryption** makes the data unreadable to anyone who gets hold of it by another route.

Each one covers a gap the others leave open, which is why they are used together rather than chosen between. Encryption is the one people most often assume is already in place. Data sent without it can be read by anyone sitting on the network path between the two ends, and a network path involves far more equipment than most people picture. When somebody asks whether a system is safe to send something through, the question underneath is usually whether that traffic is encrypted in transit.
