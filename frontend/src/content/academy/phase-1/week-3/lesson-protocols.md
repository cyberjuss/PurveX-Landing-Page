### Protocols

Protocols are the agreed sets of rules that decide what happens once traffic has reached a device. The distinction from the previous section is worth holding on to, because the two are easy to blur together. A port tells you which door the traffic went through. A protocol tells you what conversation took place once it was inside. Convention ties them together so tightly that you can usually guess one from the other, but they remain separate things, and the gap between them is where a certain amount of hiding gets done.

The sections below cover the protocols you will encounter most often, what each one is for, and what an analyst notices about each when reading a capture.

#### HTTP and HTTPS

HTTP and HTTPS are the protocols that load web pages. When a browser asks for a page, that request travels as HTTP on port 80 or as HTTPS on port 443, and the server answers over the same connection.

HTTPS is the encrypted form of HTTP, which means the contents of the page and anything submitted with it cannot be read by somebody watching the wire in between. In any healthy modern environment the overwhelming majority of web traffic is HTTPS, and that expectation is itself a useful tool. It makes plain HTTP carrying anything resembling credentials or business data worth asking about, not because the protocol is exotic but because almost nothing legitimate still uses it that way.

#### DNS

DNS translates names into IP addresses. Before a device can connect to a name such as google.com it has to perform a DNS lookup to find the matching address, because the network itself only ever routes on addresses and knows nothing about names.

That ordering makes DNS unusually valuable to an analyst. Almost every connection a machine makes begins with a name lookup, so the DNS record is close to a complete list of what a machine was trying to reach, including the attempts that never succeeded. It is that last part which does the real work. A device asking for an address it has no business wanting is frequently the earliest visible sign that something is wrong. It shows up in DNS whether or not the connection that followed ever completed.

#### DHCP

DHCP hands out IP addresses to devices as they join a network. A laptop connecting to the office Wi-Fi receives its address through a short DHCP request and response. The same exchange hands it the other settings it needs, such as which gateway to use and which DNS server to ask.

The alternative is an administrator setting an address on every device by hand, which does not scale past a small number of machines and is why DHCP is close to universal. That near-universality is exactly what makes an exception interesting, because a device running with an address no DHCP server ever issued was configured deliberately by somebody. There are legitimate reasons for that, but it is worth finding out which one applies.

#### SMTP, POP3, and IMAP

SMTP, POP3 and IMAP are the protocols behind email, and they divide the work in two. SMTP carries mail outward from a client or a server towards its destination. POP3 and IMAP work in the other direction, letting a mail client pull messages down from a server so that somebody can read them.

What matters for an analyst is which machines ought to be speaking these protocols at all, and the answer is a short list: mail servers, and the clients of the people who read mail. So SMTP coming from a host with no reason to handle mail is worth following up, because one of the more common uses of a compromised machine is to send messages from it. That traffic looks perfectly ordinary in isolation while being entirely out of place on that particular host.

A later section puts all of this to work. You will open Wireshark with a real capture and use ports and protocols together to separate the ordinary traffic from the traffic that does not belong, which is the point everything in this week has been building towards.
