export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  phaseSlug: string;
  weekSlug: string;
  questions: QuizQuestion[];
}

export const QUIZ_PASS_PERCENT = 70;

export function quizPassed(score: number, total: number) {
  if (total === 0) return false;
  return Math.round((score / total) * 100) >= QUIZ_PASS_PERCENT;
}

export const quizzes: Quiz[] = [
  {
    phaseSlug: "phase-1",
    weekSlug: "week-1",
    questions: [
      {
        question: "A DDoS attack takes a company's web server offline for six hours. Which leg of the CIA triad did this attack break?",
        options: ["Confidentiality", "Integrity", "Availability", "Accountability"],
        correctIndex: 2,
        explanation: "Nothing was read or changed, so confidentiality and integrity held. The server was not there when people needed it. That is an availability failure, a lockout.",
      },
      {
        question: "An attacker does not steal or change anything, but quietly intercepts unencrypted traffic and reads a customer's SSN as it crosses the network. Which CIA property is broken?",
        options: ["Confidentiality", "Integrity", "Availability", "None, because nothing was changed"],
        correctIndex: 0,
        explanation: "Nothing was changed and the service stayed up, so integrity and availability held. Someone who should not see the SSN read it. That is a confidentiality failure, a leak.",
      },
      {
        question: "What is the real difference between a threat and a vulnerability?",
        options: [
          "They are the same thing, just different words analysts use",
          "A vulnerability is a weakness, and a threat is something or someone that could exploit it",
          "A threat is a weakness, and a vulnerability is something that could exploit it",
          "A vulnerability only applies to software, a threat only applies to people",
        ],
        correctIndex: 1,
        explanation: "A vulnerability is the weakness. A threat is what could exploit it. Risk exists only when both are present.",
      },
      {
        question: "The formula is Risk = Threat × Vulnerability × Impact. A server has a known critical vulnerability, but suppose no threat could ever reach it. Under the formula, what is the risk?",
        options: ["Still critical, because a severe vulnerability carries its risk whether or not anything can reach it", "Zero, because no threat means no risk, regardless of the vulnerability", "Impossible to calculate", "Moderate, as a precaution"],
        correctIndex: 1,
        explanation: "In the formula, a threat of zero makes the risk zero, whatever the vulnerability. In practice that case is rare. Even an air-gapped server can be reached by USB drives and insiders, so cutting off a path lowers the threat rather than removing it.",
      },
      {
        question: "Which of these is a control for integrity rather than confidentiality?",
        options: ["Access control lists", "Encryption", "Digital signatures / checksums", "Need-to-know policies"],
        correctIndex: 2,
        explanation: "Signatures and checksums show whether data was changed, which is integrity. Encryption, access lists and need-to-know policies control who can see data, which is confidentiality.",
      },
      {
        question: "A vulnerability scan comes back with 200 findings on PurveX's servers. What is the right way to work through that list?",
        options: [
          "Fix all 200 immediately, starting from the top of the report",
          "Ask whether anything can actually reach each finding and what it would cost, rather than ranking by how bad it looks",
          "Ignore the scan, since a vulnerability is not an attack",
          "Start with the critical and high severity scores, since the scanner has already ranked how dangerous each finding is",
        ],
        correctIndex: 1,
        explanation: "A weakness nothing can reach is not a problem yet. For every finding, the question is whether a real threat can get to it and what the damage would be, not how alarming it sounds on its own.",
      },
      {
        question: "The office's main internet link fails at 9 AM, and nobody can reach the firm's cloud apps. Which availability control gets PurveX working again fastest?",
        options: ["Backups, so the cloud apps can be restored from last night's copy", "Redundancy, a second path that was already in place", "Patching", "Encryption"],
        correctIndex: 1,
        explanation: "Redundancy keeps a second path open for exactly this failure. Backups rebuild something that was lost or destroyed, such as files encrypted by ransomware, which is a different problem from a single link going down.",
      },
      {
        question: "PurveX opens a file share to the entire company so nobody is ever blocked from their own work. What has that decision traded away?",
        options: [
          "Nothing. Availability and confidentiality both improve together",
          "Easier availability, at the cost of the barrier that kept people who should not see that data out",
          "Stronger integrity, because with more people able to open the files, any unwanted change gets spotted and reverted sooner",
          "The CIA triad does not apply to file shares",
        ],
        correctIndex: 1,
        explanation: "The three properties pull against each other. A share open to everyone is never unreachable, but the setup also removes the check that kept the wrong people from reading it, so confidentiality is what paid for that convenience.",
      },
      {
        question: "A client export turns up readable by the whole Operations department. What is the right order to work that finding in?",
        options: [
          "Report the impact first, since that is what management needs to hear, and fill in the vulnerability and threat afterwards",
          "Name the vulnerability (the share is too open), the threat that could use it, which CIA property fails, and then the impact",
          "The CIA property first, since that is the headline of the finding",
          "The order does not matter, as long as all four get mentioned eventually",
        ],
        correctIndex: 1,
        explanation: "The chain runs in one direction: a vulnerability gives a threat a way in, and if it succeeds, a CIA property fails and that produces the impact. Working it in that order, and writing it up that way, is what lets someone else act on your escalation.",
      },
      {
        question: "A flood knocks out the data center. Nobody meant any harm. Does it count as a threat?",
        options: [
          "Yes. A threat is anything that could take advantage of a weakness or cause harm, and intent does not matter",
          "No. A threat has to be a person or group who chooses to attack, so a flood is only bad luck",
          "Only if the flood was caused on purpose by someone with access to the building",
          "No. Natural events belong under availability, which is a separate idea from threats entirely",
        ],
        correctIndex: 0,
        explanation: "The threat list includes attackers, malware, insiders, nation-state groups and natural disasters. A flood is a threat in the same sense as a criminal group. You cannot control either one, which is why your effort goes into the weakness they would use and the damage they could do.",
      },
      {
        question: "A PurveX firewall rule is blocking a port the business needs today, but the team may want the rule back next month. Which command fits?",
        options: [
          "Remove-NetFirewallRule, so the bad rule is gone for good",
          "Disable-NetFirewallRule, which turns the rule off but keeps it",
          "Get-NetFirewallPortFilter, which switches the port back on",
          "Get-FileHash, to prove the rule has not been changed",
        ],
        correctIndex: 1,
        explanation: "Disable-NetFirewallRule turns a rule off without deleting it, so it can be turned back on. Get-NetFirewallPortFilter only shows which port a rule covers, and Get-FileHash fingerprints files, not rules.",
      },
      {
        question: "Overnight, the payroll amounts for six staff were changed. The payroll system still runs, and nobody new has seen the data. Which property failed?",
        options: [
          "Confidentiality, because payroll data is private",
          "Integrity, because the data can no longer be trusted",
          "Availability, because payroll will now run late",
          "None yet, because nothing has stopped working",
        ],
        correctIndex: 1,
        explanation: "That is a lie: the data still looks normal, but it is no longer what it should be. Nothing leaked, so confidentiality held, and the system still runs, so availability held. Integrity failures are the quiet ones, which is why nothing has to stop working for one to be serious.",
      },
      {
        question: "Which of these lowers the damage when an attack gets through, rather than the chance that one does?",
        options: [
          "Turning on MFA for the VPN",
          "Disabling a leftover intern account",
          "Keeping offline backups of the Finance share",
          "Closing an unused port on the domain controller",
        ],
        correctIndex: 2,
        explanation: "Backups reduce impact: if ransomware does get in, the files can be restored. MFA, disabling old accounts and closing ports all close a vulnerability, which lowers the likelihood instead. A security program works on both, because the threat itself can rarely be removed.",
      },
      {
        question: "Jordan saved the SHA-256 hash of the wire file on Friday. On Monday, Get-FileHash returns a different value. What does that prove?",
        options: [
          "The file has changed since Friday",
          "Someone outside Finance has read the file",
          "The file is now infected with malware",
          "Monday's hash was calculated wrongly",
        ],
        correctIndex: 0,
        explanation: "A hash changes completely if even one character of the file changes, so a different value proves the file is not what Jordan saved. It does not say who read it or why it changed. The next step is comparing it line by line with the approved copy.",
      },
    ],
  },
  {
    phaseSlug: "phase-1",
    weekSlug: "week-2",
    questions: [
      {
        question: "A setup script on a shared drive contains the line password: U2VydmljZTIwMjY=. The vendor says the password is encrypted. What is it really, and what does that mean?",
        options: [
          "Encrypted with AES, so it is safe without the key",
          "A SHA-256 hash, so the original password cannot be recovered from the script by anyone",
          "Base64 encoding, so anyone who opens the file can read the password",
          "A salted hash, so it is safe to leave in the script",
        ],
        correctIndex: 2,
        explanation: "Letters, digits and a trailing = with a length that divides by 4 is Base64. Encoding is shorthand, not a lock. There is no key, so anyone can decode it in one step with CyberChef or base64 -d. Treat the password as exposed and report it.",
      },
      {
        question: "Which single question best tells encoding, encryption and hashing apart?",
        options: [
          "How long is the output?",
          "Can you get the original back, and if so, do you need a key?",
          "Which tool produced it?",
          "Does it contain special characters?",
        ],
        correctIndex: 1,
        explanation: "No way back means a hash. A way back that needs a key means encryption. A way back that needs nothing means encoding. Length and character set are clues, but this test decides it.",
      },
      {
        question: "You download an installer from a mirror site. Your SHA-256 matches the value printed on the same mirror's download page. What have you proven?",
        options: [
          "The file is safe to install",
          "The file matches what the mirror says, which proves nothing if the mirror itself was tampered with",
          "The vendor signed the file",
          "The file contains no malware, since a matching SHA-256 means it is byte for byte the file the vendor built and released",
        ],
        correctIndex: 1,
        explanation: "A hash only proves your file matches the reference you compared it to. An attacker who can replace a file on a mirror can replace the hash next to it. Take the reference from the vendor's own site or the IT portal.",
      },
      {
        question: "CCleaner (2017), SolarWinds (2020) and 3CX (2023) all shipped malicious software straight from the vendor, with a valid signature and a hash that matched. Why did those checks not catch them?",
        options: [
          "The customers used MD5 instead of SHA-256",
          "The attackers found a collision in SHA-256, so the bad file produced the same hash as the clean one",
          "The vendor's own build was poisoned, so the published hash was the hash of the bad file",
          "Hashes do not work on installers",
        ],
        correctIndex: 2,
        explanation: "A matching hash proves the file is identical to the reference. When the source itself is compromised, the bad file and the published hash match perfectly. Hashing checks integrity. Whether to trust the source is a separate question.",
      },
      {
        question: "An analyst hashes the text Harbor2026 with echo 'Harbor2026' | sha256sum and gets a different result from CyberChef. What went wrong?",
        options: [
          "CyberChef uses a different version of SHA-256",
          "echo added a line break, and the line break was hashed too",
          "sha256sum hashes in uppercase",
          "The password is too short to hash reliably",
        ],
        correctIndex: 1,
        explanation: "Every byte counts, including an invisible line break at the end. Use printf '%s' in a terminal, and make sure nothing follows the text in CyberChef's Input pane.",
      },
      {
        question: "Sam Whitfield's laptop shows the BitLocker recovery screen after a firmware update. A caller who says they are Sam wants the 48-digit key read out right away. What do you do first?",
        options: [
          "Read the key out so Sam can get back to work",
          "Tell the caller to reinstall Windows",
          "Verify the caller's identity with the approved method, then match the Key ID on screen to the key stored for that device",
          "Email the key to whatever address the caller gives you, so there is a written record of exactly who received it and when",
        ],
        correctIndex: 2,
        explanation: "The recovery key unlocks every file on the drive, so it goes only to a verified user. Match the first 8 characters of the Key ID to the right device in Active Directory or Entra ID, and document who you verified and how.",
      },
      {
        question: "A breached vendor table shows two users with exactly the same value in the password column. What does that tell you?",
        options: [
          "The passwords were stored with a unique salt per user, which is why the two stored values ended up exactly the same",
          "The passwords were stored without a per-user salt, so both users have the same password",
          "The values are encrypted with a random key each time",
          "Nothing, because identical values happen by chance",
        ],
        correctIndex: 1,
        explanation: "A salt makes every stored value unique, even for identical passwords. Matching values mean no salt, or reversible storage without randomness, and they reveal password reuse without cracking anything.",
      },
      {
        question: "Why do password systems use bcrypt or Argon2id instead of plain SHA-256?",
        options: [
          "SHA-256 can be decrypted with the right key",
          "bcrypt and Argon2id produce shorter hashes that are easier to store",
          "They are deliberately slow, so each guess costs an attacker far more time",
          "SHA-256 is not allowed on Windows",
        ],
        correctIndex: 2,
        explanation: "SHA-256 is built to be fast, which is right for checking files and wrong for passwords. One high-end graphics card tries about 22 billion SHA-256 guesses a second, but only about 6,000 against bcrypt at cost 10. The login waits once. The attacker waits on every guess.",
      },
      {
        question: "The Security log shows one or two failed sign-ins (Event ID 4625) on each of 60 different accounts, all from one source, within ten minutes. What is the most likely attack?",
        options: [
          "A brute-force attack on one account",
          "Password spraying: one common password tried across many accounts, staying under the lockout limit",
          "A user who forgot their password",
          "A BitLocker recovery event",
        ],
        correctIndex: 1,
        explanation: "Brute force hammers one account and usually ends in a lockout (4740). Spraying spreads a few guesses across many accounts so no lockout fires. The pattern across accounts is the evidence.",
      },
      {
        question: "A browser and a website use slow public-key math to agree on a fresh AES key for the session. Why not keep using the public-key math for the whole session?",
        options: [
          "Public-key math cannot encrypt data at all, only sign it",
          "Public-key math is much slower, so the fast shared key does the bulk work once the slow method has safely agreed on it",
          "Browsers are not allowed to use asymmetric encryption",
          "AES is only for files on disk, never for network traffic",
        ],
        correctIndex: 1,
        explanation: "One shared key is fast, which is right for a lot of data, while public-key math is slow but solves agreeing on a secret with someone you have never met. HTTPS uses the slow method once to set up the fast one, then the fast method protects everything the session sends.",
      },
      {
        question: "A log shows powershell.exe -enc followed by 400 characters of Base64 on a laptop at 2 AM. Is that command hidden from you, and what is the first step to read it?",
        options: [
          "Yes, Base64 is effectively encryption and cannot be reversed without a key",
          "No. Base64 is encoding, which anyone can reverse. Decode it with From Base64, then Decode text set to UTF-16LE, before judging it",
          "No, but PowerShell's encoded commands use a private format that only Microsoft's own debugging tools can turn back into readable text",
          "Yes, unless the analyst has the attacker's private key",
        ],
        correctIndex: 1,
        explanation: "PowerShell's -EncodedCommand text is UTF-16, so after From Base64 it still needs a UTF-16LE text decode to read cleanly. Decoding it first is what lets you judge whether the actual command is dangerous, rather than reacting to the fact that it was encoded at all.",
      },
      {
        question: "Windows stores the NT hash for a local or domain password. Why does that make it more dangerous than a salted, slow hash like bcrypt?",
        options: [
          "The NT hash is longer than a bcrypt hash, so an attacker who copies one off a machine has far more material to work with",
          "It is fast and unsalted, and a stolen hash can sometimes be used to sign in directly, called pass-the-hash, with no cracking",
          "Windows does not actually hash passwords at all",
          "NT hashes expire automatically after 24 hours",
        ],
        correctIndex: 1,
        explanation: "Fast and unsalted means guessing it is cheap, and pass-the-hash means an attacker does not even need to guess: the hash itself can be presented to sign in. That is why domain controllers and admin accounts are guarded so tightly, and why tools like LAPS give every machine its own local admin password.",
      },
      {
        question: "BitLocker encrypts Sam's laptop drive. Once the laptop has started and Sam is signed in, what does BitLocker still protect against?",
        options: [
          "Malware running under Sam's own sign-in, since BitLocker keeps each file encrypted until the moment Sam personally opens it",
          "A stranger who physically steals the unlocked, running laptop right now",
          "Nothing further this session. Malware running as Sam can read the files exactly as Sam can",
          "Sam forgetting their password",
        ],
        correctIndex: 2,
        explanation: "Encryption at rest, like BitLocker, protects a lost or stolen drive that is powered off or hibernated. It does nothing once the drive is unlocked and a process is running as the signed-in user, which is a job for access control and endpoint security instead.",
      },
      {
        question: "A config file holds the value 507572766558. It uses only the digits 0 to 9 and the letters a to f. Which CyberChef step do you try first?",
        options: [
          "From Base64, since any value without spaces in a config file is usually Base64",
          "From Hex",
          "SHA2 (size 256), because a value that only uses 0 to 9 and a to f is a hash",
          "None. Values made only of numbers are encrypted and need the key",
        ],
        correctIndex: 1,
        explanation: "Only 0 to 9 and a to f is the mark of hex, and From Hex turns 507572766558 into PurveX. A SHA-256 hash is also hex, but it is always 64 characters long, and running SHA2 on a value hashes it rather than reading it.",
      },
      {
        question: "Two staff share an unsalted SHA-256 hash, and a wordlist cracks it as Winter2026. What do you do for those two accounts?",
        options: [
          "Email each of them the cracked password so they know",
          "Force both to change their password at next logon",
          "Nothing, because the leak happened on the vendor's system",
          "Disable both accounts until the vendor responds",
        ],
        correctIndex: 1,
        explanation: "If either person reused Winter2026 at PurveX, an attacker already holds a working company password, so both must change it at their next sign-in. Never email a password, and disabling the accounts stops two people working when a forced change removes the risk.",
      },
    ],
  },
  {
    phaseSlug: "phase-1",
    weekSlug: "week-3",
    questions: [
      {
        question: "A workstation is at 192.168.1.25/24. Which address can it reach directly, without going through its default gateway?",
        options: ["192.168.2.25", "192.168.1.200", "10.0.0.25", "192.169.1.25"],
        correctIndex: 1,
        explanation: "A /24 makes the first three octets the network. 192.168.1.200 shares 192.168.1, so it's on the same subnet. Every other option has a different network part, so that traffic goes through the default gateway.",
      },
      {
        question: "A user can print to the printer down the hall but can't reach any server in another building. ipconfig shows a normal address and the right subnet mask. What do you check next?",
        options: [
          "The default gateway, because a wrong one strands the machine on its own subnet",
          "The printer driver, since printing is the one thing that works and the driver controls the network card",
          "Whether the address starts with 169.254, meaning DHCP failed",
          "The user's password, since servers need a fresh sign-in",
        ],
        correctIndex: 0,
        explanation: "Reaching devices on its own subnet but nothing beyond it is the classic sign of a missing or wrong default gateway. A 169.254 address would have stopped the printer working too.",
      },
      {
        question: "Put the TCP three-way handshake in the correct order.",
        options: ["ACK → SYN → SYN-ACK", "SYN → SYN-ACK → ACK", "SYN-ACK → SYN → ACK", "SYN → ACK → SYN-ACK"],
        correctIndex: 1,
        explanation: "Computer A sends SYN (\"I would like to connect\"). Computer B replies SYN-ACK (\"Understood, I am ready too\"). A replies ACK (\"Good, let us proceed\"). Then real data starts flowing.",
      },
      {
        question: "Outbound traffic on port 3389 appears from a workstation with no business making remote desktop connections. Why is this worth a second look?",
        options: [
          "Port 3389 is always malicious, since no business workstation ever needs a remote desktop connection",
          "Ports like 22 and 3389 mean someone is trying to control a machine, not just browse it",
          "It is normal DNS traffic and can be ignored",
          "It means the firewall is misconfigured",
        ],
        correctIndex: 1,
        explanation: "Ports like SSH (22) and RDP (3389) indicate remote control, not routine browsing. Traffic there from somewhere unexpected is a real flag worth investigating.",
      },
      {
        question: "What does TLS add on top of what TCP already provides?",
        options: [
          "Nothing, since TLS and TCP do the same job",
          "TLS makes sure packets arrive in order, and TCP encrypts them",
          "TCP's handshake sets up the connection, and TLS's handshake then sets up privacy (encryption)",
          "TLS replaces the need for a TCP handshake entirely, since it agrees on the connection and the keys in one step",
        ],
        correctIndex: 2,
        explanation: "These are two separate handshakes, back to back. TCP's three-way handshake establishes the connection. Then TLS does its own handshake to agree on encryption keys before real data moves.",
      },
      {
        question: "A capture shows a packet that reached the destination address, but the host never confirmed receiving it. Which protocol's job failed, IP or TCP?",
        options: [
          "IP, because it is the layer responsible for making sure each packet arrives intact and for resending anything the destination never confirmed",
          "TCP, because IP's only job is a best-effort delivery and TCP is what confirms receipt and resends what goes unacknowledged",
          "Neither. A missing confirmation is always a DNS problem",
          "Both, since IP and TCP do the same job",
        ],
        correctIndex: 1,
        explanation: "IP gets the data there, on a best-effort basis with no promise and no check. TCP is the one that numbers what it sends and waits for confirmation, so a host that received data but never confirmed it is a TCP-level problem, such as a firewall dropping the replies or an overloaded host.",
      },
      {
        question: "An admin opens a remote shell on a Linux server, and separately signs in to a Windows desktop remotely. Which ports match those two actions?",
        options: ["80 for both", "22 for the Linux shell, 3389 for the Windows desktop", "3389 for the Linux shell, 22 for the Windows desktop", "443 for both, since both are encrypted"],
        correctIndex: 1,
        explanation: "SSH (22) is secure remote login, most often to Linux and network gear. RDP (3389) is Windows remote desktop. Both exist to let someone control a machine rather than just fetch something from it, which is exactly why attackers reach for them once they have a foothold.",
      },
      {
        question: "Which of these ports is normal to see traffic on from a Windows domain controller?",
        options: ["23 (Telnet)", "88 (Kerberos)", "6667 (IRC)", "3306, if PurveX does not run MySQL"],
        correctIndex: 1,
        explanation: "Kerberos on 88 is how a domain controller issues sign-in tickets, so it is expected traffic on a DC, alongside LDAP (389/636), SMB (445) and the Global Catalog (3268/3269). Telnet, IRC and a database port nobody runs are the kind of thing that stands out once you know the normal list.",
      },
      {
        question: "Why do analysts treat DNS logs as one of the most valuable records they have, even though the logs are incomplete?",
        options: [
          "DNS logs capture every byte of every conversation, encrypted or not, so nothing a machine sends ever goes unrecorded",
          "Almost every connection starts with a lookup, so they show what a machine tried to reach, even attempts that failed",
          "DNS never misses anything, unlike every other log source",
          "DNS logs are the only place IP addresses appear",
        ],
        correctIndex: 1,
        explanation: "A device has to look up a name before it can reach it, so DNS logs are an early, broad record of intent, including failed and never-completed attempts. They are not complete, since cached answers, direct IP connections and DoH (encrypted DNS) never show up there, but a lookup for a name with no business reason is often the earliest sign something is wrong.",
      },
      {
        question: "A workstation's address starts with 169.254.x.x. What does that tell you?",
        options: [
          "The address was assigned normally by DHCP",
          "The device asked for a DHCP address and nobody answered, which points to a network fault",
          "The machine is a domain controller, since those use the 169.254 range so clients can always find them",
          "The address is reserved for Kerberos traffic",
        ],
        correctIndex: 1,
        explanation: "DHCP is almost universal, so an address in the 169.254 range is the exception that matters: the device requested one and got no answer, which is a DHCP or network problem worth chasing down.",
      },
      {
        question: "SMTP traffic is seen leaving a workstation that has no reason to send mail. Why does that deserve a second look?",
        options: [
          "SMTP from a workstation is always a false positive",
          "Workstations normally hand mail to the mail server, so one sending SMTP straight out is unusual and a common sign of a spam bot",
          "SMTP only runs on domain controllers",
          "It does not, because SMTP traffic is always encrypted end to end and so cannot carry spam or stolen data out of the network",
        ],
        correctIndex: 1,
        explanation: "Only a short list of machines, mainly mail servers, has a reason to send mail straight out over SMTP. A workstation doing it is worth following up, because spam and phishing sent from a compromised host is one of the most common things an attacker does with it.",
      },
      {
        question: "You capture an HTTPS session in Wireshark. You cannot read the page content or the password typed into a form. What can you still see?",
        options: [
          "Nothing at all. TLS hides the entire conversation",
          "Which two machines talked, the ports used, how much data moved and in which direction, that a TLS handshake happened, and in most cases the site name requested",
          "Only the IP addresses, with no other detail",
          "The full page content, just not the password field",
        ],
        correctIndex: 1,
        explanation: "TLS hides the payload, not the surrounding facts. The two endpoints, the ports, the timing and volume of data, and in most connections the site name sent before encryption starts, are all still visible, and that outside information is usually enough to decide whether a conversation belongs.",
      },
      {
        question: "Nmap reports port 445 as filtered on one server and closed on another. What is the difference?",
        options: [
          "Closed means a firewall dropped the probe, and filtered means nothing is listening",
          "Filtered means nothing answered at all, usually a firewall. Closed means the machine answered but nothing is listening",
          "They mean the same thing, and Nmap uses both words interchangeably",
          "Filtered means the service is running but needs a password, while closed means it is turned off",
        ],
        correctIndex: 1,
        explanation: "Open means a service answered. Closed means the machine answered but nothing is listening on that port. Filtered means Nmap could not tell, usually because a firewall dropped the probe so no answer came back at all.",
      },
      {
        question: "Two programs on the domain controller talk to each other, but a Wireshark capture on the network adapter shows nothing between them. Why?",
        options: [
          "The traffic is encrypted, so Wireshark hides it completely",
          "Wireshark cannot see traffic that uses a port below 1024",
          "Traffic between programs on the same machine never touches the network card, so you capture on the loopback adapter instead",
          "The programs must be using UDP, which Wireshark does not record",
        ],
        correctIndex: 2,
        explanation: "Traffic that stays on one machine never reaches the network adapter. To see it, capture on Adapter for loopback traffic capture. Encrypted traffic still shows up in a capture, just with an unreadable payload.",
      },
      {
        question: "An Nmap scan of the domain controller shows ports 53, 88, 135, 389, 445, 3389 and 23 open. Which one should not be there?",
        options: [
          "53, DNS",
          "88, Kerberos",
          "23, Telnet",
          "445, SMB",
        ],
        correctIndex: 2,
        explanation: "DNS, Kerberos, RPC, LDAP, SMB and Remote Desktop are normal on a domain controller. Telnet sends everything, passwords included, in plain text and has no place on one, so it is the port to trace back to whoever opened it.",
      },
      {
        question: "A job on web01 signs in to the domain controller over port 389 with a simple bind every few minutes. Why is that a problem, and what fixes it?",
        options: [
          "Port 389 is closed on most domain controllers, so open it in the firewall",
          "The bind goes in clear text on 389, so anyone capturing it reads the password. Move it to LDAPS on 636",
          "Simple binds lock the account after a few tries, so switch the job to an anonymous bind",
          "LDAP is only for Windows clients, so web01 should use SMB on 445 to sign in",
        ],
        correctIndex: 1,
        explanation: "A simple bind on plain LDAP sends the account name and password unencrypted, so a capture on the network reads them straight off the wire. LDAPS wraps the same conversation in TLS on port 636. Opening ports or switching protocols does nothing about a password crossing the network in the clear.",
      },
    ],
  },
  {
    phaseSlug: "phase-1",
    weekSlug: "week-4",
    questions: [
      {
        question: "A request to a client portal includes role=user. Changing it to role=admin opens the admin pages. What is the root cause?",
        options: [
          "The admin account had a weak password",
          "The server trusted a role value sent by the client",
          "The connection was not using HTTPS",
          "The user's session cookie had expired",
        ],
        correctIndex: 1,
        explanation: "The server should take the role from its own records for the session, never from the request. Anything the browser sends can be changed with developer tools or a proxy, which is called parameter tampering.",
      },
      {
        question: "A developer says the admin page is safe because its link only appears in the menu for admins. What would you check?",
        options: [
          "Whether the admin page loads over HTTPS",
          "Whether the server refuses the page when an ordinary user requests it",
          "Whether the menu item is hidden with CSS or removed from the page entirely",
          "Whether every admin has MFA turned on",
        ],
        correctIndex: 1,
        explanation: "Hiding a link changes what a user is invited to do, not what the server will do. On a system you are allowed to test, sign in as an ordinary user, type the admin address directly and expect a 403. If the page loads, the hidden link was the only protection.",
      },
      {
        question: "Auditors want to know how many times someone failed to sign in to frontdesk.shared. Where do you look?",
        options: [
          "The Security log, filtered to event 4625 for that account",
          "The account's Member Of tab in Active Directory",
          "The System log on the domain controller, filtered to event 4624",
          "The account's Description field",
        ],
        correctIndex: 0,
        explanation: "Event 4625 is a failed sign-in and lives in the Security log. Filter Current Log to 4625, then find the account name, or count it with Get-WinEvent. 4624 records successful sign-ins, and the System log does not hold sign-in events.",
      },
      {
        question: "Jamie Torres reports about fifteen sign-in approval prompts in ten minutes that Jamie did not start. What does this most likely mean?",
        options: [
          "The authenticator app is broken and needs reinstalling, since it is sending prompts Jamie never asked for",
          "Someone already has Jamie's password and is trying to get past MFA by flooding prompts",
          "Jamie's account is locked out",
          "Nothing, as long as Jamie approves only one",
        ],
        correctIndex: 1,
        explanation: "In a normal password-then-MFA sign-in, the push prompt only fires after the password is accepted, so unrequested prompts mean the password is known. Jamie denies everything, the password is reset through the verified process, and security is told. Uber was breached in 2022 when a flooded user finally approved one.",
      },
      {
        question: "A caller says they are Jordan Ellis from Finance and needs their MFA moved to a new phone before a meeting in ten minutes. Caller ID shows Jordan's name. What do you do?",
        options: [
          "Move the MFA, because caller ID matches",
          "Move the MFA, because the meeting is in ten minutes",
          "Verify through the approved method, such as a callback to the number on file, before changing anything",
          "Disable Jordan's account",
        ],
        correctIndex: 2,
        explanation: "An MFA change hands over the second factor, so it gets the same check as a password reset or stronger. Caller ID can be faked, and urgency is the pressure attackers use. That is how MGM Resorts' help desk was reportedly talked into an MFA reset in 2023.",
      },
      {
        question: "Taylor Osei moved from Operations to Compliance and asks for Compliance share access. The account is still in Operations Users. What is the right change?",
        options: [
          "Add Compliance Users and leave everything else",
          "Add Taylor to IT Admins so they can fix their own access",
          "With the new manager's approval, add Compliance Users and remove Operations Users in the same change",
          "Give Taylor's account permissions on the Compliance folder directly",
        ],
        correctIndex: 2,
        explanation: "Least privilege means access for the current job only. Keeping old groups after a move is privilege creep. Permissions go through groups, not individual accounts, and the change is approved and recorded.",
      },
      {
        question: "Changing a document number in a web address shows another customer's records. What kind of flaw is this?",
        options: [
          "An authentication failure, because the password was weak",
          "An insecure direct object reference, a form of broken access control, because the server never checked who owns the document",
          "An encryption failure",
          "Not a flaw, because the user was signed in",
        ],
        correctIndex: 1,
        explanation: "Signing in answers who you are. It does not answer whether you may see this item. First American Financial exposed about 885 million documents in 2019 this way. The fix is a server-side ownership check on every request.",
      },
      {
        question: "Rank these MFA methods from most to least resistant to phishing: a text message code, push approval with number matching, and a FIDO2 security key.",
        options: [
          "Text message, then push with number matching, then the security key",
          "The security key is strongest, because it checks the site's real address so a fake page gets nothing. Push with number matching is next, since a blind approval fails. A text code is weakest, open to phishing and SIM swapping",
          "All three give exactly the same protection",
          "A text code is strongest, since it goes to a physical device",
        ],
        correctIndex: 1,
        explanation: "Security keys and passkeys are phishing-resistant because the key itself verifies the site before it responds. Number matching defeats blind push approval, the mistake that let attackers into Uber in 2022. A text or voice code is weakest, vulnerable to phishing and to an attacker moving the number to their own SIM.",
      },
      {
        question: "Riley's account shows up locked out, while Kai's account shows as disabled after their contract ended. What is the right fix for each?",
        options: [
          "Reset both passwords",
          "Unlock Riley's account since the password itself is still right, but Kai's account needs a decision from whoever disabled it, not a reset",
          "Disable Riley's account too, to be safe",
          "Both need the same fix: unlock and reset",
        ],
        correctIndex: 1,
        explanation: "A locked account only needs unlocking once you have checked the failed attempts came from the user, since the password never changed. A disabled account was turned off on purpose, usually because someone left or is under investigation, so re-enabling it without checking why defeats the reason it was disabled in the first place.",
      },
      {
        question: "A Security log shows event 4624 with logon type 10 for an account, and a separate 4625 with Sub Status 0xC0000064. What does each one tell you?",
        options: [
          "4624/10 is a failed Remote Desktop sign-in, and 0xC0000064 means the password was wrong",
          "4624/10 is a successful Remote Desktop sign-in, and 0xC0000064 on the 4625 means the username does not exist, which suggests someone guessing account names",
          "Both events describe the same successful sign-in",
          "4624 and 4625 are both failed sign-in events",
        ],
        correctIndex: 1,
        explanation: "4624 is a successful sign-in, and logon type 10 means it came in over Remote Desktop. 4625 is a failed sign-in, and its Status and Sub Status codes explain why. A Sub Status of 0xC0000064 is an account name that does not exist at all, 0xC000006A is a real account with the wrong password, and a Status of 0xC0000234 means the account was locked out.",
      },
      {
        question: "Jordan can enter a wire transfer, but a separate person has to approve it before it goes out. Which principle is this, and how is it different from least privilege?",
        options: [
          "Least privilege, since Jordan has limited access",
          "Separation of duties: no single person controls a sensitive process end to end, which is a different protection from least privilege limiting what one account can reach on its own",
          "Need to know, since the approver only sees this one wire",
          "There is no meaningful difference between the two principles",
        ],
        correctIndex: 1,
        explanation: "Least privilege limits what one account can reach. Separation of duties limits what one person can do alone, even within their own access, so that fraud or a serious mistake takes two people acting together rather than one. Need to know is a third, related idea: access to specific data only while a task actually requires it.",
      },
      {
        question: "The domain controller confirms Jordan's password. Jordan then tries to open the Compliance share. Which idea decides whether that works?",
        options: [
          "Authentication, since a confirmed password proves Jordan is allowed to open the share",
          "Authorization, which uses Jordan's groups to decide what Jordan may reach, enforced on that request by access control",
          "Accounting, because the Security log records the attempt",
          "None of them. Once Jordan is signed in, every share on the domain is open",
        ],
        correctIndex: 1,
        explanation: "Authentication proves who Jordan is, at the front door. Authorization decides what that identity may reach, and groups do that job. Access control enforces the decision on every request, not just once at sign-in. A correct password says nothing about the Compliance share.",
      },
      {
        question: "For the access review you need every group taylor.osei belongs to. Which command answers that?",
        options: [
          "Get-ADGroupMember taylor.osei",
          "Get-ADPrincipalGroupMembership taylor.osei",
          "Get-WinEvent filtered for event 4624",
          "Disable-ADAccount taylor.osei, then read what it removed",
        ],
        correctIndex: 1,
        explanation: "Get-ADPrincipalGroupMembership lists every group one user belongs to. Get-ADGroupMember goes the other way and lists everyone in a group. Disable-ADAccount stops an account signing in and changes nothing about its groups.",
      },
    ],
  },
  {
    // Everything here used to be filed under home-lab-desk, which actually
    // teaches finding, unlocking, moving and reading an account -- none of
    // which this tests. These five questions are about the org chart, the
    // access-level table and the roster, which belong here instead.
    phaseSlug: "phase-1",
    weekSlug: "home-lab-setup",
    questions: [
      {
        question: "PurveX Financial splits administrative access into three levels instead of one. What is the point of the split?",
        options: [
          "One all-powerful admin account, for simplicity",
          "Three levels, so a compromised login at one level cannot automatically reach the levels above it",
          "Two levels, admin and everyone else, since a split any finer only slows the help desk down without stopping an attacker",
          "Five levels, one per department",
        ],
        correctIndex: 1,
        explanation: "Level 1 (Domain Admin) controls the domain controller and Active Directory itself. Level 2 (Server Admin) controls servers. Level 3 (Helpdesk) touches only workstations, password resets and local support. A Level 3 login doing a Level 1 action does not match this table, and that split is how far a compromise is supposed to stop.",
      },
      {
        question: "Why are Wealth Management, Compliance, and Finance and Accounting flagged as critical departments while IT and Operations are not?",
        options: [
          "They have more employees, and the more people a department has, the more accounts an attacker has to choose from",
          "They touch regulated data, client financial records or the firm's own financial systems",
          "They are located in a different building",
          "Critical status is assigned randomly for the lab",
        ],
        correctIndex: 1,
        explanation: "Critical is about the data at stake: PII, account and portfolio data, GLBA and SOX material, or the firm's own finances. IT has elevated system access, but it does not hold that regulated or client data. Size the ticket against the data, not against the job title.",
      },
      {
        question: "A ticket names a person. The org chart, the directory folder and the directory group should all agree. If two of the three disagree, what should you do?",
        options: [
          "Change whichever one is easiest to fix so the three match again, then note the change in the ticket",
          "Stop before changing anything, and find out why the three disagree",
          "Trust the directory folder and ignore the other two",
          "Close the ticket, since a mismatch means it is invalid",
        ],
        correctIndex: 1,
        explanation: "The chart tells you how things should be, and the directory shows you how they are right now. A mismatch between department, folder and group is worth understanding before you act on it, not something to paper over by picking one.",
      },
      {
        question: "PurveX has three access levels but only two custom access-level groups, Server Admins and Helpdesk. Why is there no third group for Domain Admin?",
        options: [
          "Domain Admin access was left out of the build by mistake",
          "Level 1 uses the built-in Domain Admins group, so the build has no need to create a third",
          "Domain Admin does not require group membership",
          "There are actually three groups, and the count in The Environment is wrong",
        ],
        correctIndex: 1,
        explanation: "Windows already ships a built-in Domain Admins group with full control of the domain, so PurveX's build reuses it for Level 1 rather than creating a duplicate. If your lab's count ever differs from The Environment tab, check the build before trusting a ticket answer.",
      },
      {
        question: "A spreadsheet of client names, dates of birth and Social Security numbers turns up on a share it should not be on. Which data category is at risk, and which departments primarily handle it?",
        options: [
          "Internal financial records, handled by Finance and Accounting",
          "Personal identifying information, handled primarily by Wealth Management and Compliance",
          "System and access logs, handled by IT",
          "Estate and trust documentation, handled by Operations",
        ],
        correctIndex: 1,
        explanation: "Names, dates of birth and Social Security numbers are personal identifying information, the category Wealth Management and Compliance primarily handle. Naming the data category, not just saying a file was exposed, is what lets you size how urgent a finding actually is.",
      },
      {
        question: "A user is locked out and you want to know which machine the bad attempts came from. Which of the directory's three jobs gives you that?",
        options: [
          "Authentication, since Kerberos checked each attempt",
          "Authorization, since groups decide what an account may open",
          "Accounting, the record of each attempt",
          "None. The domain controller keeps no record of failed sign-ins",
        ],
        correctIndex: 2,
        explanation: "Authentication checks who is signing in, and authorization decides what they may open. Accounting is the record of each attempt, which is what lets you check a lockout or a sign-in from the wrong place.",
      },
      {
        question: "While promoting the server you are asked for a DSRM password. What is it for?",
        options: [
          "It becomes the Administrator password for the new domain",
          "Signing in to the domain controller in Directory Services Restore Mode, a recovery mode, and not for any user account",
          "It is the default password every new user account will start with",
          "It encrypts the Active Directory database so a stolen copy cannot be read by anyone",
        ],
        correctIndex: 1,
        explanation: "The DSRM password is only used to sign in to the domain controller in Directory Services Restore Mode, a recovery mode used when Active Directory itself needs repair. It is not the domain Administrator password or a starting password for accounts.",
      },
      {
        question: "Build-Environment.ps1 finishes and reports success. What should you do before working any ticket?",
        options: [
          "Nothing. A script that reports success has built everything correctly",
          "Run it a second time, so any objects it missed get created on the second pass",
          "Confirm the 5 departments, the 9 users with the right titles, and alex.rivera in both IT Users and IT Admins",
          "Delete old.intern, kai.mendes and noah.kim, since they are not part of the baseline",
        ],
        correctIndex: 2,
        explanation: "A script saying it finished is not the same as the lab being right, so check the directory against The Environment tab. The extra accounts are Ticket Queue objects, so you leave them alone until you reach those tickets.",
      },
      {
        question: "Priya Nair's title is Help Desk Technician. A ticket assumes Priya has Helpdesk access. What does the directory actually show?",
        options: [
          "Priya is in Helpdesk, because a title always matches the access group",
          "Priya is in IT Users, not Helpdesk, so you read Member Of rather than guessing access from a title",
          "Priya is in IT Admins, the same as Alex Rivera",
          "Priya has no groups until the Helpdesk ticket is approved",
        ],
        correctIndex: 1,
        explanation: "A title is not a group. In the baseline Priya sits in IT Users only, and Helpdesk is empty. When a ticket names a person, read the account's Member Of list rather than inferring access from the job title.",
      },
      {
        question: "The workstation cannot find the domain controller even though both VMs are running. What should you check in VMware first?",
        options: [
          "That both VMs use the same virtual network, such as VMnet8 (NAT)",
          "That the server VM was given more memory than the workstation",
          "That Easy Install chose the same edition and settings for both VMs",
          "That the workstation runs Windows 10 Home rather than Pro",
        ],
        correctIndex: 0,
        explanation: "Every VM in the lab has to sit on the same virtual network, or the workstation has no route to the domain controller. Memory affects speed, not reachability, and Windows 10 Home cannot join a domain at all.",
      },
    ],
  },
  {
    phaseSlug: "phase-1",
    weekSlug: "home-lab-directory",
    questions: [
      {
        question: "Alex Rivera and Priya Nair both live in the IT folder, but only Alex is also in IT Admins. Why does that matter when investigating an alert?",
        options: [
          "It does not, since every account in the directory is equally likely to be compromised and should get exactly the same scrutiny in any alert",
          "His wider access means a bigger blast radius if the account is compromised, so unusual activity from it deserves extra scrutiny",
          "It means Alex Rivera's account is fake",
          "IT Admins membership is a data entry error in the lab",
        ],
        correctIndex: 1,
        explanation: "Alex sits in both IT Users and IT Admins, so his account can do more than Priya's from the same folder. You need that baseline before you weigh an alert on him. An account's OU tells you where it lives, and its groups tell you what it can do, so check both.",
      },
      {
        question: "What is the real difference between an Organizational Unit and a Container in Active Directory?",
        options: [
          "There is no difference. Both are just folders",
          "A Container can have Group Policy linked to it, while an OU is only a label for sorting accounts in the console",
          "An OU can have Group Policy linked to it. A Container cannot",
          "OUs only hold computers, and Containers only hold users",
        ],
        correctIndex: 2,
        explanation: "They look the same in the console, both using a folder icon, but a Container is a different kind of object. A GPO can link to an OU but not to the built-in Users and Computers Containers, and OUs are also where delegation of control is designed to happen, which is why the build script puts every account in a real OU instead.",
      },
      {
        question: "An account has a folder (OU) and a Member Of tab. Which one tells you where it lives, and which tells you what it can reach?",
        options: [
          "The folder (OU) tells you what it can reach, and Member Of tells you where it lives",
          "The folder (OU) tells you where it lives, and Member Of tells you what it can reach",
          "Both answer the same question",
          "Neither. Only PowerShell can answer either question",
        ],
        correctIndex: 1,
        explanation: "An account sits in exactly one folder, which records where it lives, while it can sit in any number of groups, which is what grants permissions. So when a ticket names a person, check the folder and then Member Of, because a title on the account is not the same as either one.",
      },
      {
        question: "The AccessLevels OU, holding Server Admins and Helpdesk, sits outside the Departments OU. Why keep it separate rather than putting those groups inside a department?",
        options: [
          "It is just a cosmetic choice. Active Directory treats every OU the same way, so where a group sits has no effect on anything at all",
          "Server Admins and Helpdesk grant access across the whole domain, so keeping them apart stops you mistaking privileges for a team",
          "Groups cannot exist inside a Departments OU at all",
          "AccessLevels is actually a Container, not an OU",
        ],
        correctIndex: 1,
        explanation: "An OU records where an account lives, not what it can access. Server Admins and Helpdesk are domain-wide privileges rather than a department roster, so filing them in their own OU keeps that distinction visible instead of burying domain-wide access inside one department's folder.",
      },
      {
        question: "PurveX names its service account svc-backup-job, sets its password to never expire, and restricts its logon hours to the overnight backup window. Which of these would be a red flag during a review?",
        options: [
          "The account lives in OU=ServiceAccounts",
          "The account's Description names the job it runs, which tells an attacker exactly what the account can be used for",
          "The account is a member of IT Users and can sign in to a desktop interactively",
          "The account's Logon Hours match its backup window",
        ],
        correctIndex: 2,
        explanation: "A service account should do its one job and nothing else. Membership in a people group and the ability to sign in interactively both mean it can do things no backup job ever needs to do, which is exactly the kind of over-privileged service account a review should catch.",
      },
      {
        question: "A screen-lock GPO is linked to OU=IT. Will it reach an account that lives in the Finance and Accounting OU?",
        options: [
          "Yes, GPOs apply to the whole domain regardless of where they are linked",
          "No, a GPO only reaches what it is linked to or nested beneath, and Finance and Accounting is a separate OU",
          "Yes, because all departments share the same screen-lock policy",
          "It depends on which security group the account is in, not which OU it is in, since GPOs are applied through group membership",
        ],
        correctIndex: 1,
        explanation: "A GPO can link to a Site, a Domain or an OU, and it only reaches objects inside that link. An account in a different OU gets nothing from a GPO linked elsewhere, which is why checking where an object actually lives comes before blaming the policy.",
      },
      {
        question: "A workstation will not join purvexfinancial.local and says the domain cannot be contacted. What do you check first?",
        options: [
          "The workstation's DNS server, which must point at the domain controller's IP address",
          "Whether the workstation has the newest Windows updates installed",
          "That the user typed the domain name in capital letters",
          "Whether IT-WKS01 has been moved into the Computers container first, so the join can find a place to land",
        ],
        correctIndex: 0,
        explanation: "A workstation finds the domain through DNS, so its DNS server has to be the domain controller. A wrong DNS address is the most common reason a join fails. Capitalization does not matter in a domain name.",
      },
      {
        question: "In the baseline, IT-WKS01 lives under OU=Workstations,OU=IT. It turns up under the Operations department instead. What is that?",
        options: [
          "Normal. Computer objects move between departments on their own as people use them",
          "A finding, because the baseline has one workstation in the IT Workstations folder, so it should be explained before anyone acts",
          "A harmless display issue in Active Directory Users and Computers",
          "Proof the workstation has been compromised, so it must be wiped right away",
        ],
        correctIndex: 1,
        explanation: "IT-WKS01 is the only client workstation, and it belongs under IT. If it turns up under another department, that is a finding to explain, the same as a user in the wrong folder. It does not prove a compromise.",
      },
      {
        question: "A new hire was created in the default Users folder instead of IT, Users. What will the account be missing?",
        options: [
          "Every Group Policy linked to the IT OU, such as its screen lock",
          "A password, because Windows does not set one in that folder",
          "A mailbox, because only an OU can hold one",
          "Nothing, because the folder does not affect an account",
        ],
        correctIndex: 0,
        explanation: "CN=Users is a Container, and no GPO can be linked to a Container, so the account only gets domain-wide policy. Move it into the department's Users OU so IT's settings reach it.",
      },
      {
        question: "Helpdesk should reset passwords for Compliance staff and nobody else. Where do you grant that permission?",
        options: [
          "On the Compliance Users group",
          "On the OU that holds Compliance's user accounts",
          "On the domain, so it covers every account",
          "On each Helpdesk member's own account",
        ],
        correctIndex: 1,
        explanation: "Delegation attaches to the folder the accounts live in, so granting it on OU=Users,OU=Compliance,OU=Departments covers exactly those accounts. Granting it on the domain would let Helpdesk reset administrators too, one of an attacker's quickest routes to taking over a domain.",
      },
    ],
  },
  {
    // find-an-account.md, unlock-or-reset.md, move-an-account.md and
    // read-the-account.md: the four jobs this entry actually teaches.
    phaseSlug: "phase-1",
    weekSlug: "home-lab-desk",
    questions: [
      {
        question: "A ticket names IT-WKS01 instead of a person. In the Find dialog, which option do you pick?",
        options: ["Users, Contacts, and Groups", "Computers", "Organizational Units", "Printers"],
        correctIndex: 1,
        explanation: "Find lets you search by what kind of object you are looking for. A person is Users, Contacts, and Groups. A machine, like IT-WKS01, is Computers. Finding the object is only the start, since you still read its folder and then its Member Of tab once it is open.",
      },
      {
        question: "Riley calls in locked out. They say they still remember their password, but mistyped it several times in a row. What is the right fix?",
        options: [
          "Reset her password and force a change at next logon, so the lockout counter starts over",
          "Check Unlock account on the Account tab. The password stays the same",
          "Disable the account until she calls back",
          "Add her to a different group",
        ],
        correctIndex: 1,
        explanation: "A locked account and a forgotten password are different problems with different fixes. If she still knows the password, unlocking it is enough. Resetting a password she still remembers would be the wrong fix, and would hand her a temporary password to manage for no reason.",
      },
      {
        question: "Taylor Osei is moving from Operations to Compliance. You move the account to OU=Users,OU=Compliance,OU=Departments and update the job title. Is the transfer finished?",
        options: [
          "Yes. Once the account is in the new OU, the Compliance group policy and the Compliance share access both come with it",
          "No. Compliance Users must be added and Operations Users removed in the same change, or the old access rides along",
          "Yes, as long as the title field says Compliance",
          "No, the account also needs to be deleted and recreated",
        ],
        correctIndex: 1,
        explanation: "The OU sets location and policy, not access. A transfer is only finished when both the folder and Member Of match the new job, which means adding the new department's group and removing the old one in the same change, not a separate ticket raised later.",
      },
      {
        question: "You turn on View → Advanced Features in Active Directory Users and Computers to open the Attribute Editor. Which raw attribute tells you when a password was last changed, and what is one catch when reading a sign-in time?",
        options: [
          "whenCreated tells you the last password change, and lastLogon never lags",
          "pwdLastSet tells you the last password change. lastLogon is kept separately per domain controller, while lastLogonTimestamp is shared but can lag by up to 14 days",
          "memberOf tells you the last password change, and there is no catch with sign-in times",
          "The friendly Account tab already shows all of this, so the Attribute Editor is never needed",
        ],
        correctIndex: 1,
        explanation: "pwdLastSet, whenCreated and memberOf are the attributes worth knowing for an investigation, and pwdLastSet is the one that answers whether a password reset actually happened. lastLogon is per-DC and not synced, while lastLogonTimestamp is shared across DCs but can be up to 14 days stale, so neither one alone gives you a precise answer.",
      },
      {
        question: "Maya forgot her temporary password on her first day. What do you do?",
        options: [
          "Unlock the account and leave the password exactly as HR set it",
          "Reset the password and tick User must change password at next logon",
          "Read her the original temporary password again",
          "Enable the account so she can sign in",
        ],
        correctIndex: 1,
        explanation: "Unlocking only helps someone who still knows the password, and Maya does not. Reset it and force a change at next sign-in, because a temporary password has been seen by at least two people.",
      },
      {
        question: "You open IT-WKS01 from the Find results, but the Attribute Editor tab is missing. Why?",
        options: [
          "Objects opened from Find do not show it, so open it from the tree",
          "The computer object has been disabled since it was created",
          "Advanced Features only adds tabs to user accounts, not computers",
          "Computer objects do not have any raw attributes to show",
        ],
        correctIndex: 0,
        explanation: "This is a known quirk of Active Directory Users and Computers. With Advanced Features on, browse to the object in the tree and open it there, or read the same values with Get-ADComputer.",
      },
      {
        question: "A manager asks about \"the settlements coordinator\" but does not know the username. How do you find the account?",
        options: [
          "Use Find, open the Advanced tab and search the Job Title field",
          "Guess the username from the department's name",
          "Read the Members tab of Operations Users one by one",
          "Ask the manager to raise a new ticket with the username",
        ],
        correctIndex: 0,
        explanation: "Find can search by Job Title on its Advanced tab, which turns a description of a job into an account. Confirm the name with the caller before you change anything.",
      },
      {
        question: "After fixing Maya's account under ticket DESK-2001, what should you record, and where?",
        options: [
          "What changed and the ticket number, in the account's Description",
          "Nothing, because the ticket system keeps its own record",
          "The new temporary password, in the account's Description",
          "The change, in a note saved on your own desktop",
        ],
        correctIndex: 0,
        explanation: "A Description that names the ticket turns the account into its own record, so the next technician can see what changed and where to read more. Never write a password into any field.",
      },
    ],
  },
];

export function findQuiz(phaseSlug: string, weekSlug: string): Quiz | undefined {
  return quizzes.find((q) => q.phaseSlug === phaseSlug && q.weekSlug === weekSlug);
}
