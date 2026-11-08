<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Why can a workstation fail to join the domain even when the domain controller is already up?</p>
</div>

### Point DNS at the domain controller

Before a workstation can join the domain, it has to find `purvexfinancial.local`, and it does that through DNS. On a production network, the right DNS address is usually handed out automatically, but in this lab you'll set the workstation's DNS server to the domain controller's IP address yourself. If that address is wrong, the join fails even though the domain controller is up, which in Week 1 terms is an availability failure rather than a password problem.

1. Press Win+R and run `ncpa.cpl`. Right-click the adapter and choose Properties.
2. Select Internet Protocol Version 4, then Properties.
3. Select Use the following DNS server addresses. Enter the domain controller's IP as the Preferred DNS server.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/home-lab-ad/dns-adapter.png" alt="Network connections with the adapter menu open on Properties" />
<figcaption>Step 1. Open Properties on the adapter the workstation uses.</figcaption>
</figure>
<figure class="ad-shot">
<img src="/academy/home-lab-ad/dns-ipv4.png" alt="Adapter properties with Internet Protocol Version 4 selected" />
<figcaption>Step 2. IPv4 is the item that holds the DNS address.</figcaption>
</figure>
<figure class="ad-shot">
<img src="/academy/home-lab-ad/dns.png" alt="IPv4 properties with a preferred DNS server filled in" />
<figcaption>Step 3. Preferred DNS is the domain controller. The address in this photo belongs to a practice build. Use the IP of your domain controller.</figcaption>
</figure>
</div>

### Join the domain

1. Open This PC, then Properties.
2. Open Advanced system settings and choose Change on the Computer Name tab.
3. Select Domain and enter `purvexfinancial.local`.
4. Sign in as `PURVEXFINANCIAL\Administrator` with the directory password.
5. Restart the workstation.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/home-lab-ad/join-this-pc.png" alt="This PC menu with Properties selected" />
<figcaption>Step 1. Properties on This PC is the way into the computer name.</figcaption>
</figure>
<figure class="ad-shot">
<img src="/academy/home-lab-ad/join-workgroup.png" alt="System properties showing the computer still in a workgroup, with Change selected" />
<figcaption>Steps 2 and 3. The computer stays in a workgroup until you choose Domain and enter purvexfinancial.local.</figcaption>
</figure>
<figure class="ad-shot">
<img src="/academy/home-lab-ad/join-welcome.png" alt="Dialog that welcomes the computer to a domain" />
<figcaption>Step 4. A finished join names the domain. Yours will say purvexfinancial.local.</figcaption>
</figure>
</div>

### Confirm the computer object

Once the workstation has restarted, check that the domain knows about it. On the domain controller, open Active Directory Users and Computers and look in Computers, where a newly joined workstation appears. A computer that was staged ahead of time shows up in its own OU instead, which is why you'll find `IT-WKS01` under IT Workstations.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/computers.png" alt="Active Directory Users and Computers with a computer object under Computers" />
<figcaption>A joined computer shows up as a computer object. This practice domain is cyberjuss.local. Yours is purvexfinancial.local.</figcaption>
</figure>

If the name is missing, the join didn't finish. Check the DNS address first, because a wrong DNS server is the most common reason a workstation can't find the domain.

```order
prompt: Put the workstation join in order.
level: 1
Set the workstation's DNS server to the domain controller's IP address
Join the domain purvexfinancial.local from the Computer Name tab
Sign in as PURVEXFINANCIAL\Administrator when asked
Restart the workstation
Confirm its computer object appears in the directory
```
