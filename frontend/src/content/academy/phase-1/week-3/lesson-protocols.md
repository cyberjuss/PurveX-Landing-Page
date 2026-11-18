### Protocols

If a port is the door the traffic went through, a protocol is the set of rules for the conversation that happens once it is inside. Convention ties the two so closely that you can usually guess one from the other, but they are still separate things, and attackers use that gap to hide. A common trick is running their own traffic over port 443 so it passes for ordinary web browsing.

Here are the protocols you will see most often, and what an analyst notices about each one.

#### HTTP and HTTPS

HTTP and HTTPS are the protocols that load web pages, on ports 80 and 443. The difference between them is encryption: HTTPS is the encrypted form, so nobody watching the wire can read the page or anything you submit. Since almost all legitimate web traffic is HTTPS today, plain HTTP carrying credentials or business data is worth asking about.

#### DNS

Before any of that web traffic can happen, a device has to find the server, and that is the job of DNS, which translates names into IP addresses. The network only routes on addresses, so a device that wants to reach a name such as google.com has to look it up first.

That ordering is what makes DNS so valuable to you as an analyst. Because almost every connection starts with a lookup, DNS logs are one of the best records you will get of what a machine tried to reach, including attempts that never succeeded. They are not complete, though, since some lookups never reach them:

- Cached answers
- Direct connections to an IP address
- Encrypted DNS (DoH)

Even so, a device looking up a name it has no business wanting is often the earliest sign that something is wrong.

#### DHCP

A device also needs an address of its own, and DHCP is what hands those out as devices join a network. When a laptop connects to the office Wi-Fi, a short DHCP exchange gives it an address, along with the gateway and the DNS server it should use.

Because DHCP is almost universal, an exception is interesting:

- An address starting with **169.254** means the device asked for one and nobody answered, which points to a network fault.
- Any other address that no DHCP server issued was set by hand. There can be good reasons for that, but you will want to find out which one applies.

#### SMTP, POP3, and IMAP

Email splits its work across protocols that run in two directions:

- **SMTP** carries mail outward toward its destination.
- **POP3** and **IMAP** let a mail client pull messages down from a server so someone can read them.

The useful question for an analyst is which machines should be speaking these protocols at all. The answer is a short list:

- Mail servers
- The mail clients of the people who read email

So if you see SMTP coming from a host that has no reason to handle mail, follow it up, because sending messages is one of the most common uses of a compromised machine.

```sort
prompt: You are reviewing a Finance workstation's traffic. Normal, or worth a second look?
level: 3
Normal: DNS lookups sent to the domain controller | Kerberos sign-ins on port 88 to the domain controller | HTTPS to the firm's web apps on port 443
Worth a second look: Mail sent straight to the internet instead of through the mail server | A remote desktop session opened from another workstation | A password sent over plain HTTP | Its own address starting 169.254
```
