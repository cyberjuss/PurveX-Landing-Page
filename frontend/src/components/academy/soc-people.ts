// The people on the SOC floor and what they will tell you. Everything they say
// about the environment has to match the course: the domain, the nine users,
// the one workstation, the service account, the Finance share and the critical
// departments all come from the Home Lab tabs. Change those and change this.
// The security team also share what gets a first SOC job: keep that advice
// concrete and true of the industry, not of this product.
//
// Outside facts and where they come from, so they can be rechecked:
// - Event IDs 4624/4625/4672/4720/4728/4732 match Week 4's tables; 4771 is the
//   DC-side failed Kerberos check that the lab's sync task collects alongside 4625.
// - The sync task (Build-Environment) sends a digest of selected Security events
//   about every minute, not the whole log.
// - MGM Resorts 2023 help desk reset: worded "reportedly", as in Week 4.
// - Business email compromise losses of about $2.8 billion: FBI IC3 2024 report.
// - Security+ on the US DoD approved list (DoD 8140); common in entry-level postings.
// Characters speak in contractions; the course prose does not. US spelling.

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
    hello: "You're the new analyst? Good. Walk the floor, meet the team, and ask your questions now, before you need the answers on a live ticket.",
    look: { skin: "#7a5238", hair: "#141012", shirt: "#e9e6df", jacket: "#22252d", trousers: "#1d2027", build: "fem", hairStyle: "bun" },
    topics: [
      {
        q: "What does this SOC protect?",
        a: "PurveX Financial. One Active Directory domain, purvexfinancial.local, with nine people across five departments. Three of those departments are critical: Compliance, Wealth Management, and Finance and Accounting. They hold client money and the records regulators check, so anything that touches them moves up your queue.",
      },
      {
        q: "How do escalations work here?",
        a: "You're Tier 1. You triage, gather the evidence and make a call: close it with a reason, or escalate it with a summary someone can act on without redoing your work. The Coach sits at Tier 2. If you're unsure, escalate, and say what you know and what you don't.",
      },
      {
        q: "What does a good ticket note look like?",
        a: "What fired, what you checked, what you found and what you decided, with times, usernames and hosts. Write it so the next shift can pick it up cold. \"Looked fine\" doesn't tell them anything.",
      },
      {
        q: "What do you look for when you hire?",
        a: "Judgment and writing. Can you tell a real problem from noise, and can you explain your call so someone else can act on it? I'd hire someone careful who writes a clear note over someone fast who doesn't.",
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
        a: "Almost nothing from people. The account you'll see at 2 AM is svc-backup-job, the nightly backup, and nobody's at a keyboard for that. If it signs in at 2 PM, or by Remote Desktop, or anything else turns up at 2 AM, that's when I start reading.",
      },
      {
        q: "Which alerts do you see most?",
        a: "Failed sign-ins. One or two is someone mistyping a password. Forty in a minute against one account is somebody guessing. If that account is alex.rivera, I escalate first and read second, because he's the only person in IT Admins.",
      },
      {
        q: "Any advice for a new analyst?",
        a: "Know the baseline cold. Nine users and one workstation, IT-WKS01, filed under the IT folder. If a ticket names a person or a machine that isn't on that list, you've already got a finding.",
      },
      {
        q: "What was your first SOC job like?",
        a: "Mostly reading. Logs, tickets, other people's notes. The people who moved up were the ones who asked why each alert fired, even the boring ones, and wrote down what they learned.",
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
        a: "The domain controller is dc01.purvexfinancial.local. It runs Active Directory and DNS, and a scheduled task sends Range a summary of its Security log. There's one client machine, IT-WKS01. In the hosted lab there's also an Ubuntu server beside the DC for the Linux work.",
      },
      {
        q: "Who has admin rights?",
        a: "Me. alex.rivera is the only person in IT Admins. Everyone else sits in one standard department group. If anyone else picks up an elevated group, treat it as a finding until someone shows you the ticket that approved it.",
      },
      {
        q: "What is svc-backup-job?",
        a: "The identity my backup job runs as. It lives in its own ServiceAccounts OU, and its password never expires on purpose, because a job can't type a new one. It should only sign in overnight. If it ever shows up in a staff group, that's leftover access, so tell me.",
      },
    ],
  },
  {
    id: "devon",
    team: "firm",
    name: "Devon Brooks",
    role: "Compliance Officer",
    where: "Near the coffee point",
    hello: "You're with security? Good. I'm the one who explains incidents to the regulator, so I like analysts who write things down.",
    look: { skin: "#e2c2a8", hair: "#6b4a2f", shirt: "#d8dde6", jacket: "#3a3f4b", trousers: "#2b2f38", build: "neutral", hairStyle: "long" },
    topics: [
      {
        q: "Why are some departments critical?",
        a: "Compliance, Wealth Management, and Finance and Accounting handle client accounts, payments and the records regulators audit. An incident there can mean telling a regulator or a client, not just fixing a laptop. That's why the same alert carries more risk on Sam Whitfield in Wealth Management than on Taylor Osei in Operations.",
      },
      {
        q: "What do you need from the SOC?",
        a: "Facts I can repeat to an auditor. What happened, when, which accounts, and what you did about it, with every time in one time zone. If you changed something, say so in the note.",
      },
      {
        q: "What should I watch in my first week?",
        a: "Access. People change roles and keep their old groups. When you set up a new starter by copying a colleague's groups, check the colleague first, because you copy their mistakes along with their access.",
      },
    ],
  },
  {
    id: "renee",
    team: "soc",
    name: "Renee Castillo",
    role: "Detection Engineer",
    where: "Left of the video wall",
    hello: "I write the rules that put alerts on that wall. If one's noisy, that's on me, so tell me.",
    look: { skin: "#c99a7a", hair: "#3a2a1e", shirt: "#2b2f38", trousers: "#4a4f5c", build: "fem", hairStyle: "bun" },
    topics: [
      {
        q: "Where do the alerts come from?",
        a: "From the domain controller's Security log. A scheduled task picks out the events that matter, like failed sign-ins, lockouts, new accounts and group changes, and sends them to Range. So most alerts you see began as one line in that log.",
      },
      {
        q: "Which event IDs should I learn first?",
        a: "4624 and 4625, a sign-in that worked and one that failed. 4720, an account was created. 4728 and 4732, someone was added to a group. 4672, a sign-in that got special privileges, usually an admin. And on a domain controller, a wrong password often shows up as 4771, a failed Kerberos check, not 4625. Learn what each looks like on a normal day.",
      },
      {
        q: "How do I stand out when I apply?",
        a: "Write up one investigation you actually did, start to finish, with screenshots. Hiring managers see plenty of course lists. A page showing how you went from an alert to a conclusion is rarer, and it gives them something to ask you about.",
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
        a: "People call or email the help desk: a locked account, a new starter, a share they can't open. I log the details and pass anything security-related to you. Read my note first. It usually says who asked, when, and what they said.",
      },
      {
        q: "Why is a password reset a security issue?",
        a: "Because whoever resets a password is, for that moment, the authentication system. If I reset an account for a caller I haven't verified, I've handed it to whoever was on the phone. That's reportedly how the 2023 MGM Resorts attack began: a call to the help desk.",
      },
      {
        q: "What should I know about your account?",
        a: "I'm a Help Desk Technician, but my account sits in IT Users, not Helpdesk. If a ticket assumes what I can reach from my job title, open my Member Of tab and check.",
      },
    ],
  },
  {
    id: "jordan",
    team: "firm",
    name: "Jordan Ellis",
    role: "Staff Accountant",
    where: "By the front windows",
    hello: "I'm in Finance and Accounting. Not technical, but I'm the person attackers write their emails to.",
    look: { skin: "#e2b896", hair: "#6b4a2f", shirt: "#eef0f4", jacket: "#3b3f4a", trousers: "#2b2f38", build: "masc", hairStyle: "short" },
    topics: [
      {
        q: "Why would anyone target Finance?",
        a: "We move money. An attacker who gets one of us to pay a fake invoice or change a supplier's bank details doesn't need malware. The FBI put losses to that kind of email fraud at about $2.8 billion in 2024 alone.",
      },
      {
        q: "Where does Finance keep its files?",
        a: "On a Finance share under C:\\PurveX on the domain controller. There's also a Finance Reports group. If someone outside Finance turns up with access to our files, ask why before you call it normal.",
      },
      {
        q: "What does a normal day look like for you?",
        a: "I sign in during office hours on weekdays and open the same few files. If you see me signing in at 3 AM, call me before you do anything else. If it wasn't me, you'll know fast.",
      },
    ],
  },
  {
    id: "grace",
    team: "soc",
    name: "Grace Mensah",
    role: "Senior Analyst, interview panel",
    where: "By the front windows",
    hello: "I sit on the panel that interviews new analysts. Ask me anything about getting hired.",
    look: { skin: "#4e3324", hair: "#16130f", shirt: "#e8dfd2", jacket: "#2b3d33", trousers: "#1b1e25", build: "fem", hairStyle: "curly" },
    topics: [
      {
        q: "What do interviews actually test?",
        a: "How you think when you're not sure. We hand you an alert and watch what you check first, what you ask, and when you escalate. \"I don't know, but here's how I'd find out\" is a strong answer. A confident guess usually isn't.",
      },
      {
        q: "What should be on my resume?",
        a: "Things you've done, with the tool and the result. \"Built a Windows domain and traced a password-guessing attack in its Security log\" says more than \"familiar with SIEM\". Link the write-up so we can read it.",
      },
      {
        q: "Do I need certifications?",
        a: "For a first SOC job, Security+ helps you get past the screening. Lots of entry-level postings list it, and it's on the US Department of Defense's approved list, so government contractors often require it. It won't get you the job on its own, so pair it with something you can show, like your Range portfolio.",
      },
    ],
  },
];

export const coworker = (id: string) => COWORKERS.find((c) => c.id === id);
