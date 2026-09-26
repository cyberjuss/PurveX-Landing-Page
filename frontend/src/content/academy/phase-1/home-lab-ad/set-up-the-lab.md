<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What has to be running before you can build a domain?</p>
</div>

### What you need

The lab runs as virtual machines on your own computer. Before you touch Active Directory, you need two machines on the same virtual network:

- **A Windows Server 2022 VM.** It becomes the domain controller.
- **A Windows 10 VM.** It becomes the workstation you join to the domain.

Both run inside VMware Workstation Pro. Build them first, because every tab after this one assumes they are up.

### Install VMware Workstation Pro

Download VMware Workstation Pro for Windows and run the installer with the default options.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/vmware-download.png" alt="VMware Workstation 17 Pro download page with Windows and Linux download links" />
<figcaption>Choose the Windows download. The download page may look different today, but the installer works the same way.</figcaption>
</figure>

### Download the two ISO files

An ISO file is the installer disk for an operating system. VMware boots each new VM from one.

**Windows 10.** Open Microsoft's Download Windows 10 page and click Download tool now. Run the tool and follow these screens:

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

**Windows Server 2022.** Open the Windows Server 2022 page on the Microsoft Evaluation Center. Download the English 64-bit ISO.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/server-download.png" alt="Microsoft Evaluation Center Windows Server 2022 download options" />
<figcaption>Pick ISO downloads, 64-bit edition. The evaluation copy is enough for this lab.</figcaption>
</figure>

### Create a virtual machine

You create both VMs with the same New Virtual Machine wizard. Open VMware, choose Create a New Virtual Machine, and walk through these screens.

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

Before you click Finish, open Customize Hardware and select Network Adapter. Choose Custom and pick the NAT network, usually `VMnet8 (NAT)`.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/vm-network.png" alt="VM hardware settings with Network Adapter set to Custom, VMnet8 (NAT)" />
<figcaption>Every VM in this lab uses the same virtual network. If they are on different networks, the workstation cannot find the domain.</figcaption>
</figure>

### Install Windows 10

Power on the Windows 10 VM. It boots from the ISO and opens Windows Setup.

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

### Install Windows Server 2022

Create a second VM with the same wizard and point it at the Windows Server 2022 ISO. Three settings differ from the workstation.

VMware may offer Easy Install for the server. Skip the product key and any edition it suggests, because you choose the edition yourself during setup.

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

Confirm the network adapter uses the same `VMnet8 (NAT)` network as the workstation. Then power on the server and run Windows Setup.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/server-desktop.png" alt="Server setup operating system list with Standard Evaluation (Desktop Experience) selected" />
<figcaption>Choose Standard Evaluation (Desktop Experience). Without Desktop Experience you get no graphical interface, and the later tabs assume one.</figcaption>
</figure>

Choose Custom: Install Windows only, as you did for the workstation. When the server restarts, set the Administrator password.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/setup/server-manager.png" alt="Server Manager dashboard open on a new Windows Server" />
<figcaption>Server Manager opens on its own after sign-in. The server is ready to become a domain controller.</figcaption>
</figure>

### Before you move on

Check both machines before you open the next tab:

- The server shows Server Manager after sign-in
- The workstation reaches the Windows 10 desktop
- Both VMs use the same `VMnet8 (NAT)` network

If all three are true, open The Domain Controller and turn the server into the directory.
