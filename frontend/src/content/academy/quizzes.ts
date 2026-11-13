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
          "A vulnerability only ever applies to software, while a threat only ever applies to people",
        ],
        correctIndex: 1,
        explanation: "A vulnerability is the weakness. A threat is what could exploit it. Risk exists only when both are present.",
      },
      {
        question: "The formula is Risk = Threat × Vulnerability × Impact. A server has a known critical vulnerability, but suppose no threat could ever reach it. Under the formula, what is the risk?",
        options: ["Still critical, because risk is scored from how severe the flaw itself is, whoever can reach it", "Zero, because no threat means no risk, regardless of the vulnerability", "Impossible to say until you add a likelihood value", "Moderate, since an unreachable flaw still counts for half"],
        correctIndex: 1,
        explanation: "The lesson's own rule is that no threat means no risk, even if the vulnerability exists. Risk requires a realistic path for a threat to reach and exploit the vulnerability. Real servers rarely get there. Even an air-gapped machine is reached by USB drives and insiders, so an air gap lowers the threat rather than removing it.",
      },
      {
        question: "Which of these is a control for integrity rather than confidentiality?",
        options: ["Access control lists on the folder", "Encrypting the file while it is stored", "Digital signatures and checksums", "A need-to-know policy for the data"],
        correctIndex: 2,
        explanation: "Signatures and checksums show whether data was changed, which is integrity. Encryption, access lists and need-to-know policies control who can see data, which is confidentiality.",
      },
      {
        question: "A vulnerability scan comes back with 200 findings on PurveX's servers. What is the right way to work through that list?",
        options: [
          "Fix all 200 in report order, since any of them could be used",
          "Ask whether a threat can reach each one and what it would cost, then rank by that",
          "Set it aside until an alert shows one is being attacked",
          "Rank them by the scanner's severity score alone, then work down from the most critical one",
        ],
        correctIndex: 1,
        explanation: "A weakness nothing can reach is not a problem yet. For every finding, the question is whether a real threat can get to it and what the damage would be, not how alarming it sounds on its own.",
      },
      {
        question: "The office's only internet link fails at 9 AM, and nobody can reach the file shares. Which availability control gets PurveX working again fastest?",
        options: ["Backups, restored to a server that can still be reached", "Redundancy, a second path that was already in place", "Patching the router so the link stops failing", "Encryption on the link so traffic stays protected"],
        correctIndex: 1,
        explanation: "Redundancy keeps a second path open for exactly this failure. Backups rebuild something that was lost or destroyed, such as ransomware'd files, which is a different problem from a single link going down.",
      },
      {
        question: "PurveX opens a file share to the entire company so nobody is ever blocked from their own work. What has that decision traded away?",
        options: [
          "Nothing, since availability and confidentiality both improve",
          "Confidentiality, because the barrier that kept the wrong people out is gone",
          "Availability, because more people now compete for the same files at the same time",
          "Nothing, since the CIA triad does not apply to internal shares",
        ],
        correctIndex: 1,
        explanation: "The three properties pull against each other. A share open to everyone is never unreachable, but the setup also removes the check that kept the wrong people from reading it, so confidentiality is what paid for that convenience.",
      },
      {
        question: "A client export turns up readable by the whole Operations department. What is the right order to work that finding in?",
        options: [
          "Impact, then the CIA property, then the threat, then the vulnerability",
          "Vulnerability, then the threat, then the CIA property that fails, then the impact",
          "The CIA property that fails, then the impact, then the vulnerability, then the threat",
          "Threat, then the impact, then the vulnerability, then the CIA property",
        ],
        correctIndex: 1,
        explanation: "The chain runs in one direction: a vulnerability gives a threat a way in, and if it succeeds, a CIA property fails and that produces the impact. Working it in that order, and writing it up that way, is what lets someone else act on your escalation.",
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
          "AES encryption, so the password is safe for as long as the key stays secret",
          "A SHA-256 hash, so the original password cannot be recovered",
          "Base64 encoding, so anyone who opens the file can read the password",
          "A salted hash, so it is safe to leave in the script as it is",
        ],
        correctIndex: 2,
        explanation: "Letters, digits and a trailing = with a length that divides by 4 is Base64. Encoding is shorthand, not a lock. There is no key, so anyone can decode it in one step with CyberChef or base64 -d. Treat the password as exposed and report it.",
      },
      {
        question: "Which single question best tells encoding, encryption and hashing apart?",
        options: [
          "How long is the output compared with the input?",
          "Can you get the original back, and if so, do you need a key?",
          "Which tool or program produced the output?",
          "Does the output contain symbols like = or +, or only letters and digits?",
        ],
        correctIndex: 1,
        explanation: "No way back means a hash. A way back that needs a key means encryption. A way back that needs nothing means encoding. Length and character set are clues, but this test decides it.",
      },
      {
        question: "You download an installer from a mirror site. Your SHA-256 matches the value printed on the same mirror's download page. What have you proven?",
        options: [
          "That the file is exactly what the vendor released, byte for byte, so it is safe to run",
          "Only that it matches the mirror, which means nothing if the mirror was tampered with",
          "That the vendor signed the file with its own private key",
          "That the file was scanned and contains no malware",
        ],
        correctIndex: 1,
        explanation: "A hash only proves your file matches the reference you compared it to. An attacker who can replace a file on a mirror can replace the hash next to it. Take the reference from the vendor's own site or the IT portal.",
      },
      {
        question: "CCleaner (2017), SolarWinds (2020) and 3CX (2023) all shipped malicious updates that matched the vendor's published hash. Why did hash checks not catch them?",
        options: [
          "Customers checked the hash with MD5, which attackers can forge for any file they choose",
          "The attackers broke SHA-256 and forged a hash to match",
          "The vendor's own build was poisoned, so the published hash was the hash of the bad file",
          "Hash checks only work on documents, not on installers",
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
          "Read the key out now, since Sam's name shows on caller ID",
          "Tell the caller to reinstall Windows, since recovery wipes the drive",
          "Verify the caller with the approved method, then match the Key ID to the device",
          "Email the key to the address the caller gives, so there is a written record of what was sent",
        ],
        correctIndex: 2,
        explanation: "The recovery key unlocks every file on the drive, so it goes only to a verified user. Match the first 8 characters of the Key ID to the right device in Active Directory or Entra ID, and document who you verified and how.",
      },
      {
        question: "A breached vendor table shows two users with exactly the same value in the password column. What does that tell you?",
        options: [
          "Each user had a unique salt, which made the values line up",
          "There was no per-user salt, so both users chose the same password",
          "The values were encrypted with a fresh random key each time",
          "Nothing, since different passwords often hash to the same value",
        ],
        correctIndex: 1,
        explanation: "A salt makes every stored value unique, even for identical passwords. Matching values mean no salt, or reversible storage without randomness, and they reveal password reuse without cracking anything.",
      },
      {
        question: "Why do password systems use bcrypt or Argon2id instead of plain SHA-256?",
        options: [
          "SHA-256 can be decrypted with the right key",
          "bcrypt and Argon2id produce shorter hashes that are easier to store and faster to compare",
          "They are deliberately slow, so each guess costs an attacker far more time",
          "SHA-256 is not allowed on Windows",
        ],
        correctIndex: 2,
        explanation: "SHA-256 is built to be fast, which is right for checking files and wrong for passwords. On one ordinary processor core it ran about 1.2 million times a second, while bcrypt at cost 12 managed about 3 or 4. The login waits once. The attacker waits on every guess.",
      },
      {
        question: "The Security log shows one or two failed sign-ins (Event ID 4625) on each of 60 different accounts, all from one source, within ten minutes. What is the most likely attack?",
        options: [
          "Brute force: many passwords tried against one account until it opens",
          "Password spraying: one common password tried across many accounts, under the lockout limit",
          "Sixty users who all mistyped their passwords after a policy change forced new ones that morning",
          "A BitLocker recovery event that logs one failure per account",
        ],
        correctIndex: 1,
        explanation: "Brute force hammers one account and usually ends in a lockout (4740). Spraying spreads a few guesses across many accounts so no lockout fires. The pattern across accounts is the evidence.",
      },
      {
        question: "A browser and a website agree on a fresh AES key for the session, using their own public/private key pairs to do it. Why not just use the key pairs for the whole session?",
        options: [
          "Key pairs can only sign data, never encrypt it, so they could not protect the session at all",
          "Key pairs are much slower, so they only agree on the fast key that does the bulk work",
          "Browsers may not use key pairs once the session has started",
          "AES only works on files on disk, so it cannot protect a session",
        ],
        correctIndex: 1,
        explanation: "One shared key is fast, which is right for a lot of data, while a key pair is slow but solves agreeing on a secret with someone you have never met. HTTPS uses the slow method once to set up the fast one, then the fast method protects everything the session sends.",
      },
      {
        question: "A log shows powershell.exe -enc followed by 400 characters of Base64 on a laptop at 2 AM. Is that command hidden from you, and what is the first step to read it?",
        options: [
          "Yes. Base64 is encryption, so it cannot be read without the key",
          "No. It is encoding. Use From Base64, then Decode text set to UTF-16LE",
          "No, but encoded commands can only be decoded inside PowerShell on the machine that ran them",
          "Yes, unless you have the attacker's private key to decrypt it",
        ],
        correctIndex: 1,
        explanation: "PowerShell's -EncodedCommand text is UTF-16, so after From Base64 it still needs a UTF-16LE text decode to read cleanly. Decoding it first is what lets you judge whether the actual command is dangerous, rather than reacting to the fact that it was encoded at all.",
      },
      {
        question: "Windows stores the NT hash for a local or domain password. Why does that make it more dangerous than a salted, slow hash like bcrypt?",
        options: [
          "It is longer than bcrypt, so it takes longer to steal from memory",
          "It is fast and unsalted, and a stolen hash can be used to sign in (pass-the-hash)",
          "Windows stores the password in plain text, not as a real hash",
          "It is regenerated every 24 hours, so an attacker has to keep stealing fresh copies of it",
        ],
        correctIndex: 1,
        explanation: "Fast and unsalted means guessing it is cheap, and pass-the-hash means an attacker does not even need to guess: the hash itself can be presented to sign in. That is why domain controllers and admin accounts are guarded so tightly, and why tools like LAPS give every machine its own local admin password.",
      },
      {
        question: "BitLocker encrypts Sam's laptop drive. Once Sam signs in and the drive is unlocked, what does BitLocker still protect against?",
        options: [
          "Malware running as Sam, since BitLocker keeps every file encrypted even while it is open",
          "A thief who grabs the laptop while it is unlocked and running",
          "Nothing more this session. Malware running as Sam reads files as Sam can",
          "Sam forgetting their password, since BitLocker can recover it",
        ],
        correctIndex: 2,
        explanation: "Encryption at rest, like BitLocker, protects a lost or stolen drive that is powered off or locked. It does nothing once the drive is unlocked and a process is running as the signed-in user, which is a job for access control and endpoint security instead.",
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
          "Port 3389 is always malicious, wherever it shows up",
          "Remote desktop controls another machine, and this one has no reason to",
          "It is routine Windows Update traffic and can be ignored",
          "It proves the firewall is misconfigured, so the only thing to do is fix the outbound rule",
        ],
        correctIndex: 1,
        explanation: "Ports like SSH (22) and RDP (3389) indicate remote control, not routine browsing. Traffic there from somewhere unexpected is a real flag worth investigating.",
      },
      {
        question: "What does TLS add on top of what TCP already provides?",
        options: [
          "Nothing, since TLS and TCP do the same job in different places",
          "TLS keeps the packets in order, while TCP encrypts them",
          "TCP sets up the connection, then TLS agrees on encryption over it",
          "TLS replaces the TCP handshake, so only one handshake happens before data starts to move",
        ],
        correctIndex: 2,
        explanation: "These are two separate handshakes, back to back. TCP's three-way handshake establishes the connection. Then TLS does its own handshake to agree on encryption keys before real data moves.",
      },
      {
        question: "A capture shows a packet that reached the destination address, but the host never confirmed receiving it. Which protocol's job failed, IP or TCP?",
        options: [
          "IP, because it is the protocol responsible for confirming that data arrived",
          "TCP, because confirming receipt and resending are TCP's job",
          "Neither, since a missing confirmation is a DNS problem",
          "Both, since IP and TCP share the job of confirming",
        ],
        correctIndex: 1,
        explanation: "IP gets the data there, on a best-effort basis with no promise and no check. TCP is the one that numbers what it sends and waits for confirmation, so a host that received data but never confirmed it is a TCP-level problem: the service may not be listening, a firewall may be dropping replies, or the host is overloaded.",
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
          "They capture every byte of every conversation a machine has, whether it is encrypted or not",
          "Almost every connection starts with a lookup, so they show what a machine tried to reach",
          "They never miss a lookup, unlike every other log source",
          "They are the only log in which IP addresses appear at all",
        ],
        correctIndex: 1,
        explanation: "A device has to look up a name before it can reach it, so DNS logs are an early, broad record of intent, including failed and never-completed attempts. They are not complete, since cached answers, direct IP connections and DoH (encrypted DNS) never show up there, but a lookup for a name with no business reason is often the earliest sign something is wrong.",
      },
      {
        question: "A workstation's address starts with 169.254.x.x. What does that tell you?",
        options: [
          "DHCP assigned it normally from the office's address range",
          "It asked DHCP for an address and nobody answered, a network fault",
          "It is a domain controller, because Windows gives every domain controller an address in that range",
          "That range is reserved for Kerberos sign-in traffic",
        ],
        correctIndex: 1,
        explanation: "DHCP is almost universal, so an address in the 169.254 range is the exception that matters: the device requested one and got no answer, which is a DHCP or network problem worth chasing down.",
      },
      {
        question: "SMTP traffic is seen leaving a workstation that has no reason to send mail. Why does that deserve a second look?",
        options: [
          "It doesn't, since SMTP from a workstation is always a false positive from the mail client",
          "Only mail servers and mail clients should send it, and hacked machines often send mail",
          "SMTP should only ever run on the domain controllers",
          "It doesn't, because SMTP traffic is always encrypted",
        ],
        correctIndex: 1,
        explanation: "A short, specific list of machines has a reason to speak SMTP. A workstation outside that list sending mail is worth following up, because spam and phishing sent from a compromised host is one of the most common things an attacker does with it.",
      },
      {
        question: "You capture an HTTPS session in Wireshark. You cannot read the page content or the password typed into a form. What can you still see?",
        options: [
          "Nothing at all, because TLS hides the entire conversation",
          "Who talked, the ports, how much data moved, the handshake and usually the site name",
          "Only the two IP addresses, with no other detail at all",
          "The full page content and the site name, but not what was typed into the password field",
        ],
        correctIndex: 1,
        explanation: "TLS hides the payload, not the surrounding facts. The two endpoints, the ports, the timing and volume of data, and in most connections the site name sent before encryption starts, are all still visible, and that outside information is usually enough to decide whether a conversation belongs.",
      },
    ],
  },
  {
    phaseSlug: "phase-1",
    weekSlug: "week-4",
    questions: [
      {
        question: "In the PortSwigger broken-access-control lab, what was the root cause of the vulnerability?",
        options: [
          "A weak password on the administrator account that was easy to guess",
          "The server trusted a `roleid` the client sent instead of checking the role itself",
          "The application had no login page at all, so anyone could reach the admin panel directly",
          "The database was exposed directly to the internet without a firewall",
        ],
        correctIndex: 1,
        explanation: "The app let the client dictate its own privilege level (`roleid=2`) instead of the server enforcing it. That is a textbook broken access control flaw. A server should never trust client-supplied state for an authorization decision.",
      },
      {
        question: "Why did editing the \"My Account\" email field, not the login page, reveal the vulnerability?",
        options: [
          "It didn't. The login page was the real weak point all along",
          "Its response was the first to leak more than the user needed, a `roleid` field",
          "Email fields are insecure by design in every web application",
          "The flaw only exists in requests that read data and never change it, and that one only read",
        ],
        correctIndex: 1,
        explanation: "The login and session-only requests did not expose anything tamperable. The account-update request's response happened to include the `roleid` field. That made it discoverable and therefore editable.",
      },
      {
        question: "What is the real-world fix for this class of vulnerability?",
        options: [
          "Hide the `roleid` field from every response, so users never learn that it exists to change",
          "Check every privilege on the server, never trusting a role the client sends",
          "Require a stronger password policy for every account on the site",
          "Add rate limiting to the login page to slow attackers down",
        ],
        correctIndex: 1,
        explanation: "Hiding the field is security through obscurity. It does not fix anything, since the request can still be crafted manually. The actual fix is server-side authorization on every privileged action, independent of anything the client claims about itself.",
      },
      {
        question: "In this lab, what do roleid=1 and roleid=2 mean, and why does sending roleid=2 from a regular account work?",
        options: [
          "1 is an admin and 2 is a guest, and the server ignores both",
          "1 is a regular user and 2 is an admin, and the server accepts either",
          "Both mean the same role, and the number is only for display",
          "2 is a CSRF token that the server requires on every request, and 1 marks an expired token",
        ],
        correctIndex: 1,
        explanation: "Your account starts as roleid=1. Admins are roleid=2. The server does not check that you are allowed to be an admin. It stores the number you sent, so a regular user can promote themselves.",
      },
      {
        question: "What is the actual win condition of the PortSwigger lab, once the role has been changed?",
        options: [
          "Change your email address a second time",
          "Turn off Burp and log out",
          "Open the Admin Panel and delete the user Carlos",
          "Reset the roleid field back to 1 so nobody notices",
        ],
        correctIndex: 2,
        explanation: "Privilege itself is not the goal. The lab is solved when you use that stolen admin role to delete Carlos from the Admin Panel.",
      },
      {
        question: "Jamie Torres reports about fifteen sign-in approval prompts in ten minutes that Jamie did not start. What does this most likely mean?",
        options: [
          "The authenticator app is broken and needs reinstalling on the phone",
          "Someone has Jamie's password and is flooding prompts to get past MFA",
          "Jamie's account is locked out, and each prompt is a lockout notice from the sign-in service",
          "Nothing serious, as long as Jamie approves only one of them",
        ],
        correctIndex: 1,
        explanation: "A push prompt only fires after the password step succeeds. Unrequested prompts mean the password is known. Jamie denies everything, the password is reset through the verified process, and security is told. Uber was breached in 2022 when a flooded user finally approved one.",
      },
      {
        question: "A caller says they are Jordan Ellis, the Finance lead, and needs their MFA moved to a new phone before a meeting in ten minutes. Caller ID shows Jordan's name. What do you do?",
        options: [
          "Move the MFA now, because the caller ID shows Jordan's name",
          "Move the MFA now, because Jordan is senior, the meeting is urgent and the caller ID matches",
          "Verify first, with a callback to the number on file, then make the change",
          "Disable Jordan's account until Jordan comes to the desk in person",
        ],
        correctIndex: 2,
        explanation: "An MFA change hands over the second factor, so it gets the same check as a password reset or stronger. Caller ID can be faked, and urgency and seniority are the pressure attackers use. That is how MGM Resorts' help desk was talked into an MFA reset in 2023.",
      },
      {
        question: "Taylor Osei moved from Operations to Finance and asks for Finance share access. The account is still in Operations Users. What is the right change?",
        options: [
          "Add Finance Accounting Users now and leave Operations Users for a later access review",
          "Add Taylor to IT Admins so Taylor can adjust their own access",
          "With approval, add Finance Accounting Users and remove Operations Users together",
          "Grant Taylor's account permissions on the Finance folder directly",
        ],
        correctIndex: 2,
        explanation: "Least privilege means access for the current job only. Keeping old groups after a move is privilege creep. Permissions go through groups, not individual accounts, and the change is approved and recorded.",
      },
      {
        question: "Changing a document number in a web address shows another customer's records. What kind of flaw is this?",
        options: [
          "An authentication failure, because the user's password was too weak",
          "Broken access control, because the server never checks who owns the document",
          "An encryption failure, because the document number travels in the web address in plain text",
          "Not a flaw, because the user had already signed in to the site",
        ],
        correctIndex: 1,
        explanation: "Signing in answers who you are. It does not answer whether you may see this item. First American Financial exposed about 885 million documents in 2019 this way. The fix is a server-side ownership check on every request.",
      },
      {
        question: "Rank these MFA methods from most to least resistant to phishing: a text message code, push approval with number matching, and a FIDO2 security key.",
        options: [
          "Text code, then push, then security key, since texts reach a physical phone",
          "Security key, then push with number matching, then text code",
          "All three are equal, since each one adds a second factor to the password",
          "Push, then security key, then text code, since push needs the user's attention to approve",
        ],
        correctIndex: 1,
        explanation: "Security keys and passkeys are phishing-resistant because the key itself verifies the site before it responds. Number matching defeats blind push approval, the mistake that let attackers into Uber in 2022. A text or voice code is weakest, vulnerable to phishing and to an attacker moving the number to their own SIM.",
      },
      {
        question: "Riley's account shows up locked out, while Kai's account shows as disabled after their contract ended. What is the right fix for each?",
        options: [
          "Reset both passwords, since a reset clears a lockout and a disable",
          "Unlock Riley. Kai stays disabled unless whoever disabled it decides otherwise",
          "Disable Riley's account too, to match Kai's until both are reviewed",
          "Enable Kai and unlock Riley, since both are just blocked sign-ins with the same underlying cause",
        ],
        correctIndex: 1,
        explanation: "A locked account only needs unlocking, since the password never changed. A disabled account was turned off on purpose, usually because someone left or is under investigation, so re-enabling it without checking why defeats the reason it was disabled in the first place.",
      },
      {
        question: "A Security log shows event 4624 with logon type 10 for an account, and a separate 4625 with Sub Status 0xC0000064. What does each one tell you?",
        options: [
          "4624/10 is a failed Remote Desktop sign-in. 0xC0000064 means a wrong password",
          "4624/10 is a successful Remote Desktop sign-in. 0xC0000064 means no such username",
          "Both describe one successful sign-in, and 0xC0000064 is its session ID",
          "4624 and 4625 are both failed sign-ins, and logon type 10 means the account is now locked out",
        ],
        correctIndex: 1,
        explanation: "4624 is a successful sign-in, and logon type 10 means it came in over Remote Desktop. 4625 is a failed sign-in, and its Sub Status explains why: 0xC0000064 is an account name that does not exist at all, 0xC000006A is a real account with the wrong password, and 0xC0000234 is a locked account.",
      },
      {
        question: "Jordan can enter a wire transfer, but a separate person has to approve it before it goes out. Which principle is this, and how is it different from least privilege?",
        options: [
          "Least privilege, since Jordan's account can only do part of the job",
          "Separation of duties. No one person controls the whole process end to end",
          "Need to know, since the approver only sees this one wire transfer and nothing else of Jordan's",
          "There is no real difference, since both limit what Jordan can do",
        ],
        correctIndex: 1,
        explanation: "Least privilege limits what one account can reach. Separation of duties limits what one person can do alone, even within their own access, so that fraud or a serious mistake takes two people acting together rather than one. Need to know is a third, related idea: access to specific data only while a task actually requires it.",
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
          "So each department gets its own administrator, who manages only that department's staff",
          "So a stolen login at one level can't automatically reach the levels above",
          "So password resets go faster, spread across three separate teams",
          "So the domain stays under Microsoft's limit on admin accounts",
        ],
        correctIndex: 1,
        explanation: "Level 1 (Domain Admin) controls the domain controller and Active Directory itself. Level 2 (Server Admin) controls servers. Level 3 (Helpdesk) touches only workstations, password resets and local support. A Level 3 login doing a Level 1 action does not match this table, and that split is how far a compromise is supposed to stop.",
      },
      {
        question: "Why are Wealth Management, Compliance, and Finance and Accounting flagged as critical departments while IT and Operations are not?",
        options: [
          "They have more employees than IT and Operations combined",
          "They handle regulated data, client financial records or the firm's own finances",
          "They sit in a separate building with its own network, so an outage there hits them alone",
          "Their staff sign in from outside the office more often",
        ],
        correctIndex: 1,
        explanation: "Critical is about the data at stake: PII, account and portfolio data, GLBA and SOX material, or the firm's own finances. IT has elevated system access, but it does not hold that regulated or client data. Size the ticket against the data, not against the job title.",
      },
      {
        question: "A ticket names a person. The org chart, the directory folder and the directory group should all agree. If two of the three disagree, what should you do?",
        options: [
          "Change whichever one is easiest to fix so they match",
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
          "Level 1 uses the built-in Domain Admins group, so there is no third to create",
          "Domain Admin does not require group membership",
          "There are actually three groups, and the count in The Environment is simply out of date",
        ],
        correctIndex: 1,
        explanation: "Windows already ships a built-in Domain Admins group with the highest level of access, so PurveX's build reuses it for Level 1 rather than creating a duplicate. If your lab's count ever differs from The Environment tab, check the build before trusting a ticket answer.",
      },
      {
        question: "A spreadsheet of client names, dates of birth and Social Security numbers turns up on a share it should not be on. Which data category is at risk, and which departments primarily handle it?",
        options: [
          "Internal financial records, handled primarily by Finance and Accounting under its own policy",
          "Personal identifying information, handled primarily by Wealth Management and Compliance",
          "System and access logs, handled primarily by the IT department",
          "Estate and trust documentation, handled primarily by Operations",
        ],
        correctIndex: 1,
        explanation: "Names, dates of birth and Social Security numbers are personal identifying information, the category Wealth Management and Compliance primarily handle. Naming the data category, not just saying a file was exposed, is what lets you size how urgent a finding actually is.",
      },
    ],
  },
  {
    phaseSlug: "phase-1",
    weekSlug: "home-lab-directory",
    questions: [
      {
        question: "Alex Rivera is the one user in the directory who holds membership in two groups instead of one. Why does that matter when investigating an alert?",
        options: [
          "It doesn't, since every account in the directory is equally likely to be compromised",
          "Broader membership means a bigger blast radius, so its activity needs closer scrutiny",
          "It means Alex's account is a test account that alerts can skip",
          "It's a data entry error in the lab, so its alerts are just noise",
        ],
        correctIndex: 1,
        explanation: "Alex sits in both IT Users and IT Admins, the only account with elevated access alongside standard access. You need that baseline before you weigh an alert on that account. An account's OU tells you where it lives, and its groups tell you what it can do, so check both.",
      },
      {
        question: "What is the real difference between an Organizational Unit and a Container in Active Directory?",
        options: [
          "There's no real difference, since both are folders that hold users, groups and computers",
          "A Container can have Group Policy linked to it. An OU cannot",
          "An OU can have Group Policy linked and permissions delegated. A Container cannot",
          "OUs only hold computers, and Containers only hold users",
        ],
        correctIndex: 2,
        explanation: "They look the same in the console, both using a folder icon, but a Container is a different kind of object. GPOs and delegated control go on OUs, not on the built-in Users and Computers Containers, which is why the build script puts every account in a real OU instead.",
      },
      {
        question: "Where does an account's Member Of tab tell you what the account can reach, versus where it lives?",
        options: [
          "The folder (OU) tells you what it can reach, and Member Of tells you where it lives",
          "The folder (OU) tells you where it lives, and Member Of tells you what it can reach",
          "Both answer the same question, so you only ever need to check one of them",
          "Neither. Only PowerShell can answer either question",
        ],
        correctIndex: 1,
        explanation: "An account has exactly one OU, which records where it lives, while it can sit in any number of groups, which is what grants permissions. So when a ticket names a person, check the folder and then Member Of, because a title on the account is not the same as either one.",
      },
      {
        question: "The AccessLevels OU, holding Server Admins and Helpdesk, sits outside the Departments OU. Why keep it separate rather than putting those groups inside a department?",
        options: [
          "It's a cosmetic choice with no effect on how access works",
          "They grant access across the whole domain, which is not the same as being on a team",
          "Active Directory doesn't allow security groups to be created inside a Departments OU at all",
          "AccessLevels is really a Container, so it can't sit inside an OU",
        ],
        correctIndex: 1,
        explanation: "An OU records where an account lives, not what it can access. Server Admins and Helpdesk are domain-wide privileges rather than a department roster, so filing them in their own OU keeps that distinction visible instead of burying domain-wide access inside one department's folder.",
      },
      {
        question: "PurveX names its service account svc-backup-job, sets its password to never expire, and restricts its logon hours to the overnight backup window. Which of these would be a red flag during a review?",
        options: [
          "The account lives in OU=ServiceAccounts, apart from the department OUs and other service accounts",
          "The account's Description names the backup job that it runs",
          "The account is a member of IT Users and can sign in to a desktop interactively",
          "The account's Logon Hours match its overnight backup window",
        ],
        correctIndex: 2,
        explanation: "A service account should do its one job and nothing else. Membership in a people group and the ability to sign in interactively both mean it can do things no backup job ever needs to do, which is exactly the kind of over-privileged service account a review should catch.",
      },
      {
        question: "A screen-lock GPO is linked to OU=IT. Will it reach an account that lives in the Finance and Accounting OU?",
        options: [
          "Yes, GPOs apply to the whole domain no matter where they are linked",
          "No. A GPO only reaches what sits under where it is linked",
          "Yes, because every department shares one screen-lock policy by default",
          "It depends on which security groups the account belongs to, not on the OU it lives in",
        ],
        correctIndex: 1,
        explanation: "A GPO can link to a Site, a Domain or an OU, and it only reaches objects inside that link. An account in a different OU gets nothing from a GPO linked elsewhere, which is why checking where an object actually lives comes before blaming the policy.",
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
          "Reset the password and force a change at next logon",
          "Check Unlock account on the Account tab. The password stays the same",
          "Disable the account until Riley calls back to confirm",
          "Add Riley to a different group with fewer restrictions on failed sign-in attempts",
        ],
        correctIndex: 1,
        explanation: "A locked account and a forgotten password are different problems with different fixes. If Riley still knows the password, unlocking it is enough. Resetting a password they still remember would be the wrong fix, and would hand them a temporary password to manage for no reason.",
      },
      {
        question: "Taylor Osei is moving from Operations to Compliance. You move the account to OU=Users,OU=Compliance,OU=Departments and update the job title. Is the transfer finished?",
        options: [
          "Yes. Once the account is in the new OU, its group memberships move with it automatically",
          "No. Swap Operations Users for Compliance Users too, or the old access stays",
          "Yes, as long as the title field now says Compliance",
          "No. The account must be deleted and recreated in Compliance",
        ],
        correctIndex: 1,
        explanation: "The OU sets location and policy, not access. A transfer is only finished when both the folder and Member Of match the new job, which means adding the new department's group and removing the old one in the same change, not a separate ticket raised later.",
      },
      {
        question: "You turn on View → Advanced Features in Active Directory Users and Computers to open the Attribute Editor. Which raw attribute tells you when a password was last changed, and what is one catch when reading a sign-in time?",
        options: [
          "whenCreated. And lastLogon replicates instantly to every domain controller",
          "pwdLastSet. And lastLogon is per domain controller, while lastLogonTimestamp can lag",
          "memberOf. And sign-in times are exact and identical on every domain controller in the domain",
          "None. The Account tab already shows both, so the Attribute Editor isn't needed",
        ],
        correctIndex: 1,
        explanation: "pwdLastSet, whenCreated and memberOf are the attributes worth knowing for an investigation, and pwdLastSet is the one that answers whether a password reset actually happened. lastLogon is per-DC and not synced, while lastLogonTimestamp is shared across DCs but can be up to 14 days stale, so neither one alone gives you a precise answer.",
      },
    ],
  },
];

export function findQuiz(phaseSlug: string, weekSlug: string): Quiz | undefined {
  return quizzes.find((q) => q.phaseSlug === phaseSlug && q.weekSlug === weekSlug);
}
