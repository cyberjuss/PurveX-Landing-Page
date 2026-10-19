// The people on the SOC floor and what they will tell you. Everything they say
// about the environment has to match the course: the domain, the nine users,
// the one workstation, the service account, the Finance share and the critical
// departments all come from the Home Lab tabs. Change those and change this.
// The security team also share what gets a first SOC job: keep that advice
// concrete and true of the industry, not of this product.

export type Topic = { q: string; a: string };
export type Build = "masc" | "fem" | "neutral";
export type HairStyle = "short" | "buzz" | "long" | "bun" | "curly";
export type Look = { skin: string; hair: string; shirt: string; jacket?: string; trousers: string; build?: Build; hairStyle?: HairStyle };
/** "soc": the security team, who also share what gets people hired. "firm": the rest of PurveX, who explain the environment from their side. */
export type Team = "soc" | "firm";
export type Coworker = { id: string; name: string; role: string; team: Team; where: string; hello: string; topics: Topic[]; look: Look };

export const COWORKERS: Coworker[] = [
  {
    id: "dana",
    team: "soc",
    name: "Dana Okafor",
    role: "SOC Manager",
    where: "By the video wall",
    hello: "You must be the new analyst. Walk the floor, meet the team, and ask your questions now, before you need the answers on a live ticket.",
    look: { skin: "#7a5238", hair: "#141012", shirt: "#e9e6df", jacket: "#22252d", trousers: "#1d2027", build: "fem", hairStyle: "bun" },
    topics: [
      {
        q: "What does this SOC protect?",
        a: "PurveX Financial. One Active Directory domain, purvexfinancial.local, with nine people across five departments. Three of those departments are critical: Compliance, Wealth Management, and Finance and Accounting. That is client money and regulatory exposure, so anything that touches them moves up your queue.",
      },
      {
        q: "How do escalations work here?",
        a: "You are Tier 1. You triage, gather the evidence, and make a call: close it with a reason, or escalate it with a summary someone can act on without redoing your work. The Coach sits at Tier 2. If you are unsure, escalate with what you know and what you do not.",
      },
      {
        q: "What does a good ticket note look like?",
        a: "What fired, what you checked, what you found, and what you decided. Times, usernames and hosts, written so the next shift can pick it up cold. \"Looked fine\" is not a finding.",
      },
      {
        q: "What do you look for when you hire?",
        a: "Judgment and writing. Can you tell signal from noise, and can you explain your call so someone else can act on it? I will take someone careful who writes a clear note over someone fast who does not.",
      },
    ],
  },
  {
    id: "marcus",
    team: "soc",
    name: "Marcus Hale",
    role: "Tier 1 Analyst, night shift",
    where: "At his desk",
    hello: "Hey. The queue is quiet for now, so ask away.",
    look: { skin: "#c99a7a", hair: "#3a2a1e", shirt: "#2f3e4f", trousers: "#23262d", build: "masc", hairStyle: "short" },
    topics: [
      {
        q: "What does normal look like at night?",
        a: "Almost nothing from people. The one account that logs on at 2 AM is svc-backup-job, the nightly backup. That is a service account, not a person. If it logs on at 2 PM, or anything else logs on at 2 AM, that is when I start reading.",
      },
      {
        q: "Which alerts do you see most?",
        a: "Failed logons, event 4625. One or two is someone mistyping a password. Forty in a minute against one account is somebody guessing. If that account is alex.rivera I escalate first and read second, because he is the only person in IT Admins.",
      },
      {
        q: "Any advice for a new analyst?",
        a: "Know the baseline cold. Nine users and one workstation, IT-WKS01, filed under the IT folder. If a ticket names a person or a machine that is not on that list, you already have a finding.",
      },
      {
        q: "What was your first SOC job like?",
        a: "Mostly reading. Logs, tickets, other people's notes. The analysts who moved up were the ones who asked why every alert fired, even the boring ones. Curiosity is most of the job.",
      },
    ],
  },
  {
    id: "alex",
    team: "firm",
    name: "Alex Rivera",
    role: "IT Systems Administrator",
    where: "By the server rack",
    hello: "Mind the rack, it holds up the whole firm. What do you need?",
    look: { skin: "#b07d5b", hair: "#1b1714", shirt: "#4a5563", trousers: "#2a2d34", build: "masc", hairStyle: "buzz" },
    topics: [
      {
        q: "What is on the network?",
        a: "The domain controller is dc01.purvexfinancial.local. It runs Active Directory and DNS, and it sends its Security log to Range on its own. There is one client machine, IT-WKS01. In the hosted lab there is also an Ubuntu server beside the DC for the Linux work.",
      },
      {
        q: "Who has admin rights?",
        a: "Me. alex.rivera is the only person in IT Admins. Everyone else sits in one standard department group. If you see anyone else pick up an elevated group, treat it as a finding until someone shows you the ticket that approved it.",
      },
      {
        q: "What is svc-backup-job?",
        a: "The identity my backup job runs as. It lives in its own ServiceAccounts OU, its password never expires on purpose, and it should only log on overnight. If it ever shows up in a staff group, that is leftover access. Tell me.",
      },
    ],
  },
  {
    id: "devon",
    team: "firm",
    name: "Devon Brooks",
    role: "Compliance Officer",
    where: "Near the coffee point",
    hello: "You are with security? Good. I am the one who explains incidents to the regulator, so I appreciate analysts who write things down.",
    look: { skin: "#e2c2a8", hair: "#6b4a2f", shirt: "#d8dde6", jacket: "#3a3f4b", trousers: "#2b2f38", build: "neutral", hairStyle: "long" },
    topics: [
      {
        q: "Why are some departments critical?",
        a: "Compliance, Wealth Management, and Finance and Accounting handle client accounts, money movement, and the records regulators audit. An incident there is not only an IT problem, it is a reporting problem. That is why the same alert carries more risk on Sam Whitfield than on Taylor Osei.",
      },
      {
        q: "What do you need from the SOC?",
        a: "Evidence I can stand behind. What happened, when, which accounts, and what you did about it, with every time in one time zone. If you changed something, say so in the note.",
      },
      {
        q: "What should I watch in my first week?",
        a: "Access. People change roles and keep their old groups. When you onboard someone by copying a peer's groups, check the peer first, because you copy their mistakes along with their access.",
      },
    ],
  },
  {
    id: "renee",
    team: "soc",
    name: "Renee Castillo",
    role: "Detection Engineer",
    where: "Left of the video wall",
    hello: "I write the rules that put alerts on that wall. If one is noisy, that is on me, so tell me.",
    look: { skin: "#c99a7a", hair: "#3a2a1e", shirt: "#2b2f38", trousers: "#4a4f5c", build: "fem", hairStyle: "bun" },
    topics: [
      {
        q: "Where do the alerts come from?",
        a: "The domain controller writes a Security log and sends it to Range on its own, within about a minute. Every alert you see starts as an event in that log: a failed sign-in, a new account, a change to a group.",
      },
      {
        q: "Which event IDs should I learn first?",
        a: "4624 and 4625, a sign-in that worked and one that failed. 4720, an account was created. 4728 and 4732, someone was added to a group. 4672, a sign-in with admin rights. Learn what each looks like on a normal day and the odd one stands out.",
      },
      {
        q: "How do I stand out when I apply?",
        a: "Show that you can find something, not that you have read about it. Write up one investigation from start to finish: what fired, what you checked, what you concluded. A short write-up with screenshots beats a long list of courses.",
      },
    ],
  },
  {
    id: "priya",
    team: "firm",
    name: "Priya Nair",
    role: "Help Desk Technician",
    where: "By the front windows",
    hello: "Most of your tickets start with me. Someone calls, I log it, and if it smells wrong it lands in your queue.",
    look: { skin: "#a87452", hair: "#16130f", shirt: "#c9d6e3", trousers: "#2b2f38", build: "fem", hairStyle: "long" },
    topics: [
      {
        q: "Where do tickets come from?",
        a: "People call or email the help desk: a locked account, a new starter, a share they cannot open. I log the details and pass anything security-related to you. Read my note first. It usually says who asked, when, and what they said.",
      },
      {
        q: "Why is a password reset a security issue?",
        a: "Because whoever resets a password is, for that moment, the authentication system. If I reset an account for a caller I have not verified, I hand the account to whoever was on the phone. Attackers know that, so a reset request is worth a second look.",
      },
      {
        q: "What should I know about your account?",
        a: "I am a Help Desk Technician, but my account sits in IT Users, not Helpdesk. Titles are not groups. If a ticket assumes what I can reach from my job title, open my Member Of tab instead.",
      },
    ],
  },
  {
    id: "jordan",
    team: "firm",
    name: "Jordan Ellis",
    role: "Staff Accountant",
    where: "By the front windows",
    hello: "I am in Finance and Accounting. Not technical, but I am the person attackers write their emails to.",
    look: { skin: "#e2b896", hair: "#6b4a2f", shirt: "#eef0f4", jacket: "#3b3f4a", trousers: "#2b2f38", build: "masc", hairStyle: "short" },
    topics: [
      {
        q: "Why would anyone target Finance?",
        a: "We move money. An attacker who gets one of us to pay a fake invoice or change a supplier's bank details does not need malware at all. That is why Finance and Accounting is one of the three critical departments here.",
      },
      {
        q: "Where does Finance keep its files?",
        a: "On a Finance share under C:\\PurveX on the domain controller. There is also a Finance Reports group. If someone outside Finance turns up with access to our files, ask why before you call it normal.",
      },
      {
        q: "What does a normal day look like for you?",
        a: "I sign in during office hours on weekdays and open the same few files. A sign-in as me at 3 AM, or one I cannot explain, is worth a phone call to me before anything else.",
      },
    ],
  },
  {
    id: "grace",
    team: "soc",
    name: "Grace Mensah",
    role: "Senior Analyst, interview panel",
    where: "By the front windows",
    hello: "I sit on the panel that interviews new analysts. Ask me anything about getting through the door.",
    look: { skin: "#4e3324", hair: "#16130f", shirt: "#e8dfd2", jacket: "#2b3d33", trousers: "#1b1e25", build: "fem", hairStyle: "curly" },
    topics: [
      {
        q: "What do interviews actually test?",
        a: "How you think when you are not sure. We hand you an alert and watch what you check first, what you ask, and when you escalate. \"I don't know, but here is how I would find out\" is a strong answer. A confident guess is a weak one.",
      },
      {
        q: "What should be on my CV?",
        a: "Evidence. The labs you finished, the lab you built, an investigation you wrote up, with the tools you used and what you found. \"Built a Windows domain and traced a password-guessing attack in its Security log\" says more than \"familiar with SIEM\".",
      },
      {
        q: "Do I need certifications?",
        a: "For a first SOC job, Security+ helps you get past the screening, and plenty of postings ask for it. It will not get you the job on its own. Pair it with something you can show, like your Range portfolio or a write-up of a lab.",
      },
    ],
  },
];

export const coworker = (id: string) => COWORKERS.find((c) => c.id === id);
