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
        explanation: "Availability is posted hours — open when customers need the branch. Knocking the server offline does not open the vault or break the seal. It just keeps the doors locked, so nobody can get in when they need to.",
      },
      {
        question: "An attacker does not steal or change anything, but quietly intercepts unencrypted traffic and reads a customer's SSN as it crosses the network. Which CIA property is broken?",
        options: ["Confidentiality", "Integrity", "Availability", "None, because nothing was changed"],
        correctIndex: 0,
        explanation: "Confidentiality is the vault door — only badge holders get in. The attacker did not change the cash and did not close the branch. They walked in without a badge and read what they were not supposed to see.",
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
        explanation: "Vulnerability = the unlocked door. Threat = the burglar who might use it. Both are needed for there to be real risk.",
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
        explanation: "Integrity is the cash-bag seal — break it and everyone knows. Signatures and checksums are how you notice a torn seal. Encryption and access lists are the vault door (confidentiality), not the seal.",
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
      {
        question: "In Wireshark, which action reassembles a full back-and-forth exchange into a single readable view, showing exactly what a piece of malware sent and to where?",
        options: ["Statistics → Protocol Hierarchy", "Right-click a packet → Follow → HTTP Stream", "Applying the `ip.addr` filter", "Opening the Bytes pane"],
        correctIndex: 1,
        explanation: "Follow → HTTP Stream reassembles the full conversation into something readable. It is the single most useful move for narrowing in on a suspicious host.",
      },
      {
        question: "In the Hidden Tear ransomware lab, the stolen data (hostname + encryption key) was sent as a GET request query parameter instead of a POST body. Why is that actually useful for a responder?",
        options: [
          "It is not, since GET-based exfil is harder to detect than POST",
          "GET requests cannot carry stolen data, so this traffic was actually benign",
          "GET-based exfil shows up in plaintext in proxy/web logs and browser history, making it easier to recover after the fact",
          "GET requests are always encrypted by the browser automatically",
        ],
        correctIndex: 2,
        explanation: "Because the data rides in the URL itself, it is visible in plaintext web/proxy logs and browser history. That makes it easier to find after the fact than a POST body would be, a small silver lining in an otherwise bad situation.",
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
        explanation: "The app let the client dictate its own privilege level (`roleid=2`) instead of the server enforcing it. That is a textbook broken access control flaw. Trusting client-supplied state for an authorization decision is exactly what a server should never do.",
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
        explanation: "Your account starts as roleid=1. Admins are roleid=2. The server does not check that you are allowed to be an admin. It just stores the number you sent, so a regular user can promote themselves.",
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
    ],
  },
  {
    phaseSlug: "phase-1",
    weekSlug: "home-lab-active-directory",
    questions: [
      {
        question: "In the GovTech Financial environment, how many administrative access levels are there, and what is the point of splitting them up?",
        options: [
          "One all-powerful admin account, for simplicity",
          "Three levels (Domain Admin, Server Admin, Helpdesk), so that a compromise at one level cannot automatically reach the levels above it",
          "Two levels: admin and everyone else",
          "Five levels, one per department",
        ],
        correctIndex: 1,
        explanation: "Level 1 (Domain Admin) controls the DC/AD itself. Level 2 (Server Admin) controls servers. Level 3 (Helpdesk) only touches workstations. A Level 3 account attempting a Level 1 action is a major red flag precisely because that separation limits how far a compromise can spread.",
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
        explanation: "Critical here refers to the data at stake, such as PII, account and portfolio data, GLBA and SOX-regulated material, or the organization's own finances. IT has elevated system access but does not hold that regulated or client data.",
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
        explanation: "Alex sits in both IT Users and IT Admins. That is the only account with elevated access alongside standard access. Knowing who holds broader privilege ahead of time is exactly the kind of baseline knowledge that makes an alert on that account easier to weigh correctly.",
      },
      {
        question: "What is the real difference between an Organizational Unit and a Container in Active Directory?",
        options: [
          "There is no difference; both are just folders",
          "A Container can have Group Policy linked to it; an OU cannot",
          "An OU can have Group Policy and delegated permissions; a Container cannot",
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
