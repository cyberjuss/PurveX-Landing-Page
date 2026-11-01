### Mapping Your Environment
<!-- art: network -->

Every lab you have worked in this course so far runs inside your own pod: a Windows domain controller and an Ubuntu server, provisioned together and sitting on the same small network. The two machines can reach each other on every port. Nothing else can reach either one. Your pod cannot see another student's pod, and nothing on the open internet can open a connection into yours. That isolation is enforced at the network level by its own security group, not by a setting either machine could be tricked into changing.

That is worth sitting with before you touch a single log. Every lesson this phase asks you to judge whether traffic or an authentication attempt fits what the environment should be doing. You cannot make that judgment about a network you have never actually looked at. The two machines in your pod, their roles, and the ports they actually use are the smallest real environment you will ever need to practice that judgment on. It is already yours.

A domain controller and a Linux server each expose a small, predictable set of services. Knowing the port is what lets you read a connection attempt at a glance instead of looking it up every time:

- Port 3389 is someone trying to open a remote desktop session.
- Port 88 on a domain controller is a Kerberos ticket request, the backbone of how every sign-in in your directory actually gets authenticated.
- Port 22 on the Linux box is SSH.

None of these appearing is itself suspicious. What would be worth a second look is one of them appearing from somewhere, or at a time, that does not fit the pattern. That is exactly the skill the next lesson builds.

```match
prompt: Match each port to the service it belongs to.
3389 = Remote Desktop Protocol (RDP), for opening a desktop session on the domain controller
88 = Kerberos, the protocol that issues and verifies sign-in tickets
389 = LDAP, how the directory itself gets queried
53 = DNS, which is how every machine finds the domain controller in the first place
22 = SSH, for a terminal session on the Linux server
```
