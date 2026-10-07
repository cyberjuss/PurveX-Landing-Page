### SSL/TLS: What "Encrypted" Means

A word on names before anything else. SSL is the older term and **TLS** is the modern standard that replaced it, but the old name stuck in conversation and in product documentation, so you will hear people say SSL when they mean TLS for the rest of your career. They are referring to the same job.

That job is to wrap a connection in encryption. Anybody capturing the traffic afterwards sees scrambled data where the content used to be, which is the difference between the two cases below.

- Without TLS (HTTP): anyone watching the wire can read the data
- With TLS (HTTPS): the data is encrypted and watchers see only gibberish

TLS performs a handshake of its own, and it is entirely separate from the TCP handshake covered earlier in the week. The order is what makes this confusing at first. The TCP three-way handshake runs first and establishes the connection itself. Only once that has completed do the two sides begin negotiating encryption keys, and only once that second negotiation finishes does any actual data move.

The cleanest way to hold the two apart is by what each one produces. TCP's handshake sets up the connection, and TLS's handshake sets up the privacy. They run back to back on the same conversation, so a capture shows them one after another, and reading one as the other is one of the more common mistakes on a new desk.

This changes what you can expect to get out of a capture, and it is better to adjust that expectation early than to spend an afternoon fighting it. If a conversation is HTTPS, you are not going to read the payload, and no amount of work in Wireshark will change that.

What encryption does not hide is almost everything else. You can still see which two machines talked, which ports they used, when the conversation happened, how much data moved and in which direction, and that a TLS handshake took place at all. In practice that is frequently enough to decide whether the conversation belongs there, which is the decision you were trying to make. Analysts work from this outside information far more often than they read payloads.
