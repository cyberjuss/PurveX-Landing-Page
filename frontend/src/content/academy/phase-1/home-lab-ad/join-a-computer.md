<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Why can a workstation fail to join the domain even when the domain controller is already up?</p>
</div>

### Point DNS at the domain controller

A workstation finds `purvexfinancial.local` through DNS. In this lab, set the workstation's preferred DNS server to the IP address of the domain controller. A production network often hands that address out already. A lab does not.

1. Open Settings, then Network status, then Change adapter options.
2. Right-click the adapter, open Properties, and select Internet Protocol Version 4.
3. Select Use the following DNS server addresses. Preferred DNS server is the domain controller's IP.

### Join the domain

1. Open This PC, then Properties, then Advanced system settings.
2. Open the Computer Name tab and choose Change.
3. Select Domain and enter `purvexfinancial.local`.
4. Sign in as `PURVEXFINANCIAL\Administrator` with the directory password.
5. Restart the workstation.

### Confirm the computer object

On the domain controller, open Active Directory Users and Computers. Open the domain, then open Computers.

The workstation you just joined should be listed there. A computer that was created ahead of time lives in the OU you staged it in, not in Computers. `IT-WKS01` is staged under IT Workstations by the build script, so look there for that one.

If the name is missing, the join did not finish. Check the DNS address first. A wrong DNS server is the usual reason the workstation cannot find the domain.
