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
        question: "The formula is Risk = Threat × Vulnerability × Impact. A server has a known critical vulnerability but is completely air-gapped, with no possible attacker access. There is no threat. What is the risk?",
        options: ["Still critical, because the vulnerability is severe", "Zero, because no threat means no risk, regardless of the vulnerability", "Impossible to calculate", "Moderate, as a precaution"],
        correctIndex: 1,
        explanation: "The lesson's own rule is that no threat means no risk, even if the vulnerability exists. Risk requires a realistic path for a threat to reach and exploit the vulnerability.",
      },
      {
        question: "Which of these is a control for integrity rather than confidentiality?",
        options: ["Access control lists", "Encryption", "Digital signatures / checksums", "Need-to-know policies"],
        correctIndex: 2,
        explanation: "Signatures and checksums show whether data was changed, which is integrity. Encryption, access lists and need-to-know policies control who can see data, which is confidentiality.",
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
          "A SHA-256 hash, so it cannot be reversed",
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
          "The file contains no malware",
        ],
        correctIndex: 1,
        explanation: "A hash only proves your file matches the reference you compared it to. An attacker who can replace a file on a mirror can replace the hash next to it. Take the reference from the vendor's own site or the IT portal.",
      },
      {
        question: "CCleaner (2017), SolarWinds (2020) and 3CX (2023) all shipped malicious updates that matched the vendor's published hash. Why did hash checks not catch them?",
        options: [
          "The customers used MD5 instead of SHA-256",
          "The attackers broke SHA-256",
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
          "Email the key to the address the caller gives you",
        ],
        correctIndex: 2,
        explanation: "The recovery key unlocks every file on the drive, so it goes only to a verified user. Match the first 8 characters of the Key ID to the right device in Active Directory or Entra ID, and document who you verified and how.",
      },
      {
        question: "A breached vendor table shows two users with exactly the same value in the password column. What does that tell you?",
        options: [
          "The passwords were stored with a unique salt per user",
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
        explanation: "SHA-256 is built to be fast, which is right for checking files and wrong for passwords. On one ordinary processor core it ran about 1.2 million times a second, while bcrypt at cost 12 managed about 3 or 4. The login waits once. The attacker waits on every guess.",
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
    ],
  },
  {
    phaseSlug: "phase-1",
    weekSlug: "week-3",
    questions: [
      {
        question: "Put the TCP three-way handshake in the correct order.",
        options: ["ACK → SYN → SYN-ACK", "SYN → SYN-ACK → ACK", "SYN-ACK → SYN → ACK", "SYN → ACK → SYN-ACK"],
        correctIndex: 1,
        explanation: "Computer A sends SYN (\"I would like to connect\"). Computer B replies SYN-ACK (\"Understood, I am ready too\"). A replies ACK (\"Good, let us proceed\"). Then real data starts flowing.",
      },
      {
        question: "Outbound traffic on port 3389 appears from a workstation with no business making remote desktop connections. Why is this worth a second look?",
        options: [
          "Port 3389 is always malicious",
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
          "TLS makes sure packets arrive in order; TCP encrypts them",
          "TCP's handshake sets up the connection; TLS's handshake sets up privacy (encryption)",
          "TLS replaces the need for a TCP handshake entirely",
        ],
        correctIndex: 2,
        explanation: "These are two separate handshakes, back to back. TCP's three-way handshake establishes the connection. Then TLS does its own handshake to agree on encryption keys before real data moves.",
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
          "A weak password on the admin account",
          "The server trusted a `roleid` value the client sent in its own request instead of checking the role itself",
          "The application had no login page at all",
          "The database was exposed directly to the internet",
        ],
        correctIndex: 1,
        explanation: "The app let the client dictate its own privilege level (`roleid=2`) instead of the server enforcing it. That is a textbook broken access control flaw. A server should never trust client-supplied state for an authorization decision.",
      },
      {
        question: "Why did editing the \"My Account\" email field, not the login page, reveal the vulnerability?",
        options: [
          "It did not. The login page was the actual weak point",
          "That request was the first one whose response leaked more state (a `roleid` field) than the user needed to see",
          "Email fields are always insecure by design",
          "The vulnerability only exists in read-only requests",
        ],
        correctIndex: 1,
        explanation: "The login and session-only requests did not expose anything tamperable. The account-update request's response happened to include the `roleid` field. That made it discoverable and therefore editable.",
      },
      {
        question: "What is the real-world fix for this class of vulnerability?",
        options: [
          "Hide the `roleid` field from the response so users cannot see it",
          "Enforce every privilege check server-side, never trusting a role or permission value the client supplies",
          "Require a stronger password policy",
          "Add rate limiting to the login endpoint",
        ],
        correctIndex: 1,
        explanation: "Hiding the field is security through obscurity. It does not fix anything, since the request can still be crafted manually. The actual fix is server-side authorization on every privileged action, independent of anything the client claims about itself.",
      },
      {
        question: "In this lab, what do roleid=1 and roleid=2 mean, and why does sending roleid=2 from a regular account work?",
        options: [
          "1 is admin and 2 is a guest; the server ignores both",
          "1 is a regular user and 2 is an admin; the server accepts whichever value the client sends",
          "Both values mean the same role; the number is only for display",
          "2 is a CSRF token the server requires on every request",
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
          "The authenticator app is broken and needs reinstalling",
          "Someone already has Jamie's password and is trying to get past MFA by flooding prompts",
          "Jamie's account is locked out",
          "Nothing, as long as Jamie approves only one",
        ],
        correctIndex: 1,
        explanation: "A push prompt only fires after the password step succeeds. Unrequested prompts mean the password is known. Jamie denies everything, the password is reset through the verified process, and security is told. Uber was breached in 2022 when a flooded user finally approved one.",
      },
      {
        question: "A caller says they are Jordan Ellis, the Finance lead, and needs their MFA moved to a new phone before a meeting in ten minutes. Caller ID shows Jordan's name. What do you do?",
        options: [
          "Move the MFA, because caller ID matches",
          "Move the MFA, because Jordan is senior and the meeting is urgent",
          "Verify through the approved method, such as a callback to the number on file, before changing anything",
          "Disable Jordan's account",
        ],
        correctIndex: 2,
        explanation: "An MFA change hands over the second factor, so it gets the same check as a password reset or stronger. Caller ID can be faked, and urgency and seniority are the pressure attackers use. That is how MGM Resorts' help desk was talked into an MFA reset in 2023.",
      },
      {
        question: "Taylor Osei moved from Operations to Finance and asks for Finance share access. The account is still in Operations Users. What is the right change?",
        options: [
          "Add Finance Accounting Users and leave everything else",
          "Add Taylor to IT Admins so they can fix their own access",
          "With the new manager's approval, add Finance Accounting Users and remove Operations Users in the same change",
          "Give Taylor's account permissions on the Finance folder directly",
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
    ],
  },
  {
    phaseSlug: "phase-1",
    weekSlug: "home-lab-desk",
    questions: [
      {
        question: "In the PurveX Financial environment, how many administrative access levels are there, and what is the point of splitting them up?",
        options: [
          "One all-powerful admin account, for simplicity",
          "Three levels (Domain Admin, Server Admin, Helpdesk), so that a compromise at one level cannot automatically reach the levels above it",
          "Two levels: admin and everyone else",
          "Five levels, one per department",
        ],
        correctIndex: 1,
        explanation: "Level 1 (Domain Admin) controls the DC and AD itself. Level 2 (Server Admin) controls servers. Level 3 (Helpdesk) only touches workstations. A Level 3 account attempting a Level 1 action does not match this table. That split is how far a compromise is supposed to stop.",
      },
      {
        question: "Why are Wealth Management, Compliance, and Finance & Accounting flagged as \"critical\" departments while IT and Operations are not?",
        options: [
          "They have more employees",
          "They touch regulated data, client financial records, or the company's own financial systems",
          "They are located in a different building",
          "Critical status is assigned randomly for the lab",
        ],
        correctIndex: 1,
        explanation: "Critical is about the data at stake: PII, account and portfolio data, GLBA and SOX material, or the firm's own finances. IT has elevated system access. It does not hold that regulated or client data. Size the ticket against the data, not against the job title.",
      },
      {
        question: "Alex Rivera is the one user in the directory who holds membership in two groups instead of one. Why does that matter when investigating an alert?",
        options: [
          "It does not, since every account is equally likely to be compromised",
          "An account with broader-than-normal group membership has a larger blast radius if it is compromised, so unusual activity from it deserves extra scrutiny",
          "It means Alex Rivera's account is fake",
          "Dual group membership is a data entry error in the lab",
        ],
        correctIndex: 1,
        explanation: "Alex sits in both IT Users and IT Admins. That is the only account with elevated access alongside standard access. You need that baseline before you weigh an alert on him. Location and groups are not the same check.",
      },
      {
        question: "What is the real difference between an Organizational Unit and a Container in Active Directory?",
        options: [
          "There is no difference. Both are just folders",
          "A Container can have Group Policy linked to it. An OU cannot",
          "An OU can have Group Policy and delegated permissions. A Container cannot",
          "OUs only hold computers; Containers only hold users",
        ],
        correctIndex: 2,
        explanation: "They look the same in the console. The difference is what you can attach. GPOs and delegated control go on OUs. The built-in Users and Computers folders are Containers, which is why accounts get moved into real OUs.",
      },
      {
        question: "Where do you look first to see a user's groups in the GUI, before touching PowerShell?",
        options: [
          "Event Viewer → Security log",
          "Active Directory Users and Computers → the user → Properties → Member Of",
          "Group Policy Management → Default Domain Policy",
          "File Explorer → C:\\Users",
        ],
        correctIndex: 1,
        explanation: "Open ADUC, find the user, right-click Properties, then Member Of. That is the click path on the desk. PowerShell is optional after you can find it in the console.",
      },
    ],
  },
];

export function findQuiz(phaseSlug: string, weekSlug: string): Quiz | undefined {
  return quizzes.find((q) => q.phaseSlug === phaseSlug && q.weekSlug === weekSlug);
}
