### Protocols

Protocols are the agreed sets of rules that decide what happens once traffic reaches a device. A port tells you which door traffic is using. A protocol tells you what conversation takes place once it is through that door.

Some of the main protocols you will see include:

HTTP and HTTPS
DNS
DHCP
SMTP, POP3, and IMAP

As you read, you will learn more about each protocol and how a device uses it to communicate.

#### HTTP and HTTPS

HTTP and HTTPS are the protocols that load web pages. When a browser requests a page, that traffic travels as HTTP on port 80 or as HTTPS on port 443.

HTTPS is the encrypted version of HTTP, so the contents of the page and any data sent with it cannot be read by someone watching the wire. Most web traffic you see in a healthy environment is HTTPS.

#### DNS

DNS translates names into IP addresses. Before a device can connect to anything by name, such as google.com, it makes a DNS lookup to find the matching address.

Because almost every connection begins with a name lookup, analysts check DNS activity early to see what a machine was trying to reach. A device asking for an address it has no reason to want is often the first sign that something does not fit.

#### DHCP

DHCP hands out IP addresses to devices as they join a network. A new laptop joining the office Wi-Fi receives its address through a DHCP request and response, along with the other settings it needs to communicate.

Without DHCP, an administrator would have to set an address on every device by hand. That is why a device with an address that no DHCP server handed out is worth a closer look.

#### SMTP, POP3, and IMAP

SMTP, POP3, and IMAP are the protocols behind email. SMTP sends mail out from a client or server. POP3 and IMAP are how a mail client pulls messages down from a server so a person can read them.

Seeing this email traffic from a host that has no reason to handle mail is worth a second look, because it can mean a machine is being used to send messages it should not.

In a later section, you will complete a lab in Wireshark that puts ports and protocols together and asks you to separate ordinary traffic from traffic that does not belong.
