### Protocols

If a port is the door the traffic went through, a protocol is the set of rules for the conversation that happens once it's inside. It's worth holding on to that difference, because the two are easy to blur together. Convention ties them so closely that you can usually guess one from the other, but they're still separate things. Attackers use that gap to hide, for example by running their own traffic over port 443 so it passes for ordinary web browsing.

With that distinction in mind, let's walk through the protocols you'll come across most often: what each one is for, and what an analyst notices about it in a capture.

#### HTTP and HTTPS

HTTP and HTTPS are the protocols that load web pages. When a browser asks for a page, the request travels as HTTP on port 80 or as HTTPS on port 443, and the server answers over that same connection.

The difference between the two is encryption. HTTPS is the encrypted form of HTTP, so nobody watching the wire in between can read the page's contents or anything you submit with it. In a healthy modern environment, the vast majority of web traffic is HTTPS, and that expectation is a useful tool in itself. It means that plain HTTP carrying anything that looks like credentials or business data is worth asking about. That's not because HTTP is unusual, but because almost nothing legitimate still sends that kind of data unencrypted.

#### DNS

Before any of that web traffic can happen, though, a device has to find the server, and that's DNS's job. DNS translates names into IP addresses. The network routes on addresses and knows nothing about names. So a device that wants to connect to a name such as google.com first does a DNS lookup to find the matching address.

That ordering is what makes DNS so valuable to an analyst. Almost every connection starts with a name lookup. That makes the DNS record one of the best lists you'll get of what a machine was trying to reach, including attempts that never succeeded. It isn't complete, admittedly. Cached answers, connections made straight to an IP address, and lookups sent over encrypted DNS (DoH) never reach your DNS logs. A device looking up a name it has no business wanting is often the earliest visible sign that something is wrong. It shows up in DNS whether or not the connection that followed ever completed.

#### DHCP

Just as a device needs DNS to find others, it first needs an address of its own, and DHCP is what hands those out as devices join a network. When a laptop connects to the office Wi-Fi, for example, it gets its address through a short DHCP request and response. That same exchange also gives it the other settings it needs, such as which gateway to use and which DNS server to ask.

The alternative would be an administrator typing an address into every device by hand, which doesn't scale beyond a handful of machines. That's why DHCP is almost universal, and it's also why an exception is interesting. A device running with an address that no DHCP server issued must have got it some other way. If the address starts with 169.254, the device asked for one and nobody answered, which points to a network fault. Any other such address was set by hand, and while there are legitimate reasons for that, you should find out which one applies.

#### SMTP, POP3, and IMAP

Email has its own protocols, and they split the work into two directions. SMTP carries mail outward, from a client or a server toward its destination. POP3 and IMAP work the other way, letting a mail client pull messages down from a server so someone can read them.

For an analyst, the useful question is which machines should speak these protocols at all. The answer is a short list: mail servers, and the mail clients of the people who read email. So if you see SMTP coming from a host that has no reason to handle mail, follow it up. One of the most common uses of a compromised machine is sending messages from it. That traffic looks ordinary on its own, yet it's out of place on that host.

You'll put all of this to work in this week's challenge. You'll use ports and protocols together to find the rules in your own lab that let through traffic that doesn't belong.

```sort
prompt: Match each job to the protocol that does it.
DNS: Turns a name like google.com into an IP address
DHCP: Hands an address to a laptop joining the Wi-Fi
SMTP: Carries mail outward toward its destination
IMAP: Lets a mail client pull messages down from a server
```
