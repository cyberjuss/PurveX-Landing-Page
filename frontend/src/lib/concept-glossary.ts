// The concepts a recap teaches and the daily review brings back, each written
// out in full: a question to recall it by, what it means, what it looks like
// on the job, and what it is easily confused with. A recap card used to carry
// whichever sentence first put the word in bold, which was often a fragment
// ("Confidentiality fails as a leak.") that made sense only on the slide
// around it. These stand on their own, a day or a month later.
//
// Every entry is checked against the lessons and the sources on the Resources
// tabs. Keep them to what the course teaches; a definition the lessons
// contradict is worse than none.

export type GlossaryEntry = {
  term: string;
  /** Other ways a lesson names it in bold or in a heading. Lower case. */
  aka?: string[];
  /** The question on the front of the review card. One short question. */
  cue: string;
  /** The answer on the back of the review card: one plain sentence a student can say back. Markdown inline. */
  gist: string;
  /** What it means, precisely, behind More on the card. Markdown inline. */
  means: string;
  /** What it looks like on the job. */
  example?: string;
  /** What it is easily mistaken for, and the difference. */
  notTo?: string;
  /** An everyday word too ("contain", "escalate"): counts only when a lesson puts it in bold or a heading. */
  strict?: true;
};

export const GLOSSARY: GlossaryEntry[] = [
  // Week 1: the CIA triad and risk
  {
    term: "Confidentiality",
    aka: ["leak"],
    cue: "What does confidentiality protect?",
    gist: "Who gets to see the data, so private information stays private.",
    means: "Only authorized people can read the information. When it fails, data is exposed to someone who should not see it: a **leak**.",
    example: "A payroll spreadsheet is emailed to the wrong distribution list. Nothing was changed or deleted, but people who should not see salaries now have them.",
    notTo: "An integrity failure. Leaked data is still correct. The harm is who has seen it. Controls: access control, encryption, need to know.",
  },
  {
    term: "Integrity",
    aka: ["lie"],
    cue: "What does integrity protect?",
    gist: "Whether the data is right, so people can trust what they act on.",
    means: "Information stays accurate and complete, changed only by authorized people through authorized means. When it fails, people act on data that is wrong: a **lie**.",
    example: "Someone edits the bank details on a vendor invoice, and Finance pays the attacker. The file was never hidden or unavailable. It just stopped being true.",
    notTo: "A confidentiality failure. Nobody needs to read the data for its integrity to fail. Controls: hashing, digital signatures, audit logs, change approval.",
  },
  {
    term: "Availability",
    aka: ["lockout"],
    cue: "What does availability protect?",
    gist: "Being able to use systems and data when the work needs them.",
    means: "Systems and data are there when authorized people need them. When it fails, the work stops: a **lockout**.",
    example: "Ransomware encrypts the file server, or a flood of traffic takes down the client portal. The data may be intact and private, but nobody can use it.",
    notTo: "Data loss alone. A service can be down with every file safe. Controls: backups, redundancy, patching, capacity.",
  },
  {
    term: "Vulnerability",
    cue: "What is a vulnerability?",
    gist: "A weak spot someone could use to cause harm.",
    means: "A weakness that could be exploited: an unpatched service, a misconfiguration, a reused password, a process nobody follows. On its own it does nothing. It waits.",
    example: "Remote Desktop (port 3389) open to the internet on a server that has not been patched in a year.",
    notTo: "A threat. The weakness exists whether or not anyone is trying to use it.",
  },
  {
    term: "Threat",
    cue: "What is a threat?",
    gist: "Someone or something that could take advantage of a weak spot.",
    means: "Anyone or anything that could exploit a vulnerability and cause harm: a criminal group, malware, a careless or angry insider, even a flood or a power cut.",
    example: "A ransomware crew scanning the internet for exposed Remote Desktop servers.",
    notTo: "A vulnerability. A threat with no weakness to use has nothing to work with, and a weakness with no threat is not yet being used.",
  },
  {
    term: "Risk",
    aka: ["likelihood × impact", "likelihood x impact"],
    cue: "What does risk tell you?",
    gist: "How much to worry about something, based on how likely it is and how bad it would be.",
    means: "The chance that a threat exploits a vulnerability, combined with what it would cost if it did. Most teams score it as **likelihood × impact**.",
    example: "The same unpatched flaw is high risk on an internet-facing server holding client records, and low risk on an isolated test machine with nothing on it.",
    notTo: "Severity. A CVSS score rates the flaw itself. Risk depends on where it sits and what it guards. A control lowers risk by cutting the likelihood (patching) or the impact (backups).",
  },
  {
    term: "Backups",
    cue: "What makes a backup worth having?",
    gist: "You can actually restore it, and an attacker can't reach it.",
    means: "Copies of data kept apart from the original, so it can be restored after deletion, corruption or ransomware. A backup counts only if an attacker cannot reach it (offline or immutable) and it has been restored at least once in a test.",
    example: "After ransomware hits the file server, IT rebuilds it and restores last night's copy from storage the attacker could not touch.",
    notTo: "Redundancy. A mirror copies a deletion or an encryption instantly. A backup is a point in time you can go back to.",
  },
  {
    term: "Redundancy",
    cue: "What is redundancy for?",
    gist: "Keeping things running when one part breaks.",
    means: "A second component or path ready to take over when the first fails: two power supplies, a second domain controller, a failover link.",
    example: "One domain controller goes down for patching and staff keep signing in, because the second one answers.",
    notTo: "A backup. Redundancy keeps a service running through a failure, but a deleted or encrypted file is deleted or encrypted on both copies.",
  },
  {
    term: "Patching",
    cue: "Why patch?",
    gist: "To fix known weak spots before someone uses them.",
    means: "Installing vendor updates that fix known defects. It closes vulnerabilities before they can be used, which lowers the likelihood side of risk.",
    example: "A critical Windows update fixes a remote code execution flaw. Until it is installed, every unpatched server is reachable by anyone with the exploit.",
  },
  {
    term: "Distributed denial of service",
    aka: ["ddos", "distributed denial of service (ddos)"],
    cue: "What is a DDoS attack trying to do?",
    gist: "Overwhelm a service so real people can't use it.",
    means: "An attack that floods a service from many machines at once with more traffic or requests than it can answer, so genuine users cannot get through. It targets **availability**. Nothing is stolen or changed.",
    example: "The client portal stops responding while thousands of addresses send requests at the same time.",
    notTo: "A single-source attack. Blocking one IP address does not stop traffic coming from thousands.",
  },

  // Week 1 and Week 4: identity
  {
    term: "Authentication",
    cue: "What question does authentication answer?",
    gist: "Are you really who you say you are?",
    means: "Proving an account is who it claims to be, with a password, a code, a security key or a fingerprint. In a Windows domain the domain controller checks it at sign-in.",
    example: "Event 4624 records a successful sign-in and 4625 a failed one, with the account and where it came from.",
    notTo: "Authorization. Signing in successfully says who you are, not what you may open.",
  },
  {
    term: "Authorization",
    cue: "What question does authorization answer?",
    gist: "What are you allowed to do?",
    means: "Deciding what an identity the system has already authenticated is allowed to reach or do. In Active Directory it usually comes from group membership.",
    example: "An Operations analyst signs in without trouble but cannot open the Finance share, because they are not in the Finance group.",
    notTo: "Authentication, which comes first. A correct password never decides what the account may open.",
  },
  {
    term: "Access control",
    cue: "What does access control do?",
    gist: "Actually stops people reaching what they aren't allowed to.",
    means: "The mechanism that enforces the authorization decision on every request: file and share permissions, a server-side role check, a firewall rule.",
    example: "Each time someone opens a file on the share, Windows checks its permissions again, not just once at sign-in.",
    notTo: "Authorization. Authorization is the decision. Access control enforces it on every request.",
  },
  {
    term: "Accounting",
    strict: true,
    cue: "What is accounting for?",
    gist: "Keeping a record of who did what, so it can be checked later.",
    means: "The record of who did what and when: sign-ins, failures, changes. It lets you trace an action back to an account afterwards.",
    example: "The Security log shows twenty 4625 failures for one account from one address, then a 4624 success.",
  },
  {
    term: "Encryption",
    cue: "What is encryption for?",
    gist: "Keeping data private, so only someone with the key can read it.",
    means: "Scrambling data with a key so only someone holding the right key can read it. It is reversible, but only with that key.",
    example: "BitLocker encrypts a laptop's disk, so a stolen laptop gives the thief nothing readable. TLS encrypts a web session in transit.",
    notTo: "Encoding, which anyone can reverse with no key, or hashing, which nobody can reverse.",
  },

  // Week 2: encoding, encryption, hashing, passwords
  {
    term: "Encoding",
    cue: "Does encoding keep anything secret?",
    gist: "No, it only changes the format so systems can handle the data, and anyone can turn it back.",
    means: "Changing data's format so a system can carry or store it, such as Base64 or URL encoding. There is no key, so anyone can reverse it, and it hides nothing.",
    example: "`SGFyYm9yMjAyNg==` looks scrambled, but CyberChef's From Base64 turns it back into `Harbor2026` in one click.",
    notTo: "Encryption. If it can be reversed without a secret, it is not protecting anything.",
  },
  {
    term: "Hashing",
    cue: "What is hashing for?",
    gist: "Proving data hasn't changed, and checking passwords without storing the password itself.",
    means: "A one-way function that turns any input into a fixed-length fingerprint. The same input always gives the same hash, the smallest change gives a completely different one, and there is no way back to the input.",
    example: "Comparing a download's SHA-256 with the value the vendor published proves the file was not altered.",
    notTo: "Encryption. There is no key that undoes a hash. Passwords are cracked by hashing guesses until one matches, not by reversing anything.",
  },
  {
    term: "Symmetric encryption",
    cue: "What is symmetric encryption good for?",
    gist: "Encrypting lots of data quickly, with one key both sides share.",
    means: "One shared secret key both encrypts and decrypts. It is fast, so it carries bulk data. AES is the standard.",
    example: "BitLocker encrypts the whole disk with one AES key.",
    notTo: "Asymmetric encryption. The hard part of symmetric encryption is getting the shared key to the other side safely, which is what asymmetric keys solve.",
  },
  {
    term: "AES",
    cue: "What is AES?",
    gist: "The encryption most of the world uses to protect data, from laptops to Wi-Fi.",
    means: "The Advanced Encryption Standard, the symmetric cipher used almost everywhere: BitLocker, VPNs, Wi-Fi (WPA2 and WPA3) and the data part of a TLS session.",
  },
  {
    term: "Asymmetric encryption",
    cue: "What problem does asymmetric encryption solve?",
    gist: "Letting two sides set up a secure connection without sharing a secret first.",
    means: "A key pair: a public key anyone may have and a private key only its owner holds. What one key locks, only the other can unlock. It is slow, so it is used to agree keys and to sign, not to encrypt bulk data.",
    example: "In a TLS handshake the server proves it holds the private key behind its certificate, and the two sides agree a symmetric key for the rest of the session.",
    notTo: "Symmetric encryption, which uses one shared key for both directions.",
  },
  {
    term: "BitLocker recovery",
    cue: "A laptop asks for its BitLocker recovery key. What matters most?",
    gist: "Making sure the caller really owns the laptop before you give them the key.",
    means: "BitLocker is Windows' full-disk encryption. When it detects a change to the boot environment, such as a firmware update or a moved disk, it asks for the 48-digit recovery key before it unlocks the drive.",
    example: "Verify the caller with an approved method such as a callback to the number on file, match the Key ID on their screen to the key stored for that computer in Active Directory or Microsoft Entra ID, then read them the key.",
    notTo: "A forgotten password. Resetting the user's password does nothing. Only the recovery key for that Key ID unlocks the disk.",
  },
  {
    term: "Salt",
    cue: "What is a salt for?",
    gist: "Making sure two people with the same password don't end up with the same stored hash.",
    means: "A random value generated for each user and stored next to their password hash. Two people with the same password end up with different stored values, so precomputed tables fail and the table no longer shows who shares a password.",
    notTo: "A secret, or a way to slow guessing. The salt sits in the database in the open. Slowing each guess is the job of a slow hash.",
  },
  {
    term: "Slow hash",
    aka: ["salted, slow hash", "salted slow hash"],
    cue: "Why store passwords with a slow hash?",
    gist: "So a stolen password file takes attackers far too long to crack.",
    means: "A password hashing function that is deliberately expensive to compute, such as Argon2id or bcrypt, run with a per-user salt. A fast hash like SHA-256 lets an attacker test billions of guesses a second. A slow one cuts that to a tiny fraction.",
    example: "A leaked table of bcrypt hashes buys the attacker months of guessing. A leaked table of unsalted SHA-256 hashes gives up most common passwords within hours.",
    notTo: "Encryption. A stored password should not be decryptable by anyone, the company included.",
  },
  {
    term: "Credential stuffing",
    cue: "What is credential stuffing?",
    gist: "Using passwords leaked from one site to break into accounts on another.",
    means: "Taking username and password pairs leaked from one site and trying them automatically on others, betting that people reuse passwords. It needs no skill and no knowledge of the target.",
    example: "Failed sign-ins across hundreds of different accounts from a small set of addresses, with a few successes mixed in.",
    notTo: "Password spraying, which tries a few common passwords against many accounts. Stuffing uses real pairs from a breach. MFA is the defense that holds against both.",
  },
  {
    term: "MFA",
    aka: ["multi-factor authentication"],
    cue: "What is MFA for?",
    gist: "Keeping an account safe even when its password is stolen.",
    means: "Multi-factor authentication requires proof from two different kinds: something you know (a password), something you have (a phone or key), something you are (a fingerprint). A stolen password alone is no longer enough.",
    example: "An attacker with a phished password is stopped at the prompt for the code or the key.",
    notTo: "Two passwords, or a password and a security question. Both are things you know, so it is still one factor.",
  },
  {
    term: "Text and app codes",
    cue: "Can a one-time code be phished?",
    gist: "Yes, a fake sign-in page can ask for it and use it straight away.",
    means: "Codes sent by text or shown in an authenticator app prove you have the device, but a convincing fake sign-in page can collect the code and replay it to the real site within seconds.",
    notTo: "Security keys and passkeys, which check the site's real address and give a fake page nothing it can use.",
  },
  {
    term: "Security keys and passkeys",
    cue: "Why are passkeys hard to phish?",
    gist: "They only work on the real site, so a fake page gets nothing.",
    means: "They sign the sign-in request for the exact domain they were registered with (FIDO2/WebAuthn). On a look-alike domain they produce nothing usable, so there is nothing for the user to hand over.",
    notTo: "Text and app codes, which the user can type into a fake page.",
  },

  // Week 3: networks
  {
    term: "IP address",
    aka: ["address"],
    cue: "What is an IP address for?",
    gist: "Telling the network where to deliver traffic, like a street address.",
    means: "A number that identifies a device on a network so traffic can be routed to it. The address gets traffic to the right machine, and the port gets it to the right program on it.",
    example: "A packet that never reached the host is an addressing or routing problem, not a problem with the service.",
  },
  {
    term: "Port",
    cue: "What is a port for?",
    gist: "Telling a machine which of its services the traffic is meant for.",
    means: "A number (0 to 65535) that selects which service on a machine a connection is for. 22 SSH, 53 DNS, 80 HTTP, 443 HTTPS, 445 SMB file sharing, 3389 Remote Desktop.",
    example: "Inbound traffic on 22 or 3389 from somewhere unexpected usually means someone trying to control a machine, not browse it.",
    notTo: "An address. The address finds the machine, and the port finds the service.",
  },
  {
    term: "Protocol",
    aka: ["protocols"],
    cue: "What is a protocol?",
    gist: "The shared rules that let two systems understand each other.",
    means: "The agreed rules for what two sides say to each other, and in what order, once traffic has reached the device: HTTP for web pages, DNS for names, SMTP for mail.",
  },
  {
    term: "TCP",
    aka: ["reliable connection", "tcp's handshake", "tcp three-way handshake", "three-way handshake"],
    cue: "What does TCP make sure of?",
    gist: "That data arrives complete and in order, once both sides agree to talk.",
    means: "The Transmission Control Protocol opens a connection with a three-way handshake (SYN, SYN-ACK, ACK) before any data moves, then numbers and acknowledges the data so lost pieces are resent and arrive in order.",
    example: "A SYN with no reply means the host never answered (down, filtered or the wrong address). A reset (RST) in reply means the host is up but nothing is listening on that port.",
    notTo: "TLS. TCP's handshake sets up the connection. TLS's handshake comes after it and sets up the privacy.",
  },
  {
    term: "TLS",
    aka: ["tls's handshake", "ssl/tls", "ssl"],
    cue: "What does TLS do?",
    gist: "Keeps a connection private and proves you're talking to the real server.",
    means: "Transport Layer Security encrypts a connection and proves the server is who it claims, using its certificate. It is the S in HTTPS. Its handshake runs after TCP's and agrees the session keys. SSL is the retired older version of it.",
    notTo: "TCP. TCP gets the bytes there reliably. TLS makes sure nobody in between can read or change them.",
  },
  {
    term: "HTTP and HTTPS",
    aka: ["http/https"],
    cue: "What does HTTPS add to HTTP?",
    gist: "Encryption, so nobody in between can read or change what's sent.",
    means: "HTTP is the protocol web pages load over (port 80). HTTPS is HTTP inside TLS (port 443), so the content cannot be read or changed in transit.",
    notTo: "A safe site. HTTPS protects the connection, but a phishing page can have a valid certificate too.",
  },
  {
    term: "DNS",
    cue: "What does DNS do?",
    gist: "Turns names people remember into the addresses machines use.",
    means: "The Domain Name System translates names into IP addresses (port 53). Domain members find their domain controllers through DNS, so a wrong DNS server setting breaks sign-in and joining the domain.",
    example: "A workstation pointed at a public DNS server cannot find `purvexfinancial.local` and cannot join the domain.",
  },
  {
    term: "DHCP",
    cue: "What does DHCP do?",
    gist: "Gives each device an address automatically when it joins the network.",
    means: "Dynamic Host Configuration Protocol leases an IP address, subnet mask, default gateway and DNS server to each device as it joins a network.",
    example: "A laptop showing a 169.254.x.x address never got a DHCP lease, so it gave itself one that cannot reach anything.",
  },
  {
    term: "Subnet mask",
    aka: ["the subnet mask and cidr", "network part", "host part"],
    cue: "What does a subnet mask tell you?",
    gist: "Which devices share the same local network.",
    means: "A subnet mask splits an IPv4 address into a **network part** and a **host part**. In `255.255.255.0`, each 255 marks an octet of network, so `192.168.1.25` is host 25 on network `192.168.1`.",
    example: "Two machines with the same network part are on the same subnet and talk directly. Anything else goes through the default gateway.",
    notTo: "The address itself. The same address with a different mask can sit on a different subnet.",
  },
  {
    term: "CIDR notation",
    aka: ["cidr", "prefix"],
    cue: "What does the /24 in 192.168.1.25/24 tell you?",
    gist: "How big the local network is, written as one short number.",
    means: "CIDR notation writes the subnet mask as the number of network bits after a slash, called the **prefix**. A `/n` subnet holds 2 to the power of (32 minus n) addresses, so `/24` is 256 addresses and `/26` is 64.",
    example: "`/16` is `255.255.0.0` (65,536 addresses), `/24` is `255.255.255.0` (256) and `/30` is `255.255.255.252` (4).",
    notTo: "A count of hosts. A bigger prefix means a smaller subnet, because each extra bit halves it.",
  },
  {
    term: "Network and broadcast address",
    aka: ["network address", "broadcast address"],
    cue: "Why does a /24 hold 254 devices, not 256?",
    gist: "Two addresses are set aside, one to name the network and one to reach every device on it.",
    means: "The first address in a subnet is the **network address** (`192.168.1.0` in a `/24`) and the last is the **broadcast address** (`192.168.1.255`). Neither can be given to a device, so usable hosts are always the total minus two.",
  },
  {
    term: "Default gateway",
    aka: ["gateway"],
    cue: "What is the default gateway for?",
    gist: "It's the way out, where a device sends anything meant for another network.",
    means: "The default gateway is the router that connects a subnet to every other network. A device reaches its own subnet directly and hands everything else to the gateway.",
    example: "A user can print to the printer on their floor but can't reach any server elsewhere. Their default gateway is missing or wrong.",
    notTo: "The DNS server. A wrong gateway stops traffic leaving the subnet. A wrong DNS server stops names from resolving.",
  },
  {
    term: "Private IP address",
    aka: ["private and public addresses", "private address", "rfc 1918"],
    cue: "What are private IP addresses for?",
    gist: "Addressing devices inside a network, where the internet can't reach them directly.",
    means: "RFC 1918 reserves `10.0.0.0/8`, `172.16.0.0/12` (172.16.0.0 to 172.31.255.255) and `192.168.0.0/16` for private networks. Any organization can reuse them inside its own network.",
    example: "In a capture, `10.x` talking to `10.x` is internal. A `10.x` machine sending a large amount of data to a public address nobody recognizes is worth a look.",
    notTo: "Every address starting with 172. `172.32.0.5` is public, because the private range stops at 172.31.",
  },
  {
    term: "NAT",
    aka: ["network address translation"],
    cue: "What does NAT do?",
    gist: "Lets devices with private addresses share a public one to reach the internet.",
    means: "Network Address Translation runs on the router or firewall at the edge of a network. It replaces the private source address of outgoing traffic with a public one, and maps the replies back.",
  },
  {
    term: "SMTP, POP3, and IMAP",
    aka: ["smtp/pop3/imap", "smtp, pop3 and imap"],
    cue: "Which mail protocol sends, and which ones fetch?",
    gist: "SMTP sends mail, and POP3 and IMAP fetch it.",
    means: "SMTP sends mail and relays it between servers (25, and 587 for clients submitting mail). POP3 (110, 995 with TLS) and IMAP (143, 993 with TLS) let a client fetch it: POP3 typically downloads it, IMAP keeps it synced on the server.",
  },

  // Week 4: access control and Active Directory permissions
  {
    term: "Broken access control",
    cue: "What is broken access control?",
    gist: "The app doesn't check permissions, so people reach things they shouldn't.",
    means: "The server fails to enforce what a user may do, so they reach data or actions beyond their permissions. It is A01, the top risk, in the OWASP Top 10.",
    example: "A regular user changes a value in a request and the application treats them as an administrator.",
    notTo: "A sign-in flaw. The user authenticated correctly. The server skipped the authorization check.",
  },
  {
    term: "Insecure direct object reference (IDOR)",
    aka: ["idor", "insecure direct object reference"],
    cue: "What is an IDOR?",
    gist: "Changing an ID in a request and getting someone else's data, because the app never checks it's yours.",
    means: "Changing an identifier in a request returns someone else's record, because the server never checks that the record belongs to the person asking.",
    example: "`/statements?id=1043` shows your statement, and `id=1044` shows another client's.",
  },
  {
    term: "Forced browsing",
    cue: "What is forced browsing?",
    gist: "Going straight to a hidden page by its address and getting in, because hiding it was the only protection.",
    means: "Requesting a page the interface never offered, such as `/admin`, and getting in because hiding the link was the only protection.",
  },
  {
    term: "Parameter tampering",
    cue: "What is parameter tampering?",
    gist: "Changing a value the app should decide for you, like your role, and the app believing it.",
    means: "Sending a value the server should have decided itself, such as a role or an account ID, and the server trusts it.",
    example: "Adding `\"roleid\": 2` to a profile update request and coming back as an administrator.",
  },
  {
    term: "Security groups",
    cue: "Why give permissions to groups, not people?",
    gist: "So access follows the job, and someone moving or leaving takes one change.",
    means: "Active Directory groups that permissions are granted to. People are added to the group for their role, so access follows the role: a move or a departure is one membership change, not a hunt through every folder.",
    example: "A new Compliance analyst is added to the Compliance group and can open the Compliance share the same day, with no folder changed.",
  },
  {
    term: "Member Of",
    cue: "Where do you see which groups an account is in?",
    gist: "The Member Of tab, which is where most of its access comes from.",
    means: "The tab on an account's Properties in Active Directory Users and Computers that lists its groups. It is the first place to look when someone can or cannot reach something.",
  },
  {
    term: "Share and NTFS permissions",
    aka: ["share", "ntfs"],
    cue: "Share or NTFS permissions: which wins over the network?",
    gist: "Whichever is stricter.",
    means: "Share permissions apply when the folder is reached over the network. NTFS permissions apply to the files themselves, locally and over the network. Over the network, the more restrictive of the two wins.",
    example: "Share permission Full Control, NTFS Read: a user on the network can only read.",
  },
  {
    term: "Effective Access",
    cue: "How do you see what someone can really do on a folder?",
    gist: "The Effective Access tab, which adds up every group they're in.",
    means: "The tab in a folder's Advanced Security Settings that works out what a named user can do once every group they belong to is counted, including any deny.",
  },
  {
    term: "Event IDs 4624 and 4625",
    aka: ["4624", "4625"],
    cue: "Why do event IDs 4624 and 4625 matter?",
    gist: "They record each successful (4624) and failed (4625) sign-in, so they're where password guessing shows up.",
    means: "In the Windows Security log, **4624** is a successful logon and **4625** a failed one, with the account, the logon type and the source. **4740** is an account being locked out.",
    example: "A run of 4625s against one account, then a 4740, is a lockout. A run of 4625s across many accounts from one source is spraying.",
  },

  // The Home Lab
  {
    term: "User account",
    cue: "What does a user account represent?",
    gist: "One person, and what they're allowed to reach.",
    means: "One person in the directory: the identity they sign in with, the groups that decide what they can reach, and the attributes (department, title, manager) that describe them.",
  },
  {
    term: "Computer object",
    cue: "What is a computer object?",
    gist: "A machine the domain knows and trusts, kept in the directory like a user.",
    means: "A machine joined to the domain, recorded in the directory the same way a user account records a person. It has its own account, password and group memberships.",
  },
  {
    term: "Service account",
    cue: "What is a service account?",
    gist: "An account software runs as, so it should only get what that software needs.",
    means: "A user object that runs software, not a person. It often has broad rights and a password nobody changes, so it should have only the access its service needs and should never be used to sign in interactively.",
  },
  {
    term: "Account is disabled",
    cue: "Will an unlock or a reset fix a disabled account?",
    gist: "No, someone has to approve turning it back on.",
    means: "A disabled account cannot sign in at all, whatever its password or lockout state. Unlock and reset do not change it. It has to be enabled, and only when the ticket and its approval say so.",
    notTo: "Locked out. A lockout clears with time or an unlock. Disabled is a deliberate switch.",
  },
  {
    term: "Unlock account",
    aka: ["unlock the user's account", "properties → account"],
    cue: "What does unlocking an account do?",
    gist: "Lets the person try again, without changing their password.",
    means: "A lockout follows too many failed sign-ins under the lockout policy. Unlocking clears it so the user can try again. The password stays the same.",
    notTo: "A password reset. If the user has forgotten the password, unlock alone will just lock them out again.",
  },
  {
    term: "Reset Password",
    cue: "What matters most in a password reset?",
    gist: "Making sure the caller is really the owner, then making them choose a new password.",
    means: "Sets a new temporary password on the account, normally with **User must change password at next logon** ticked so only the user knows the final one. Verify the caller first.",
  },

  // Phase 2: malware
  {
    term: "Phishing",
    cue: "Why does phishing work so well?",
    gist: "It fools a person, and people are easier to trick than systems.",
    means: "Messages that trick a person into opening a malicious attachment, following a link to a fake sign-in page, or acting on a fake request. It works on people, so it gets past technical controls.",
  },
  {
    term: "Malicious downloads",
    cue: "How does malware get in through a download?",
    gist: "It hides inside something that looks normal and useful.",
    means: "A user runs what looks like a normal installer, often from a search ad or a cracked-software site, and installs malware along with it or instead of it.",
  },
  {
    term: "Removable media",
    cue: "How can a USB drive infect a machine with no internet?",
    gist: "Someone opens a file on it, and the malware runs.",
    means: "Malware carried on the drive runs when its files are opened, so it can reach machines no network connects to.",
  },
  {
    term: "Exploited software",
    cue: "How can malware get in without anyone clicking?",
    gist: "Through software that hasn't been patched.",
    means: "Unpatched software reachable over the network is attacked directly through a known flaw. Nobody needs to click anything. Patching is the defense.",
  },
  {
    term: "Virus",
    cue: "How does a virus spread?",
    gist: "Only when someone opens an infected file.",
    means: "It attaches to a file or program and runs when that file is opened, so it needs a person to open it to spread.",
    notTo: "A worm, which spreads across a network on its own.",
  },
  {
    term: "Worm",
    cue: "How does a worm spread?",
    gist: "By itself, from machine to machine, with nobody doing anything.",
    means: "On its own, across a network, by exploiting systems directly. Nobody needs to open anything, which is why worms spread so fast.",
    notTo: "A virus, which needs a file to be opened.",
  },
  {
    term: "Trojan",
    cue: "How does a trojan get in?",
    gist: "It pretends to be something useful, so the user runs it.",
    means: "It hides inside something that looks legitimate, such as a cracked app or a fake installer, and the user runs it themselves.",
  },
  {
    term: "Ransomware",
    cue: "What does ransomware do?",
    gist: "Locks your files and demands payment, which good offline backups make unnecessary.",
    means: "It encrypts files and demands payment for the key. Many groups also steal the data first and threaten to publish it. Offline or immutable backups are what make recovery possible without paying.",
  },
  {
    term: "Spyware and infostealers",
    cue: "What do infostealers take?",
    gist: "Saved passwords and sign-in sessions, so attackers can log in as you.",
    means: "Spyware watches what a user does. Infostealers grab saved passwords, browser cookies and session tokens, and send them to the attacker, who can then sign in as the user, sometimes past MFA.",
  },
  {
    term: "Contain",
    strict: true,
    cue: "What's the first move on a machine that's really infected?",
    gist: "Cut it off from the network, but leave it running.",
    means: "Isolate the host from the network so the malware cannot spread or talk to the attacker, while leaving the machine running.",
    notTo: "Wiping or rebuilding, which destroys the evidence of what happened.",
  },
  {
    term: "Preserve",
    strict: true,
    aka: ["preserve evidence"],
    cue: "Why not wipe an infected machine right away?",
    gist: "You'd destroy the evidence of how the attack happened.",
    means: "Keep the machine and its logs as they are until the incident is understood. Memory, files and logs show how it got in and what it touched.",
  },
  {
    term: "Escalate",
    strict: true,
    cue: "When do you escalate?",
    gist: "When it's beyond your access, authority or skill, and you send along what you found.",
    means: "Hand the problem to the next tier when it needs more access, authority or skill than your role has. Send what you found with it: who and what is affected, when it started, what you checked and what you already did.",
    example: "\"Workstation WS-114, user in Finance, Defender alert 09:42 for a trojan in Downloads. Confirmed the file is there. Isolated the host at 09:50. Not wiped.\"",
    notTo: "Passing it on empty-handed. An escalation the next tier has to start from scratch costs the time it was meant to save.",
  },
];

const BY_NAME = new Map<string, GlossaryEntry>();
for (const e of GLOSSARY) for (const k of [e.term, ...(e.aka ?? [])]) BY_NAME.set(k.toLowerCase(), e);

/** The entry a name refers to, by its term or any other name for it. */
export function lookup(name: string): GlossaryEntry | undefined {
  return BY_NAME.get(name.trim().replace(/[.:]$/, "").toLowerCase());
}

/** Every name the glossary answers to, longest first so "TLS's handshake" wins over "TLS". */
export const NAMES = [...BY_NAME.keys()].sort((a, b) => b.length - a.length);
