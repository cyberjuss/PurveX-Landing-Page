<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What has to be running before you can build a domain?</p>
</div>

### What you need

The lab runs as virtual machines, or VMs, on your own computer, so before you touch Active Directory, you'll need two machines on the same virtual network:

- **A Windows Server 2022 VM.** It becomes the domain controller.
- **A Windows 10 VM.** It becomes the workstation you join to the domain.

Both run inside VMware Workstation Pro, and every tab after this one assumes they're already up. You may have heard that Windows 10 reached end of support in October 2025. That's fine for a lab VM that never holds real data, and if you'd rather use Windows 11 Pro, it joins a domain the same way.

Source: [Microsoft Learn: Windows 10 Home and Pro lifecycle](https://learn.microsoft.com/en-us/lifecycle/products/windows-10-home-and-pro)

### Install VMware Workstation Pro

To get started, download VMware Workstation Pro for Windows and run the installer with the default options.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/vmware-download.png" alt="VMware Workstation 17 Pro download page with Windows and Linux download links" />
<figcaption>Choose the Windows download. The download page may look different today, but the installer works the same way.</figcaption>
</figure>

### Download the two ISO files

Next, you need an installer for each operating system. These come as ISO files, which work like an installer disk that VMware boots each new VM from.

**Windows 10.** Open Microsoft's Download Windows 10 page, click Download tool now, then run the tool and follow these screens:

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/win10-download.png" alt="Microsoft Download Windows 10 page with the Download tool now button" />
<figcaption>Use Download tool now under Create Windows 10 installation media.</figcaption>
</figure>
<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/win10-create-media.png" alt="Windows 10 Setup asking what you want to do, with Create installation media selected" />
<figcaption>Choose Create installation media for another PC. Leave the next screen at its defaults.</figcaption>
</figure>
<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/win10-iso.png" alt="Windows 10 Setup media choice with ISO file selected" />
<figcaption>Choose ISO file, then save it to a folder you will remember.</figcaption>
</figure>
</div>

**Windows Server 2022.** For the server, download the English 64-bit ISO from the Windows Server 2022 page on the Microsoft Evaluation Center.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/server-download.png" alt="Microsoft Evaluation Center Windows Server 2022 download options" />
<figcaption>Pick ISO downloads, 64-bit edition. The evaluation copy is enough for this lab.</figcaption>
</figure>

### Create a virtual machine

With both ISO files saved, you can create the VMs. Both use the same wizard, so open VMware, choose Create a New Virtual Machine, and walk through these screens:

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/vm-iso.png" alt="New Virtual Machine Wizard with Installer disc image file selected and a Windows ISO path" />
<figcaption>Choose Installer disc image file and browse to the ISO you saved.</figcaption>
</figure>
<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/vm-name.png" alt="New Virtual Machine Wizard naming the machine" />
<figcaption>Give each VM a name you will recognize, such as Windows 10 or Domain Controller.</figcaption>
</figure>
<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/vm-nat.png" alt="Network type screen with Use network address translation (NAT) selected" />
<figcaption>Choose NAT. It gives the VMs internet access while keeping them on their own private network.</figcaption>
</figure>
<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/vm-memory.png" alt="Memory screen set to 2048 MB" />
<figcaption>Keep the recommended memory for now. You can change it later with the VM shut down.</figcaption>
</figure>
<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/vm-disk.png" alt="Select a Disk screen with Create a new virtual disk selected" />
<figcaption>Choose Create a new virtual disk.</figcaption>
</figure>
<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/vm-disk-size.png" alt="Disk capacity screen set to 60 GB" />
<figcaption>The recommended 60 GB is fine. Use 80 GB if you have the space.</figcaption>
</figure>
</div>

There's one more setting to check before you click Finish. Open Customize Hardware, select Network Adapter, then choose Custom and pick the NAT network, which is usually `VMnet8 (NAT)`.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/vm-network.png" alt="VM hardware settings with Network Adapter set to Custom, VMnet8 (NAT)" />
<figcaption>Every VM in this lab uses the same virtual network. If they are on different networks, the workstation cannot find the domain.</figcaption>
</figure>

### Install Windows 10

Now power on the Windows 10 VM, and it will boot from the ISO into Windows Setup.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/win10-setup.png" alt="Windows Setup language and keyboard screen" />
<figcaption>Keep the language settings and click Next, then Install now.</figcaption>
</figure>
<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/win10-no-key.png" alt="Activate Windows screen with I don't have a product key highlighted" />
<figcaption>Click I don't have a product key. The lab does not need activation.</figcaption>
</figure>
<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/win10-pro.png" alt="Operating system list with Windows 10 Pro selected" />
<figcaption>Choose Windows 10 Pro. Home editions cannot join a domain.</figcaption>
</figure>
<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/win10-custom.png" alt="Installation type screen pointing to Custom: Install Windows only (advanced)" />
<figcaption>Choose Custom: Install Windows only, then let the installation finish.</figcaption>
</figure>
</div>

### Install Windows Server 2022

For the server, create a second VM with the same wizard and point it at the Windows Server 2022 ISO. Most of the steps match the workstation, but three settings are different.

If VMware offers Easy Install, skip the product key and any edition it suggests, because you'll choose the edition yourself during setup.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/server-bios.png" alt="Firmware Type screen with BIOS selected" />
<figcaption>If the wizard asks for a firmware type, choose BIOS.</figcaption>
</figure>
<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/server-memory.png" alt="Memory screen set to about 4 GB" />
<figcaption>Give the server at least 4 GB if your computer has room. The domain controller does more work than the workstation.</figcaption>
</figure>
<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/server-floppy.png" alt="VM settings with Floppy selected and Connect at power on unchecked" />
<figcaption>With the VM shut down, select Floppy and uncheck Connect at power on. That stops Easy Install from choosing setup options for you.</figcaption>
</figure>
</div>

Before you start it, confirm the network adapter uses the same `VMnet8 (NAT)` network as the workstation, then power on the server and run Windows Setup.

Choose Custom: Install Windows only, just as you did for the workstation, and when the server restarts, it will ask you to set the Administrator password.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/server-desktop.png" alt="Server setup operating system list with Standard Evaluation (Desktop Experience) selected" />
<figcaption>Choose Standard Evaluation (Desktop Experience). Without Desktop Experience you get no graphical interface, and the later tabs assume one.</figcaption>
</figure>
<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/server-manager.png" alt="Server Manager dashboard open on a new Windows Server" />
<figcaption>Server Manager opens on its own after sign-in. The server is ready to become a domain controller.</figcaption>
</figure>
</div>

### Before you move on

Before you open the next tab, check that both machines are ready:

- The server shows Server Manager after sign-in
- The workstation reaches the Windows 10 desktop
- Both VMs use the same `VMnet8 (NAT)` network

If all three are true, you're ready to open The Domain Controller tab and turn the server into the directory.
