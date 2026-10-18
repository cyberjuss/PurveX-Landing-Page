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
  /** The question on the front of the review card. */
  cue: string;
  /** What it means, precisely. Markdown inline. */
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
    cue: "What does confidentiality protect, and what does its failure look like?",
    means: "Only authorized people can read the information. When it fails, data is exposed to someone who should not see it: a **leak**.",
    example: "A payroll spreadsheet is emailed to the wrong distribution list. Nothing was changed or deleted, but people who should not see salaries now have them.",
    notTo: "An integrity failure. Leaked data is still correct; the harm is who has seen it. Controls: access control, encryption, need to know.",
  },
  {
    term: "Integrity",
    aka: ["lie"],
    cue: "What does integrity protect, and what does its failure look like?",
    means: "Information stays accurate and complete, changed only by authorized people through authorized means. When it fails, people act on data that is wrong: a **lie**.",
    example: "Someone edits the bank details on a vendor invoice, and Finance pays the attacker. The file was never hidden or unavailable. It just stopped being true.",
    notTo: "A confidentiality failure. Nobody needs to read the data for its integrity to fail. Controls: hashing, digital signatures, audit logs, change approval.",
  },
  {
    term: "Availability",
    aka: ["lockout"],
    cue: "What does availability protect, and what does its failure look like?",
    means: "Systems and data are there when authorized people need them. When it fails, the work stops: a **lockout**.",
    example: "Ransomware encrypts the file server, or a flood of traffic takes down the client portal. The data may be intact and private, but nobody can use it.",
    notTo: "Data loss alone. A service can be down with every file safe. Controls: backups, redundancy, patching, capacity.",
  },
  {
    term: "Vulnerability",
    cue: "What is a vulnerability, and does it cause harm on its own?",
    means: "A weakness that could be exploited: an unpatched service, a misconfiguration, a reused password, a process nobody follows. On its own it does nothing; it waits.",
    example: "Remote Desktop (port 3389) open to the internet on a server that has not been patched in a year.",
    notTo: "A threat. The weakness exists whether or not anyone is trying to use it.",
  },
  {
    term: "Threat",
    cue: "What is a threat, and how is it different from a vulnerability?",
    means: "Anyone or anything that could exploit a vulnerability and cause harm: a criminal group, malware, a careless or angry insider, even a flood or a power cut.",
    example: "A ransomware crew scanning the internet for exposed Remote Desktop servers.",
    notTo: "A vulnerability. A threat with no weakness to use has nothing to work with; a weakness with no threat is not yet being used.",
  },
  {
    term: "Risk",
    aka: ["likelihood × impact", "likelihood x impact"],
    cue: "How is risk worked out, and what lowers it?",
    means: "The chance that a threat exploits a vulnerability, combined with what it would cost if it did. Most teams score it as **likelihood × impact**.",
    example: "The same unpatched flaw is high risk on an internet-facing server holding client records, and low risk on an isolated test machine with nothing on it.",
    notTo: "Severity. A CVSS score rates the flaw itself; risk depends on where it sits and what it guards. A control lowers risk by cutting the likelihood (patching) or the impact (backups).",
  },
  {
    term: "Backups",
    cue: "What makes a backup one you can count on?",
    means: "Copies of data kept apart from the original, so it can be restored after deletion, corruption or ransomware. A backup counts only if an attacker cannot reach it (offline or immutable) and it has been restored at least once in a test.",
    example: "After ransomware hits the file server, IT rebuilds it and restores last night's copy from storage the attacker could not touch.",
    notTo: "Redundancy. A mirror copies a deletion or an encryption instantly; a backup is a point in time you can go back to.",
  },
  {
    term: "Redundancy",
    cue: "What does redundancy protect against, and what can it not undo?",
    means: "A second component or path ready to take over when the first fails: two power supplies, a second domain controller, a failover link.",
    example: "One domain controller goes down for patching and staff keep signing in, because the second one answers.",
    notTo: "A backup. Redundancy keeps a service running through a failure, but a deleted or encrypted file is deleted or encrypted on both copies.",
  },
  {
    term: "Patching",
    cue: "What does patching do to risk?",
    means: "Installing vendor updates that fix known defects. It closes vulnerabilities before they can be used, which lowers the likelihood side of risk.",
    example: "A critical Windows update fixes a remote code execution flaw; until it is installed, every unpatched server is reachable by anyone with the exploit.",
  },
  {
    term: "Distributed denial of service",
    aka: ["ddos", "distributed denial of service (ddos)"],
    cue: "What does a DDoS attack target, and why is it hard to block?",
    means: "An attack that floods a service from many machines at once with more traffic or requests than it can answer, so genuine users cannot get through. It targets **availability**; nothing is stolen or changed.",
    example: "The client portal stops responding while thousands of addresses send requests at the same time.",
    notTo: "A single-source attack. Blocking one IP address does not stop traffic coming from thousands.",
  },

  // Week 1 and Week 4: identity
  {
    term: "Authentication",
    cue: "What question does authentication answer?",
    means: "Proving an account is who it claims to be, with a password, a code, a security key or a fingerprint. In a Windows domain the domain controller checks it at sign-in.",
    example: "Event 4624 records a successful sign-in; 4625 records a failed one, with the account and where it came from.",
    notTo: "Authorization. Signing in successfully says who you are, not what you may open.",
  },
  {
    term: "Authorization",
    cue: "What question does authorization answer, and when does it come?",
    means: "Deciding what an identity the system has already authenticated is allowed to reach or do. In Active Directory it usually comes from group membership.",
    example: "An Operations analyst signs in without trouble but cannot open the Finance share, because they are not in the Finance group.",
    notTo: "Authentication, which comes first. A correct password never decides what the account may open.",
  },
  {
    term: "Access control",
    cue: "How is access control different from authorization?",
    means: "The mechanism that enforces the authorization decision on every request: file and share permissions, a server-side role check, a firewall rule.",
    example: "Each time someone opens a file on the share, Windows checks its permissions again, not just once at sign-in.",
    notTo: "Authorization. Authorization is the decision; access control is enforcing it on every request.",
  },
  {
    term: "Accounting",
    strict: true,
    cue: "What does accounting add to authentication and authorization?",
    means: "The record of who did what and when: sign-ins, failures, changes. It lets you trace an action back to an account afterwards.",
    example: "The Security log shows twenty 4625 failures for one account from one address, then a 4624 success.",
  },
  {
    term: "Encryption",
    cue: "What does encryption need to be undone, and what does it protect?",
    means: "Scrambling data with a key so only someone holding the right key can read it. It is reversible, but only with that key.",
    example: "BitLocker encrypts a laptop's disk, so a stolen laptop gives the thief nothing readable; TLS encrypts a web session in transit.",
    notTo: "Encoding, which anyone can reverse with no key, or hashing, which nobody can reverse.",
  },

  // Week 2: encoding, encryption, hashing, passwords
  {
    term: "Encoding",
    cue: "Does encoding keep anything secret?",
    means: "Changing data's format so a system can carry or store it, such as Base64 or URL encoding. There is no key, so anyone can reverse it, and it hides nothing.",
    example: "`SGFyYm9yMjAyNg==` looks scrambled, but CyberChef's From Base64 turns it back into `Harbor2026` in one click.",
    notTo: "Encryption. If it can be reversed without a secret, it is not protecting anything.",
  },
  {
    term: "Hashing",
    cue: "What does a hash let you prove, and can it be reversed?",
    means: "A one-way function that turns any input into a fixed-length fingerprint. The same input always gives the same hash, the smallest change gives a completely different one, and there is no way back to the input.",
    example: "Comparing a download's SHA-256 with the value the vendor published proves the file was not altered.",
    notTo: "Encryption. There is no key that undoes a hash. Passwords are cracked by hashing guesses until one matches, not by reversing anything.",
  },
  {
    term: "Symmetric encryption",
    cue: "How many keys does symmetric encryption use, and what is it good at?",
    means: "One shared secret key both encrypts and decrypts. It is fast, so it carries bulk data. AES is the standard.",
    example: "BitLocker encrypts the whole disk with one AES key.",
    notTo: "Asymmetric encryption. The hard part of symmetric encryption is getting the shared key to the other side safely, which is what asymmetric keys solve.",
  },
  {
    term: "AES",
    cue: "What is AES, and where will you meet it?",
    means: "The Advanced Encryption Standard, the symmetric cipher used almost everywhere: BitLocker, VPNs, Wi-Fi (WPA2 and WPA3) and the data part of a TLS session.",
  },
  {
    term: "Asymmetric encryption",
    cue: "How do the two keys in asymmetric encryption work together?",
    means: "A key pair: a public key anyone may have and a private key only its owner holds. What one key locks, only the other can unlock. It is slow, so it is used to agree keys and to sign, not to encrypt bulk data.",
    example: "In a TLS handshake the server proves it holds the private key behind its certificate, and the two sides agree a symmetric key for the rest of the session.",
    notTo: "Symmetric encryption, which uses one shared key for both directions.",
  },
  {
    term: "BitLocker recovery",
    cue: "A user's laptop shows the BitLocker recovery screen. What do you do?",
    means: "BitLocker is Windows' full-disk encryption. When it detects a change to the boot environment, such as a firmware update or a moved disk, it asks for the 48-digit recovery key before it unlocks the drive.",
    example: "Verify the caller with an approved method such as a callback to the number on file, match the Key ID on their screen to the key stored for that computer in Active Directory or Microsoft Entra ID, then read them the key.",
    notTo: "A forgotten password. Resetting the user's password does nothing; only the recovery key for that Key ID unlocks the disk.",
  },
  {
    term: "Salt",
    cue: "What does a salt do to stored passwords, and is it secret?",
    means: "A random value generated for each user and stored next to their password hash. Two people with the same password end up with different stored values, so precomputed tables fail and the table no longer shows who shares a password.",
    notTo: "A secret, or a way to slow guessing. The salt sits in the database in the open; slowing each guess is the job of a slow hash.",
  },
  {
    term: "Slow hash",
    aka: ["salted, slow hash", "salted slow hash"],
    cue: "How should a system store passwords, and why slow?",
    means: "A password hashing function that is deliberately expensive to compute, such as Argon2id or bcrypt, run with a per-user salt. A fast hash like SHA-256 lets an attacker test billions of guesses a second; a slow one cuts that to a tiny fraction.",
    example: "A leaked table of bcrypt hashes buys the attacker months of guessing; a leaked table of unsalted SHA-256 hashes gives up most common passwords within hours.",
    notTo: "Encryption. A stored password should not be decryptable by anyone, the company included.",
  },
  {
    term: "Credential stuffing",
    cue: "What is credential stuffing, and what stops it?",
    means: "Taking username and password pairs leaked from one site and trying them automatically on others, betting that people reuse passwords. It needs no skill and no knowledge of the target.",
    example: "Failed sign-ins across hundreds of different accounts from a small set of addresses, with a few successes mixed in.",
    notTo: "Password spraying, which tries a few common passwords against many accounts. Stuffing uses real pairs from a breach. MFA is the defense that holds against both.",
  },
  {
    term: "MFA",
    aka: ["multi-factor authentication"],
    cue: "What makes it multi-factor, and why does it matter after a password leaks?",
    means: "Multi-factor authentication requires proof from two different kinds: something you know (a password), something you have (a phone or key), something you are (a fingerprint). A stolen password alone is no longer enough.",
    example: "An attacker with a phished password is stopped at the prompt for the code or the key.",
    notTo: "Two passwords, or a password and a security question. Both are things you know, so it is still one factor.",
  },
  {
    term: "Text and app codes",
    cue: "Why can a one-time code still be phished?",
    means: "Codes sent by text or shown in an authenticator app prove you have the device, but a convincing fake sign-in page can collect the code and replay it to the real site within seconds.",
    notTo: "Security keys and passkeys, which check the site's real address and give a fake page nothing it can use.",
  },
  {
    term: "Security keys and passkeys",
    cue: "Why do security keys and passkeys resist phishing?",
    means: "They sign the sign-in request for the exact domain they were registered with (FIDO2/WebAuthn). On a look-alike domain they produce nothing usable, so there is nothing for the user to hand over.",
    notTo: "Text and app codes, which the user can type into a fake page.",
  },

  // Week 3: networks
  {
    term: "IP address",
    aka: ["address"],
    cue: "What does an IP address do?",
    means: "A number that identifies a device on a network so traffic can be routed to it. The address gets traffic to the right machine; the port gets it to the right program on it.",
    example: "A packet that never reached the host is an addressing or routing problem, not a problem with the service.",
  },
  {
    term: "Port",
    cue: "What does a port select, and which ones should you know on sight?",
    means: "A number (0 to 65535) that selects which service on a machine a connection is for. 22 SSH, 53 DNS, 80 HTTP, 443 HTTPS, 445 SMB file sharing, 3389 Remote Desktop.",
    example: "Inbound traffic on 22 or 3389 from somewhere unexpected usually means someone trying to control a machine, not browse it.",
    notTo: "An address. The address finds the machine; the port finds the service.",
  },
  {
    term: "Protocol",
    aka: ["protocols"],
    cue: "What is a protocol?",
    means: "The agreed rules for what two sides say to each other, and in what order, once traffic has reached the device: HTTP for web pages, DNS for names, SMTP for mail.",
  },
  {
    term: "TCP",
    aka: ["reliable connection", "tcp's handshake", "tcp three-way handshake", "three-way handshake"],
    cue: "How does TCP open a connection, and what do the answers tell you?",
    means: "The Transmission Control Protocol opens a connection with a three-way handshake (SYN, SYN-ACK, ACK) before any data moves, then numbers and acknowledges the data so lost pieces are resent and arrive in order.",
    example: "A SYN with no reply means the host never answered (down, filtered or the wrong address). A reset (RST) in reply means the host is up but nothing is listening on that port.",
    notTo: "TLS. TCP's handshake sets up the connection; TLS's handshake, which comes after it, sets up the privacy.",
  },
  {
    term: "TLS",
    aka: ["tls's handshake", "ssl/tls", "ssl"],
    cue: "What does TLS add to a connection, and when does its handshake happen?",
    means: "Transport Layer Security encrypts a connection and proves the server is who it claims, using its certificate. It is the S in HTTPS. Its handshake runs after TCP's and agrees the session keys. SSL is the retired older version of it.",
    notTo: "TCP. TCP gets the bytes there reliably; TLS makes sure nobody in between can read or change them.",
  },
  {
    term: "HTTP and HTTPS",
    aka: ["http/https"],
    cue: "What is the difference between HTTP and HTTPS?",
    means: "HTTP is the protocol web pages load over (port 80). HTTPS is HTTP inside TLS (port 443), so the content cannot be read or changed in transit.",
    notTo: "A safe site. HTTPS protects the connection; a phishing page can have a valid certificate too.",
  },
  {
    term: "DNS",
    cue: "What does DNS do, and why does Active Directory depend on it?",
    means: "The Domain Name System translates names into IP addresses (port 53). Domain members find their domain controllers through DNS, so a wrong DNS server setting breaks sign-in and joining the domain.",
    example: "A workstation pointed at a public DNS server cannot find `purvexfinancial.local` and cannot join the domain.",
  },
  {
    term: "DHCP",
    cue: "What does DHCP hand out, and what does a 169.254 address tell you?",
    means: "Dynamic Host Configuration Protocol leases an IP address, subnet mask, default gateway and DNS server to each device as it joins a network.",
    example: "A laptop showing a 169.254.x.x address never got a DHCP lease, so it gave itself one that cannot reach anything.",
  },
  {
    term: "SMTP, POP3, and IMAP",
    aka: ["smtp/pop3/imap", "smtp, pop3 and imap"],
    cue: "Which mail protocol sends, and which ones fetch?",
    means: "SMTP sends mail and relays it between servers (25, and 587 for clients submitting mail). POP3 (110, 995 with TLS) and IMAP (143, 993 with TLS) let a client fetch it: POP3 typically downloads it, IMAP keeps it synced on the server.",
  },

  // Week 4: access control and Active Directory permissions
  {
    term: "Broken access control",
    cue: "What is broken access control?",
    means: "The server fails to enforce what a user may do, so they reach data or actions beyond their permissions. It is A01, the top risk, in the OWASP Top 10.",
    example: "A regular user changes a value in a request and the application treats them as an administrator.",
    notTo: "A sign-in flaw. The user authenticated correctly; the server skipped the authorization check.",
  },
  {
    term: "Insecure direct object reference (IDOR)",
    aka: ["idor", "insecure direct object reference"],
    cue: "What does an IDOR look like in a request?",
    means: "Changing an identifier in a request returns someone else's record, because the server never checks that the record belongs to the person asking.",
    example: "`/statements?id=1043` shows your statement; `id=1044` shows another client's.",
  },
  {
    term: "Forced browsing",
    cue: "What is forced browsing?",
    means: "Requesting a page the interface never offered, such as `/admin`, and getting in because hiding the link was the only protection.",
  },
  {
    term: "Parameter tampering",
    cue: "What is parameter tampering?",
    means: "Sending a value the server should have decided itself, such as a role or an account ID, and the server trusts it.",
    example: "Adding `\"roleid\": 2` to a profile update request and coming back as an administrator.",
  },
  {
    term: "Security groups",
    cue: "Why are permissions granted to groups and not to people?",
    means: "Active Directory groups that permissions are granted to. People are added to the group for their role, so access follows the role: a move or a departure is one membership change, not a hunt through every folder.",
    example: "A new Compliance analyst is added to the Compliance group and can open the Compliance share the same day, with no folder changed.",
  },
  {
    term: "Member Of",
    cue: "Where do you check which groups an account is in?",
    means: "The tab on an account's Properties in Active Directory Users and Computers that lists its groups. It is the first place to look when someone can or cannot reach something.",
  },
  {
    term: "Share and NTFS permissions",
    aka: ["share", "ntfs"],
    cue: "A shared folder has two sets of permissions. Which one wins over the network?",
    means: "Share permissions apply when the folder is reached over the network; NTFS permissions apply to the files themselves, locally and over the network. Over the network, the more restrictive of the two wins.",
    example: "Share permission Full Control, NTFS Read: a user on the network can only read.",
  },
  {
    term: "Effective Access",
    cue: "How do you see what one user can actually do on a folder?",
    means: "The tab in a folder's Advanced Security Settings that works out what a named user can do once every group they belong to is counted, including any deny.",
  },
  {
    term: "Event IDs 4624 and 4625",
    aka: ["4624", "4625"],
    cue: "Which Windows event IDs record a successful and a failed sign-in?",
    means: "In the Windows Security log, **4624** is a successful logon and **4625** a failed one, with the account, the logon type and the source. **4740** is an account being locked out.",
    example: "A run of 4625s against one account, then a 4740, is a lockout; a run of 4625s across many accounts from one source is spraying.",
  },

  // The Home Lab
  {
    term: "User account",
    cue: "What does a user account in the directory stand for?",
    means: "One person in the directory: the identity they sign in with, the groups that decide what they can reach, and the attributes (department, title, manager) that describe them.",
  },
  {
    term: "Computer object",
    cue: "What is a computer object in Active Directory?",
    means: "A machine joined to the domain, recorded in the directory the same way a user account records a person. It has its own account, password and group memberships.",
  },
  {
    term: "Service account",
    cue: "What is a service account, and why does it need extra care?",
    means: "A user object that runs software, not a person. It often has broad rights and a password nobody changes, so it should have only the access its service needs and should never be used to sign in interactively.",
  },
  {
    term: "Account is disabled",
    cue: "An account is disabled. Will an unlock or a password reset let them sign in?",
    means: "A disabled account cannot sign in at all, whatever its password or lockout state. Unlock and reset do not change it; it has to be enabled, and only when the ticket and its approval say so.",
    notTo: "Locked out. A lockout clears with time or an unlock; disabled is a deliberate switch.",
  },
  {
    term: "Unlock account",
    aka: ["unlock the user's account", "properties → account"],
    cue: "What does unlocking an account do, and what does it leave alone?",
    means: "A lockout follows too many failed sign-ins under the lockout policy. Unlocking clears it so the user can try again; the password stays the same.",
    notTo: "A password reset. If the user has forgotten the password, unlock alone will just lock them out again.",
  },
  {
    term: "Reset Password",
    cue: "How should a help desk password reset be done?",
    means: "Sets a new temporary password on the account, normally with **User must change password at next logon** ticked so only the user knows the final one. Verify the caller first.",
  },

  // Phase 2: malware
  {
    term: "Phishing",
    cue: "Why is phishing the most common way in?",
    means: "Messages that trick a person into opening a malicious attachment, following a link to a fake sign-in page, or acting on a fake request. It works on people, so it gets past technical controls.",
  },
  {
    term: "Malicious downloads",
    cue: "How does malware arrive through a download?",
    means: "A user runs what looks like a normal installer, often from a search ad or a cracked-software site, and installs malware along with it or instead of it.",
  },
  {
    term: "Removable media",
    cue: "How can a USB drive infect a machine with no internet access?",
    means: "Malware carried on the drive runs when its files are opened, so it can reach machines no network connects to.",
  },
  {
    term: "Exploited software",
    cue: "How can malware get in with no user action at all?",
    means: "Unpatched software reachable over the network is attacked directly through a known flaw. Nobody needs to click anything; patching is the defense.",
  },
  {
    term: "Virus",
    cue: "How does a virus spread?",
    means: "It attaches to a file or program and runs when that file is opened, so it needs a person to open it to spread.",
    notTo: "A worm, which spreads across a network on its own.",
  },
  {
    term: "Worm",
    cue: "How does a worm spread?",
    means: "On its own, across a network, by exploiting systems directly. Nobody needs to open anything, which is why worms spread so fast.",
    notTo: "A virus, which needs a file to be opened.",
  },
  {
    term: "Trojan",
    cue: "How does a trojan get onto a machine?",
    means: "It hides inside something that looks legitimate, such as a cracked app or a fake installer, and the user runs it themselves.",
  },
  {
    term: "Ransomware",
    cue: "What does ransomware do, and what protects against it?",
    means: "It encrypts files and demands payment for the key. Many groups also steal the data first and threaten to publish it. Offline or immutable backups are what make recovery possible without paying.",
  },
  {
    term: "Spyware and infostealers",
    cue: "What do infostealers take?",
    means: "Spyware watches what a user does. Infostealers grab saved passwords, browser cookies and session tokens, and send them to the attacker, who can then sign in as the user, sometimes past MFA.",
  },
  {
    term: "Contain",
    strict: true,
    cue: "When an endpoint alert is real, what is the first move, and why?",
    means: "Isolate the host from the network so the malware cannot spread or talk to the attacker, while leaving the machine running.",
    notTo: "Wiping or rebuilding, which destroys the evidence of what happened.",
  },
  {
    term: "Preserve",
    strict: true,
    aka: ["preserve evidence"],
    cue: "Why not wipe an infected machine straight away?",
    means: "Keep the machine and its logs as they are until the incident is understood. Memory, files and logs show how it got in and what it touched.",
  },
  {
    term: "Escalate",
    strict: true,
    cue: "When do you escalate, and what goes with it?",
    means: "Hand the problem to the next tier when it needs more access, authority or skill than your role has. Send what you found with it: who and what is affected, when it started, what you checked and what you already did.",
    example: "\"Workstation WS-114, user in Finance, Defender alert 09:42 for a trojan in Downloads. Confirmed the file is there; isolated the host at 09:50. Not wiped.\"",
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
