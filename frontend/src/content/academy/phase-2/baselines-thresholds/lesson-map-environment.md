### Mapping Your Environment
<!-- art: network -->

Every lab you've worked so far has run inside your own pod. That's a Windows domain controller and an Ubuntu server built together on the same small network. The two machines can reach each other on every port, but nothing else can reach either of them. Your pod can't see another student's pod, and nothing on the open internet can open a connection into yours. That isolation is enforced at the network level by the pod's own security group, so it isn't a setting either machine could be tricked into changing.

It's worth taking that in before you touch a single log. Throughout this phase, you'll judge whether traffic or a sign-in attempt fits what the environment should be doing. You can't make that call about a network you've never looked at. Your pod is the smallest real environment you could practice on, with just two machines, their roles and the ports they use. And it's already yours.

A domain controller and a Linux server each expose a small, predictable set of services. Once you know their ports, you can read a connection attempt at a glance instead of looking it up every time:

- Port 3389 is someone trying to open a remote desktop session.
- Port 88 on a domain controller is a Kerberos ticket request, the backbone of how every sign-in in your directory gets authenticated.
- Port 22 on the Linux box is SSH.

Seeing any of these isn't suspicious in itself. What deserves a second look is one of them showing up from a place, or at a time, that doesn't fit the pattern. Recognizing that is exactly the skill the next lesson builds.

```match
prompt: Match each port to the service it belongs to.
3389 = Remote Desktop Protocol (RDP), for opening a desktop session on the domain controller
88 = Kerberos, the protocol that issues and verifies sign-in tickets
389 = LDAP, how the directory itself gets queried
53 = DNS, which is how every machine finds the domain controller in the first place
22 = SSH, for a terminal session on the Linux server
```
