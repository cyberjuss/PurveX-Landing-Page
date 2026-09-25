<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Why can a workstation fail to join the domain even when the domain controller is already up?</p>
</div>

### Point DNS at the domain controller

A workstation finds `purvexfinancial.local` through DNS. In this lab, set the workstation's preferred DNS server to the IP address of the domain controller. A production network often hands that address out already. A lab does not.

If that address is wrong, the domain controller can be up and the join still fails. The directory is there. The workstation cannot reach the sign-in. That is an availability failure. The password was never checked.

1. Open Settings, then Network status, then Change adapter options. Right-click the adapter and open Properties.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/dns-adapter.png" alt="Network connections with the adapter menu open on Properties" />
<figcaption>Open Properties on the adapter the workstation uses.</figcaption>
</figure>

2. Select Internet Protocol Version 4, then Properties.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/dns-ipv4.png" alt="Adapter properties with Internet Protocol Version 4 selected" />
<figcaption>IPv4 is the item that holds the DNS address.</figcaption>
</figure>

3. Select Use the following DNS server addresses. Preferred DNS server is the domain controller's IP.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/dns.png" alt="IPv4 properties with a preferred DNS server filled in" />
<figcaption>Preferred DNS is the domain controller. The address in this photo belongs to a practice build. Use the IP of your domain controller.</figcaption>
</figure>

### Join the domain

1. Open This PC, then Properties.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/join-this-pc.png" alt="This PC menu with Properties selected" />
<figcaption>Properties on This PC is the way into the computer name.</figcaption>
</figure>

2. Open Advanced system settings, then the Computer Name tab, and choose Change.
3. Select Domain and enter `purvexfinancial.local`.
4. Sign in as `PURVEXFINANCIAL\Administrator` with the directory password.
5. Restart the workstation.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/join-workgroup.png" alt="System properties showing the computer still in a workgroup, with Change selected" />
<figcaption>The computer stays in a workgroup until you choose Domain and enter purvexfinancial.local.</figcaption>
</figure>

<figure class="ad-shot">
<img src="/academy/home-lab-ad/join-welcome.png" alt="Dialog that welcomes the computer to a domain" />
<figcaption>A finished join names the domain. Yours will say purvexfinancial.local.</figcaption>
</figure>

### Confirm the computer object

On the domain controller, open Active Directory Users and Computers. Open the domain, then open Computers.

The workstation you just joined should be listed there. A computer that was created ahead of time lives in the OU you staged it in. `IT-WKS01` is staged under IT Workstations by the build script, so look there for that one.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/computers.png" alt="Active Directory Users and Computers with a computer object under Computers" />
<figcaption>A joined computer shows up as a computer object. This practice domain is cyberjuss.local. Yours is purvexfinancial.local.</figcaption>
</figure>

If the name is missing, the join did not finish. Check the DNS address first. A wrong DNS server is the usual reason the workstation cannot find the domain.
