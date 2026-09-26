<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Why can a workstation fail to join the domain even when the domain controller is already up?</p>
</div>

### Point DNS at the domain controller

A workstation finds `purvexfinancial.local` through DNS. A production network usually hands out the right DNS address automatically. In this lab, you set the workstation's preferred DNS server to the domain controller's IP address yourself.

If that address is wrong, the join fails even when the domain controller is up. The directory exists, but the workstation cannot reach it to sign in.

That is an availability failure, not a password problem. The password was never checked.

1. Open Settings, then Network status, then Change adapter options. Right-click the adapter and choose Properties.
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
2. Open Advanced system settings, then the Computer Name tab, and choose Change.
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

On the domain controller, open Active Directory Users and Computers. Open the domain, then open Computers.

A newly joined workstation appears there. A computer created ahead of time appears in the OU where it was staged instead.

The build script staged `IT-WKS01` under IT Workstations, so look there for that one.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/computers.png" alt="Active Directory Users and Computers with a computer object under Computers" />
<figcaption>A joined computer shows up as a computer object. This practice domain is cyberjuss.local. Yours is purvexfinancial.local.</figcaption>
</figure>

If the name is missing, the join did not finish. Check the DNS address first, because a wrong DNS server is the usual reason a workstation cannot find the domain.
