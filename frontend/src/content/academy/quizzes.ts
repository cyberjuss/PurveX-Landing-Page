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

export const quizzes: Quiz[] = [
  {
    phaseSlug: "phase-1",
    weekSlug: "week-1",
    questions: [
      {
        question: "A DDoS attack takes a company's web server offline for six hours. Which leg of the CIA triad did this attack break?",
        options: ["Confidentiality", "Integrity", "Availability", "Accountability"],
        correctIndex: 2,
        explanation: "Availability means authorized users can reach systems and data when they need to. Knocking a server offline doesn't expose or alter data — it just makes it unreachable, which is squarely an availability failure.",
      },
      {
        question: "An attacker doesn't steal or change anything, but quietly intercepts unencrypted traffic and reads a customer's SSN as it crosses the network. Which CIA property is broken?",
        options: ["Confidentiality", "Integrity", "Availability", "None — nothing was changed"],
        correctIndex: 0,
        explanation: "Confidentiality is about who is allowed to see data. Reading data you weren't authorized to see is a confidentiality breach even if you never modify or delete anything.",
      },
      {
        question: "What's the real difference between a threat and a vulnerability?",
        options: [
          "They're the same thing, just different words analysts use",
          "A vulnerability is a weakness; a threat is something or someone that could exploit it",
          "A threat is a weakness; a vulnerability is something that could exploit it",
          "A vulnerability only applies to software, a threat only applies to people",
        ],
        correctIndex: 1,
        explanation: "Vulnerability = the unlocked door. Threat = the burglar who might use it. You need both for there to be real risk.",
      },
      {
        question: "Using the formula Risk = Threat × Vulnerability × Impact — if a server has a known critical vulnerability but is completely air-gapped with no possible attacker access (no threat), what's the risk?",
        options: ["Still critical, because the vulnerability is severe", "Zero — no threat means no risk, regardless of the vulnerability", "Impossible to calculate", "Moderate, as a precaution"],
        correctIndex: 1,
        explanation: "The lesson's own rule: no threat = no risk, even if the vulnerability exists. Risk requires a realistic path for a threat to actually reach and exploit the vulnerability.",
      },
      {
        question: "Which of these is a control for integrity rather than confidentiality?",
        options: ["Access control lists", "Encryption", "Digital signatures / checksums", "Need-to-know policies"],
        correctIndex: 2,
        explanation: "Digital signatures and checksums prove data hasn't been tampered with — that's integrity. Encryption and access control lists are the classic confidentiality controls.",
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
        explanation: "Computer A sends SYN (\"I'd like to connect\"), Computer B replies SYN-ACK (\"okay, ready too\"), A replies ACK (\"great, let's go\") — then real data starts flowing.",
      },
      {
        question: "You see outbound traffic on port 3389 from a workstation that has no business making remote desktop connections. Why is this worth a second look?",
        options: [
          "Port 3389 is always malicious",
          "Ports like 22 and 3389 mean someone is trying to control a machine, not just browse it",
          "It's normal DNS traffic and can be ignored",
          "It means the firewall is misconfigured",
        ],
        correctIndex: 1,
        explanation: "Ports like SSH (22) and RDP (3389) indicate remote control, not routine browsing — traffic there from somewhere unexpected is a real flag worth investigating.",
      },
      {
        question: "What does TLS add on top of what TCP already provides?",
        options: [
          "Nothing — TLS and TCP do the same job",
          "TLS makes sure packets arrive in order; TCP encrypts them",
          "TCP's handshake sets up the connection; TLS's handshake sets up privacy (encryption)",
          "TLS replaces the need for a TCP handshake entirely",
        ],
        correctIndex: 2,
        explanation: "Two separate handshakes, back to back: TCP's three-way handshake establishes the connection, then TLS does its own handshake to agree on encryption keys before real data moves.",
      },
      {
        question: "In Wireshark, which action reassembles a full back-and-forth exchange into a single readable view — showing exactly what a piece of malware sent and to where?",
        options: ["Statistics → Protocol Hierarchy", "Right-click a packet → Follow → HTTP Stream", "Applying the `ip.addr` filter", "Opening the Bytes pane"],
        correctIndex: 1,
        explanation: "Follow → HTTP Stream reassembles the full conversation into something readable — the single most useful move once you've narrowed in on a suspicious host.",
      },
      {
        question: "In the Hidden Tear ransomware lab, the stolen data (hostname + encryption key) was sent as a GET request query parameter instead of a POST body. Why is that actually useful for a responder?",
        options: [
          "It isn't — GET-based exfil is harder to detect than POST",
          "GET requests can't carry stolen data, so this traffic was actually benign",
          "GET-based exfil shows up in plaintext in proxy/web logs and browser history, making it easier to recover after the fact",
          "GET requests are always encrypted by the browser automatically",
        ],
        correctIndex: 2,
        explanation: "Because the data rides in the URL itself, it's visible in plaintext web/proxy logs and browser history — easier to find after the fact than a POST body would be, which is a small silver lining in an otherwise bad situation.",
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
        explanation: "The app let the client dictate its own privilege level (`roleid=2`) instead of the server enforcing it — a textbook broken access control flaw. Trusting client-supplied state for an authorization decision is exactly what a server should never do.",
      },
      {
        question: "Why did editing the \"My Account\" email field — not the login page — reveal the vulnerability?",
        options: [
          "It didn't; the login page was the actual weak point",
          "That request was the first one whose response leaked more state (a `roleid` field) than the user needed to see",
          "Email fields are always insecure by design",
          "The vulnerability only exists in read-only requests",
        ],
        correctIndex: 1,
        explanation: "The login and session-only requests didn't expose anything tamperable. The account-update request's response happened to include the `roleid` field — that's what made it discoverable and, in turn, editable.",
      },
      {
        question: "What's the real-world fix for this class of vulnerability?",
        options: [
          "Hide the `roleid` field from the response so users can't see it",
          "Enforce every privilege check server-side, never trusting a role or permission value the client supplies",
          "Require a stronger password policy",
          "Add rate limiting to the login endpoint",
        ],
        correctIndex: 1,
        explanation: "Hiding the field is security through obscurity — it doesn't fix anything, since the request can still be crafted manually. The actual fix is server-side authorization on every privileged action, independent of anything the client claims about itself.",
      },
    ],
  },
  {
    phaseSlug: "phase-1",
    weekSlug: "home-lab-active-directory",
    questions: [
      {
        question: "In the GovTech Financial environment, how many administrative access levels are there, and what's the point of splitting them up?",
        options: [
          "One all-powerful admin account, for simplicity",
          "Three levels (Domain Admin, Server Admin, Helpdesk), so that a compromise at one level can't automatically reach the levels above it",
          "Two levels: admin and everyone else",
          "Five levels, one per department",
        ],
        correctIndex: 1,
        explanation: "Level 1 (Domain Admin) controls the DC/AD itself, Level 2 (Server Admin) controls servers, Level 3 (Helpdesk) only touches workstations. A Level 3 account attempting a Level 1 action is a major red flag precisely because that separation limits how far a compromise can spread.",
      },
      {
        question: "Why are Wealth Management, Compliance, and Finance & Accounting flagged as \"critical\" departments while IT and Operations aren't?",
        options: [
          "They have more employees",
          "They touch regulated data, client financial records, or the company's own financial systems",
          "They're located in a different building",
          "Critical status is assigned randomly for the lab",
        ],
        correctIndex: 1,
        explanation: "Critical here means the data at stake — PII, account/portfolio data, GLBA/SOX-regulated material, or the org's own finances. IT has elevated system access but doesn't itself hold that regulated or client data.",
      },
      {
        question: "Alex Rivera is the one user in the directory who holds membership in two groups instead of one. Why does that matter when you're investigating an alert?",
        options: [
          "It doesn't — every account is equally likely to be compromised",
          "An account with broader-than-normal group membership has a larger blast radius if it's compromised, so unusual activity from it deserves extra scrutiny",
          "It means Alex Rivera's account is fake",
          "Dual group membership is a data entry error in the lab",
        ],
        correctIndex: 1,
        explanation: "Alex sits in both IT Users and IT Admins — the only account with elevated access alongside standard access. Knowing who holds broader privilege ahead of time is exactly the kind of baseline knowledge that makes an alert on that account easier to weigh correctly.",
      },
    ],
  },
  {
    phaseSlug: "phase-2",
    weekSlug: "week-1",
    questions: [
      {
        question: "What's the key difference in how a virus spreads compared to a worm?",
        options: [
          "They spread identically — the terms are interchangeable",
          "A virus needs a user to open an infected file; a worm spreads system to system without any human interaction",
          "A worm needs a host file to infect; a virus spreads on its own",
          "A virus only affects mobile devices, a worm only affects servers",
        ],
        correctIndex: 1,
        explanation: "A virus needs a host object and spreads through user actions (opening an infected file). A worm exploits a system flaw directly and spreads on its own, which is why it can move faster than a virus.",
      },
      {
        question: "Someone downloads what looks like a free game, but it secretly installs malware once opened. What is this distribution method called?",
        options: ["A worm", "A logic bomb", "A Trojan Horse", "Spoofing"],
        correctIndex: 2,
        explanation: "A Trojan Horse isn't a malware type itself — it's a distribution method, named for hiding something harmful inside something that looks harmless, the same way the original Trojan Horse hid soldiers inside a gift.",
      },
      {
        question: "Which malware type is built specifically to capture everything a user types and send it back to the attacker?",
        options: ["Adware", "A keystroke logger", "A rootkit", "A logic bomb"],
        correctIndex: 1,
        explanation: "A keystroke logger records keyboard activity and sends those logs back to the hacker — useful for stealing passwords and other typed data.",
      },
      {
        question: "An infected machine behaves normally for weeks, then suddenly encrypts files the moment an employee opens a specific application. What technique does this describe?",
        options: [
          "A logic bomb, which stays dormant until a specific triggering event",
          "A worm, which always acts immediately on infection",
          "Spoofing, which only affects network identity",
          "A rootkit, which only hides files and never takes action",
        ],
        correctIndex: 0,
        explanation: "A logic bomb remains dormant until a triggering event — a date, a program launch, a typed keyword, or visiting a specific site — then launches. The delay itself is the defining feature.",
      },
      {
        question: "A hacker tricks a client into starting a session with the hacker's machine instead of the real server, then quietly relays traffic between both sides. What is this attack called?",
        options: ["Session hi-jacking", "A man-in-the-middle (MitM) attack", "Adware", "A rootkit"],
        correctIndex: 1,
        explanation: "A MitM attack inserts the hacker between client and server from the start of the session. Session hi-jacking is a related but different attack — it takes over a connection after the client has already authenticated.",
      },
    ],
  },
];

export function findQuiz(phaseSlug: string, weekSlug: string): Quiz | undefined {
  return quizzes.find((q) => q.phaseSlug === phaseSlug && q.weekSlug === weekSlug);
}
