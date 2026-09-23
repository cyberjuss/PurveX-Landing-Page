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
    phaseSlug: "phase-0",
    weekSlug: "week-1",
    questions: [
      {
        question: "A user says \"the internet is down.\" What is the right next move?",
        options: [
          "Reboot their machine immediately",
          "Ask specific questions to pin down the actual symptom before doing anything",
          "Reset their password, since that fixes most tickets",
          "Escalate immediately, since network issues are never Help Desk's job",
        ],
        correctIndex: 1,
        explanation: "Users describe the effect, not the cause, and their guess at the cause is usually wrong. \"The internet is down\" could mean a browser can't resolve a hostname, Outlook won't send, or the whole machine lost its network connection. You can't know which until you ask.",
      },
      {
        question: "Why is \"what changed?\" considered the single highest-value troubleshooting question?",
        options: [
          "It is not that useful, most problems have no clear cause",
          "A working system that breaks almost always broke because something changed, so finding that change usually finds the cause",
          "It only matters for security investigations, not routine tickets",
          "It replaces the need to test a theory before making a fix",
        ],
        correctIndex: 1,
        explanation: "A system working yesterday and broken today has a cause, and that cause is almost always something that changed in between: an update, an expired password, a moved cable, a policy push. If the user is not aware of any change, that itself points toward something changing upstream.",
      },
      {
        question: "Why test a theory before making a change, instead of just trying a fix and seeing if it works?",
        options: [
          "Testing wastes time compared to just trying fixes",
          "An unconfirmed guess can take several attempts, while a confirmed cause usually takes one fix, and you actually know what fixed it",
          "It is only necessary on servers, never on a single user's machine",
          "Users expect to see you working, so testing first looks unresponsive",
        ],
        correctIndex: 1,
        explanation: "Applying fixes without confirming the cause first means you might fix the wrong thing, or fix several things at once without knowing which one actually worked, so the same symptom returns later with no lead on the real cause.",
      },
      {
        question: "\"Fixed printer issue\" is a complete example of what a Help Desk ticket note should contain. True or false?",
        options: [
          "True, brevity is what tickets are supposed to be",
          "False, a good note needs the specific symptom, what was checked, what was changed, and how it was confirmed fixed",
          "True, as long as the ticket is marked resolved",
          "False, but only because it is missing a timestamp",
        ],
        correctIndex: 1,
        explanation: "A vague note like \"fixed printer issue\" tells the next person nothing: which printer, what was wrong, what was actually done, or whether it is really fixed. A useful note records the real symptom, what was checked (including things ruled out), what changed, and how it was verified from the user's side.",
      },
      {
        question: "A user is locked out right after changing their password. Failed logon attempts (Event ID 4625) keep appearing every 15 minutes from the user's own phone, even after you unlock the account. What is most likely happening?",
        options: [
          "The user is lying about changing their password",
          "The user's phone still has the old password saved and is silently retrying it, relocking the account",
          "This always means the account is compromised and must be disabled immediately",
          "Event ID 4625 only appears for successful logons, so this is unrelated",
        ],
        correctIndex: 1,
        explanation: "A device with a saved old credential (a phone mail profile, a mapped drive, a scheduled task) will keep retrying automatically without the user realizing it, relocking the account shortly after every unlock. The fix is not just unlocking the account, it is updating the stale credential on that device too.",
      },
    ],
  },
  {
    phaseSlug: "phase-1",
    weekSlug: "week-1",
    questions: [
      {
        question: "A DDoS attack takes a company's web server offline for six hours. Which leg of the CIA triad did this attack break?",
        options: ["Confidentiality", "Integrity", "Availability", "Accountability"],
        correctIndex: 2,
        explanation: "Availability means authorized users can reach systems and data when they need to. Knocking a server offline does not expose or alter data. It just makes the data unreachable, which is an availability failure.",
      },
      {
        question: "An attacker does not steal or change anything, but quietly intercepts unencrypted traffic and reads a customer's SSN as it crosses the network. Which CIA property is broken?",
        options: ["Confidentiality", "Integrity", "Availability", "None, because nothing was changed"],
        correctIndex: 0,
        explanation: "Confidentiality is about who is allowed to see data. Reading data an analyst was not authorized to see is a confidentiality breach even without modifying or deleting anything.",
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
        explanation: "The lesson's own rule: no threat = no risk, even if the vulnerability exists. Risk requires a realistic path for a threat to actually reach and exploit the vulnerability.",
      },
      {
        question: "Which of these is a control for integrity rather than confidentiality?",
        options: ["Access control lists", "Encryption", "Digital signatures / checksums", "Need-to-know policies"],
        correctIndex: 2,
        explanation: "Digital signatures and checksums prove data has not been tampered with. That is integrity. Encryption and access control lists are the classic confidentiality controls.",
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
        explanation: "Two separate handshakes, back to back: TCP's three-way handshake establishes the connection, then TLS does its own handshake to agree on encryption keys before real data moves.",
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
        explanation: "The login and session-only requests did not expose anything tamperable. The account-update request's response happened to include the `roleid` field. That is what made it discoverable, and in turn, editable.",
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
        explanation: "Critical here means the data at stake: PII, account/portfolio data, GLBA/SOX-regulated material, or the org's own finances. IT has elevated system access but does not itself hold that regulated or client data.",
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
    ],
  },
];

export function findQuiz(phaseSlug: string, weekSlug: string): Quiz | undefined {
  return quizzes.find((q) => q.phaseSlug === phaseSlug && q.weekSlug === weekSlug);
}
