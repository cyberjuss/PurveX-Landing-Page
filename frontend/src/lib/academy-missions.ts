import type { Results, Skill } from "@/lib/academy-score";
import { PROOF_TICKETS } from "@/lib/academy-proof";

export type MissionCatalogEntry = {
  id: string;
  challenge:
    | "day-one"
    | "ticket-queue"
    | "client-data"
    | "credential-campaign"
    | "phishing-chain"
    | "open-door"
    | "keys-to-the-domain"
    | "document-the-five-ws"
    | "default-posture"
    | "trigger-a-real-detection"
    | "read-a-process-tree"
    | "one-timeline-two-machines"
    | "turn-on-script-logging"
    | "confirm-the-map"
    | "trace-persistence"
    | "access-outlier"
    | "overnight-alert"
    | "lockout-threshold"
    | "build-out-directory"
    | "new-hire-week"
    | "weekend-incident-report"
    | "tuesday-after-breach"
    | "network-change"
    | "access-review";
  title: string;
  prompt: string;
  skill: Skill;
};

// Questions and titles only — never flags or explanations. The coach uses
// this to know what a mission asked, not how to solve it.
export const MISSION_CATALOG: Record<string, MissionCatalogEntry> = {
  "d1-01": {
    id: "d1-01",
    challenge: "day-one",
    title: "Which Group Is Jordan In?",
    prompt: "Which department group is jordan.ellis in?",
    skill: "accounts",
  },
  "d1-02": {
    id: "d1-02",
    challenge: "day-one",
    title: "Who Is an Admin?",
    prompt: "Find who has admin rights in the directory.",
    skill: "accounts",
  },
  "d1-03": {
    id: "d1-03",
    challenge: "day-one",
    title: "Where Are the Access Groups?",
    prompt: "Find where the access groups live in the directory.",
    skill: "directory",
  },
  "d1-04": {
    id: "d1-04",
    challenge: "day-one",
    title: "The Folder That Is Not an OU",
    prompt: "Spot the default folder that is not an OU.",
    skill: "directory",
  },
  "d1-05": {
    id: "d1-05",
    challenge: "day-one",
    title: "What Is the Admin Group For?",
    prompt: "Read a description on an admin group.",
    skill: "accounts",
  },
  "d1-06": {
    id: "d1-06",
    challenge: "day-one",
    title: "Is Priya on the Help Desk Group?",
    prompt: "Decide whether a job title means group membership.",
    skill: "accounts",
  },
  "d1-07": {
    id: "d1-07",
    challenge: "day-one",
    title: "Who Is the Settlements Coordinator?",
    prompt: "Find an account by title.",
    skill: "accounts",
  },
  "d1-08": {
    id: "d1-08",
    challenge: "day-one",
    title: "What Is the Workstation Called?",
    prompt: "Find a computer object in the directory.",
    skill: "directory",
  },
  "d1-09": {
    id: "d1-09",
    challenge: "day-one",
    title: "How Many People Are in Compliance?",
    prompt: "Count members of a group.",
    skill: "accounts",
  },
  "d1-10": {
    id: "d1-10",
    challenge: "day-one",
    title: "How Many Departments Are There?",
    prompt: "Count departments in the lab.",
    skill: "directory",
  },
  "tq-01": {
    id: "tq-01",
    challenge: "ticket-queue",
    title: "Missing Announcements (INC-1041)",
    prompt: "Jamie Torres is not getting company-wide email. Find the firm-wide announcement group, add her if she is missing, then report how many members it has.",
    skill: "accounts",
  },
  "tq-02": {
    id: "tq-02",
    challenge: "ticket-queue",
    title: "Locked Out (INC-1042)",
    prompt: "Riley Kwan cannot sign in and thinks she is locked out. Open the account before you act. Restore sign-in if needed, then report what was actually wrong, locked or disabled.",
    skill: "troubleshooting",
  },
  "tq-03": {
    id: "tq-03",
    challenge: "ticket-queue",
    title: "New Hire Access (INC-1043)",
    prompt: "Create Casey Reed with IT Users only and clean out anyone who is not a current IT person. Read the leftover intern Description before you delete it and report the ticket number written there.",
    skill: "accounts",
  },
  "tq-04": {
    id: "tq-04",
    challenge: "ticket-queue",
    title: "The Backup Account (INC-1044)",
    prompt: "Auditors need a written run window on svc-backup-job. Find the approved hours on the folder that holds the account, write them on Description, then report the window you wrote.",
    skill: "troubleshooting",
  },
  "tq-05": {
    id: "tq-05",
    challenge: "ticket-queue",
    title: "The Transfer That Did Not Happen (INC-1045)",
    prompt: "HR transferred Taylor Osei to Compliance. Move the account and switch the groups, then report the title still on the account.",
    skill: "troubleshooting",
  },
  "tq-11": {
    id: "tq-11",
    challenge: "ticket-queue",
    title: "Contractor Offboarding (INC-1047)",
    prompt: "A contractor's engagement has ended. Disable kai.mendes and remove the account's access while keeping it for records, then report the sponsor named on the account.",
    skill: "accounts",
  },
  "tq-12": {
    id: "tq-12",
    challenge: "ticket-queue",
    title: "Admin Rights Request (INC-1048)",
    prompt: "Sam Whitfield asks to be added to Server Admins to install software. Read the group's Description before deciding, then report the access level it grants.",
    skill: "security",
  },
  "tq-13": {
    id: "tq-13",
    challenge: "ticket-queue",
    title: "Audit Finding (INC-1049)",
    prompt: "An auditor found a staff account whose password never expires. Find it among the accounts with that setting, clear it, and report the username.",
    skill: "security",
  },
  "tq-14": {
    id: "tq-14",
    challenge: "ticket-queue",
    title: "New Laptop Missing Policies (INC-1050)",
    prompt: "Jordan's new laptop FIN-LT14 is not getting Finance policies. Find where it landed, move it to the Finance workstations OU, and report the folder it was sitting in.",
    skill: "directory",
  },
  "tq-15": {
    id: "tq-15",
    challenge: "ticket-queue",
    title: "Group Cannot Open the Share (INC-1051)",
    prompt: "Members of Finance Reports cannot open the reports share. Find why the group grants nothing, fix it, and report how many members it has.",
    skill: "accounts",
  },
  "tq-16": {
    id: "tq-16",
    challenge: "ticket-queue",
    title: "Share Will Not Open by Name (INC-1052)",
    prompt: "Staff can reach the file share by IP address but not by the name files. Find what the name resolves to, point it back at the domain controller, and report the wrong address.",
    skill: "troubleshooting",
  },
  // The hardening tickets. Unlike the others nothing is planted for these:
  // the domain ships this way, which is the point. A real estate is not
  // broken, it is unfinished, and the work is noticing that and closing it.
  "tq-21": {
    id: "tq-21",
    challenge: "ticket-queue",
    title: "Nothing Stops Password Guessing (INC-1059)",
    prompt: "Security found the domain never locks an account, however many times a password is wrong. Set a lockout policy of 10 tries or fewer with a lock of at least 15 minutes, then report the event ID a domain controller writes when an account is locked out.",
    skill: "security",
  },
  "tq-22": {
    id: "tq-22",
    challenge: "ticket-queue",
    title: "No Record of What Ran (INC-1060)",
    prompt: "An investigation stalled because nothing on the domain controller records which programs were started. Turn on auditing for process creation, then report the event ID that records a new process.",
    skill: "security",
  },
  "tq-23": {
    id: "tq-23",
    challenge: "ticket-queue",
    title: "The Security Log Runs Out (INC-1061)",
    prompt: "The Security log is overwriting itself within days, so last week's sign-ins are already gone. Raise its maximum size to at least 512 MB, then report the size in MB it was set to before you changed it.",
    skill: "security",
  },
  "tq-24": {
    id: "tq-24",
    challenge: "ticket-queue",
    title: "Admins Under the Same Rules as Everyone (INC-1062)",
    prompt: "Accounts that can change the domain are held to the same password rules as everyone else. Apply a fine-grained password policy of at least 16 characters, locking after 5 tries or fewer, to the IT administrators group. Then report the group you applied it to.",
    skill: "security",
  },
  "tq-25": {
    id: "tq-25",
    challenge: "ticket-queue",
    title: "A Workstation Nobody Uses (INC-1063)",
    prompt: "Operations says a workstation in their folder was decommissioned and never retired in the directory. Find it, read its Description, disable it without deleting it, and report the ticket number written there.",
    skill: "directory",
  },
  "tq-20": {
    id: "tq-20",
    challenge: "ticket-queue",
    title: "Payroll Works for Some People (INC-1056)",
    prompt: "The payroll portal times out for some people and works for others. Find why the name resolves differently between attempts, remove the stale record, and report its address.",
    skill: "troubleshooting",
  },
  "tq-17": {
    id: "tq-17",
    challenge: "ticket-queue",
    title: "Vendor Remote Access Left Open (INC-1053)",
    prompt: "A firewall rule opened for a vendor visit is still allowing remote access to the domain controller. Find it, disable it, and report the port it allowed.",
    skill: "security",
  },
  "tq-18": {
    id: "tq-18",
    challenge: "ticket-queue",
    title: "Screens That Never Lock (INC-1054)",
    prompt: "Finance screens never lock while Operations screens lock early. Find the screen lock GPO, link it to Finance, remove the wrong link, and report the OU it was linked to.",
    skill: "directory",
  },
  "tq-19": {
    id: "tq-19",
    challenge: "ticket-queue",
    title: "The Invoice Nobody Saved (INC-1055)",
    prompt: "An unknown invoice file appeared on the Finance share. Find it, move it to quarantine without opening it, and report its full name with every extension.",
    skill: "security",
  },
  "zt-01": {
    id: "zt-01",
    challenge: "open-door",
    title: "Find What It Actually Trusts (INC-1067)",
    prompt: "Find the inbound rule on the domain controller that trusts the whole network just for being inside it.",
    skill: "security",
  },
  "zt-02": {
    id: "zt-02",
    challenge: "open-door",
    title: "Close It (INC-1067)",
    prompt: "Disable the legacy internal-trust rule and report the port it allowed.",
    skill: "security",
  },
  "cp-03": {
    id: "cp-03",
    challenge: "credential-campaign",
    title: "What They Left Running (INC-1069)",
    prompt: "Find the unexplained scheduled task on the domain controller and name it.",
    skill: "security",
  },
  "cp-04": {
    id: "cp-04",
    challenge: "credential-campaign",
    title: "Close Its Channel (INC-1069)",
    prompt: "Find and disable the outbound rule the task relies on, then report the port.",
    skill: "security",
  },
  "cc-11": {
    id: "cc-11",
    challenge: "credential-campaign",
    title: "Write the Detection (INC-1072)",
    prompt: "Write the KQL summarize clause that flags a password spray by counting distinct accounts per source.",
    skill: "logs",
  },
  "cc-12": {
    id: "cc-12",
    challenge: "credential-campaign",
    title: "Name the Stage That Never Happened",
    prompt: "Name the Cyber Kill Chain stage after Command and Control that this campaign never reached.",
    skill: "security",
  },
  "tq-06": {
    id: "tq-06",
    challenge: "credential-campaign",
    title: "The 2 AM Login (INC-1046)",
    prompt: "Alex logged in at 2 AM from WM-WKS07. Which department OU holds that computer?",
    skill: "security",
  },
  "tq-07": {
    id: "tq-07",
    challenge: "credential-campaign",
    title: "Read the Log (INC-1046)",
    prompt: "How many failed logons (4625) happen before the first successful logon (4624)?",
    skill: "logs",
  },
  "tq-08": {
    id: "tq-08",
    challenge: "credential-campaign",
    title: "Why the Privileges? (INC-1046)",
    prompt: "Which of Alex's groups explains why the session received special privileges?",
    skill: "security",
  },
  "tq-09": {
    id: "tq-09",
    challenge: "credential-campaign",
    title: "Mistake or Attack? (INC-1046)",
    prompt: "Choose the best explanation for the incident.",
    skill: "security",
  },
  "tq-10": {
    id: "tq-10",
    challenge: "credential-campaign",
    title: "Your First Move (INC-1046)",
    prompt: "Choose the best first response move.",
    skill: "security",
  },
  "cd-01": { id: "cd-01", challenge: "client-data", title: "Where the Numbers Live", prompt: "Find the file on the shares that holds client Social Security numbers.", skill: "security" },
  "cd-02": { id: "cd-02", challenge: "client-data", title: "Counting the Book", prompt: "Count the clients in the client register.", skill: "security" },
  "cd-03": { id: "cd-03", challenge: "client-data", title: "Waiting on Paperwork", prompt: "Count the KYC reviews still awaiting documents.", skill: "security" },
  "cd-04": { id: "cd-04", challenge: "client-data", title: "One Signature on Every Payment", prompt: "Find who approved the vendor payments.", skill: "security" },
  "cd-05": { id: "cd-05", challenge: "client-data", title: "The Batch That Did Not Balance", prompt: "Find the settlement batch that did not reconcile.", skill: "security" },
  "cd-06": { id: "cd-06", challenge: "client-data", title: "Fingerprint the Register", prompt: "Take the SHA-256 hash of the client register.", skill: "security" },
  "cd-07": { id: "cd-07", challenge: "client-data", title: "Who Can Read the Register", prompt: "Build a least-privilege reader group and name the group the share lets read it today.", skill: "accounts" },
  "sm2-01": { id: "sm2-01", challenge: "document-the-five-ws", title: "Read the Sub Status (INC-1128)", prompt: "Report the Sub Status code a real 4625 records for a wrong password.", skill: "logs" },
  "sm2-05": { id: "sm2-05", challenge: "document-the-five-ws", title: "Read Several Events Together (INC-1129)", prompt: "Say what five 0xC0000064 failures against five account names most likely means.", skill: "security" },
  "sm2-02": { id: "sm2-02", challenge: "document-the-five-ws", title: "Name the Field (INC-1130)", prompt: "Name which of the 5 W's the Sub Status field answers.", skill: "security" },
  "sm2-03": { id: "sm2-03", challenge: "default-posture", title: "Read the Default Outbound Action (INC-1131)", prompt: "Report a domain controller's actual default outbound firewall action.", skill: "security" },
  "sm2-06": { id: "sm2-06", challenge: "default-posture", title: "Trace a Consequence (INC-1132)", prompt: "Say whether a Block-by-default outbound posture would have stopped an unapproved beacon.", skill: "security" },
  "sm2-04": { id: "sm2-04", challenge: "default-posture", title: "Name the Trade-Off (INC-1133)", prompt: "Explain what the inbound-Block, outbound-Allow default split actually trades off.", skill: "security" },
  "sm-01": { id: "sm-01", challenge: "overnight-alert", title: "Check the Record Before You React (INC-1065)", prompt: "Read an account's own Description field to find its one authorized workstation.", skill: "security" },
  "sm-02": { id: "sm-02", challenge: "overnight-alert", title: "Classify What You Actually Found (INC-1065)", prompt: "Classify a sign-in that matches its approved time window but not its approved workstation.", skill: "security" },
  "mw2-03": { id: "mw2-03", challenge: "trigger-a-real-detection", title: "Read the Threat Name (INC-1134)", prompt: "Report the threat name Windows Defender reports for an EICAR test file.", skill: "security" },
  "mw2-05": { id: "mw2-05", challenge: "trigger-a-real-detection", title: "Weigh Two Verdicts (INC-1135)", prompt: "Say which verdict an analyst should trust more between one engine and a multi-engine lookup.", skill: "security" },
  "mw2-04": { id: "mw2-04", challenge: "trigger-a-real-detection", title: "Know the Limit of Signature Matching (INC-1136)", prompt: "Say what a never-before-seen file means for signature-based antivirus alone.", skill: "security" },
  "mw2-01": { id: "mw2-01", challenge: "read-a-process-tree", title: "Read the Command Line (INC-1137)", prompt: "Report the remote address and port a hidden PowerShell command is reaching.", skill: "logs" },
  "mw2-06": { id: "mw2-06", challenge: "read-a-process-tree", title: "Weigh the Parent Process (INC-1138)", prompt: "Say what a different parent process would change about reading a suspicious command.", skill: "security" },
  "mw2-07": { id: "mw2-07", challenge: "read-a-process-tree", title: "Find the Persistence Mechanism (INC-1139)", prompt: "Name the scheduled task relaunching a suspicious hidden PowerShell command.", skill: "logs" },
  "mw2-02": { id: "mw2-02", challenge: "read-a-process-tree", title: "Contain Without Destroying Evidence (INC-1140)", prompt: "Disable the malicious scheduled task and report its new state.", skill: "security" },
  "la2-01": { id: "la2-01", challenge: "one-timeline-two-machines", title: "Name the Process (INC-1141)", prompt: "Name the process journalctl credits with accepting an SSH sign-in.", skill: "logs" },
  "la2-05": { id: "la2-05", challenge: "one-timeline-two-machines", title: "Read a Pattern, Not Just an Event (INC-1142)", prompt: "Say what an unfamiliar DC-then-SSH sign-in pattern suggests for one account.", skill: "logs" },
  "la2-02": { id: "la2-02", challenge: "one-timeline-two-machines", title: "Name What a Single Log Would Miss (INC-1143)", prompt: "Say what reading only the domain controller's log would miss.", skill: "logs" },
  "la2-03": { id: "la2-03", challenge: "turn-on-script-logging", title: "Find the Script-Block Event (INC-1144)", prompt: "Name the Event ID that logs the full text of a PowerShell script block.", skill: "logs" },
  "la2-06": { id: "la2-06", challenge: "turn-on-script-logging", title: "Find What Process Creation Would Miss (INC-1145)", prompt: "Name the log that shows a decoded, readable command instead of a raw encoded argument.", skill: "logs" },
  "la2-04": { id: "la2-04", challenge: "turn-on-script-logging", title: "Know What Survives Obfuscation (INC-1146)", prompt: "Say what script-block logging captures once PowerShell decodes and runs an encoded command.", skill: "logs" },
  "nm-01": { id: "nm-01", challenge: "confirm-the-map", title: "Confirm a Known Port (INC-1147)", prompt: "Confirm the port Kerberos is listening on right now.", skill: "security" },
  "nm-03": { id: "nm-03", challenge: "confirm-the-map", title: "Name a Port You Depend On (INC-1148)", prompt: "Name the service listening on port 9389 and why it matters.", skill: "security" },
  "nm-02": { id: "nm-02", challenge: "confirm-the-map", title: "Draw the Conclusion (INC-1149)", prompt: "Say what ports beyond a lesson's five-port summary tell you about working from memory.", skill: "security" },
  "bt-01": { id: "bt-01", challenge: "access-outlier", title: "Build the Baseline (INC-1066)", prompt: "Compare four peer accounts' real group membership and find the one that does not match.", skill: "security" },
  "bt-02": { id: "bt-02", challenge: "access-outlier", title: "Name the Extra Access (INC-1066)", prompt: "Name the group the outlier account has that its peers do not.", skill: "security" },
  "bt-03": { id: "bt-03", challenge: "access-outlier", title: "Fix the Baseline (INC-1066)", prompt: "Remove the outlier account from the extra group and confirm it.", skill: "security" },
  "th-01": { id: "th-01", challenge: "lockout-threshold", title: "Wealth Management Needs Its Own Threshold (INC-1068)", prompt: "Apply a Fine-Grained Password Policy to Wealth Management Users and report the lockout threshold set.", skill: "security" },
  "tr-01": { id: "tr-01", challenge: "trace-persistence", title: "Name the Technique (INC-1150)", prompt: "Name the ATT&CK technique ID for a relaunching scheduled task with no owner.", skill: "logs" },
  "tr-02": { id: "tr-02", challenge: "trace-persistence", title: "Scope the Query (INC-1150)", prompt: "Write the where clause that scopes a persistence detection to the last 7 days.", skill: "logs" },
  "tr-03": { id: "tr-03", challenge: "trace-persistence", title: "Aggregate the Launches (INC-1150)", prompt: "Write the summarize line counting hidden-window launches per device per day.", skill: "logs" },
  "tr-04": { id: "tr-04", challenge: "trace-persistence", title: "Name the Threshold (INC-1150)", prompt: "Write the let line naming a threshold of 20 launches a day.", skill: "logs" },
  "tr-05": { id: "tr-05", challenge: "trace-persistence", title: "Set the Escalation (INC-1150)", prompt: "Name the priority and severity this detection should fire as.", skill: "logs" },
  "tr-06": { id: "tr-06", challenge: "trace-persistence", title: "Measure the Real Interval (INC-1150)", prompt: "Read the task's own repetition interval off the domain controller and report it in minutes.", skill: "logs" },
  "tr-07": { id: "tr-07", challenge: "trace-persistence", title: "Prove the Threshold Tells Them Apart (INC-1150)", prompt: "Say which of two device summaries the finished detection actually fires on.", skill: "logs" },
  "tr-08": { id: "tr-08", challenge: "trace-persistence", title: "Close What's Still Open (INC-1150)", prompt: "Disable the outbound firewall rule the task depended on and confirm it is off.", skill: "logs" },
  "sl-01": {
    id: "sl-01",
    challenge: "credential-campaign",
    title: "Count the Spray (INC-1072)",
    prompt: "Find the accounts that each received a failed sign-in within the same short window, and count them.",
    skill: "security",
  },
  "sl-02": {
    id: "sl-02",
    challenge: "credential-campaign",
    title: "The One That Got Through (INC-1072)",
    prompt: "One account signed in successfully with no failed attempts before it at all. Name it.",
    skill: "security",
  },
  "sl-03": {
    id: "sl-03",
    challenge: "credential-campaign",
    title: "Unlock the Real Lockout (INC-1072)",
    prompt: "Find the account the log shows was actually locked out, unlock it, and report its name.",
    skill: "security",
  },
  "rc-01": {
    id: "rc-01",
    challenge: "phishing-chain",
    title: "Four Names That Were Never Real (INC-1073)",
    prompt: "Count the failed sign-ins whose status code says the account does not exist, not that the password was wrong.",
    skill: "security",
  },
  "dl-01": {
    id: "dl-01",
    challenge: "phishing-chain",
    title: "Find the Disguise (INC-1074)",
    prompt: "Find the disguised attachment on the Wealth Management share and report its full name.",
    skill: "security",
  },
  "pc-03": {
    id: "pc-03",
    challenge: "phishing-chain",
    title: "Hash It and Check It (INC-1074)",
    prompt: "Hash the disguised attachment with SHA-256 and check that hash on VirusTotal.",
    skill: "security",
  },
  "pi-01": {
    id: "pi-01",
    challenge: "phishing-chain",
    title: "Find What Got Planted (INC-1075)",
    prompt: "Find the scheduled task nobody on the team created, and report its exact name.",
    skill: "security",
  },
  "pc-05": {
    id: "pc-05",
    challenge: "phishing-chain",
    title: "Capture the Beacon Live (INC-1075)",
    prompt: "Capture the task's own outbound connection in Wireshark and report the destination port.",
    skill: "logs",
  },
  "pi-02": {
    id: "pi-02",
    challenge: "phishing-chain",
    title: "Close Its Channel (INC-1075)",
    prompt: "Find and disable the outbound firewall rule the task relies on, then report the port.",
    skill: "security",
  },
  "ao-01": {
    id: "ao-01",
    challenge: "phishing-chain",
    title: "Find What Got Collected (INC-1076)",
    prompt: "Find the file staged on the IT share that has no business being there, and report its name.",
    skill: "security",
  },
  "ao-02": {
    id: "ao-02",
    challenge: "phishing-chain",
    title: "Take It Off the Share (INC-1076)",
    prompt: "Move the staged file to Quarantine, then report the folder it is in now.",
    skill: "security",
  },
  "pc-10": {
    id: "pc-10",
    challenge: "phishing-chain",
    title: "Two Chains and One Pattern",
    prompt: "Name the one Kill Chain stage both this phase's campaigns reached and were stopped at.",
    skill: "security",
  },
  "od-02": {
    id: "od-02",
    challenge: "open-door",
    title: "Prove It Is Being Used (INC-1067)",
    prompt: "Find a real Logon Type 3 event crossing the open rule and report the logon type number.",
    skill: "logs",
  },
  "od-04": {
    id: "od-04",
    challenge: "open-door",
    title: "What They Left Behind (INC-1077)",
    prompt: "Find the scheduled task nobody on the team created, and report its exact name.",
    skill: "security",
  },
  "od-05": {
    id: "od-05",
    challenge: "open-door",
    title: "Close Its Channel (INC-1077)",
    prompt: "Find and disable the outbound firewall rule the task relies on, then report the port.",
    skill: "security",
  },
  "od-06": {
    id: "od-06",
    challenge: "open-door",
    title: "Find What They Were After (INC-1078)",
    prompt: "Find the file staged on the Compliance share that has no business being there, and report its name.",
    skill: "security",
  },
  "od-07": {
    id: "od-07",
    challenge: "open-door",
    title: "Take It Off the Share (INC-1078)",
    prompt: "Move the staged file to Quarantine, then report the folder it is in now.",
    skill: "security",
  },
  "od-08": {
    id: "od-08",
    challenge: "open-door",
    title: "No Delivery and No Problem",
    prompt: "Explain why this campaign never had a Delivery stage.",
    skill: "security",
  },
  "od-09": {
    id: "od-09",
    challenge: "open-door",
    title: "Three Campaigns and One Rule",
    prompt: "Name the one control that would have stopped all three campaigns' beacons.",
    skill: "security",
  },
  "rk-01": {
    id: "rk-01",
    challenge: "keys-to-the-domain",
    title: "Read the Ticket Request (INC-1079)",
    prompt: "Find the Kerberos service ticket request for svc-reports and report its encryption type.",
    skill: "logs",
  },
  "rk-02": {
    id: "rk-02",
    challenge: "keys-to-the-domain",
    title: "Find the Account Behind It (INC-1079)",
    prompt: "Find the SPN registered on svc-reports and report it.",
    skill: "security",
  },
  "rk-04": {
    id: "rk-04",
    challenge: "keys-to-the-domain",
    title: "Check What Let This Happen (INC-1079)",
    prompt: "Read msDS-SupportedEncryptionTypes on svc-reports and report its raw value.",
    skill: "security",
  },
  "rk-03": {
    id: "rk-03",
    challenge: "keys-to-the-domain",
    title: "Close the Attack Surface (INC-1079)",
    prompt: "Remove the unneeded SPN from svc-reports and report how many are left.",
    skill: "security",
  },
  "rk-05": {
    id: "rk-05",
    challenge: "keys-to-the-domain",
    title: "Turn On the Audit That Would Catch It (INC-1080)",
    prompt: "Enable Directory Service Access auditing and report the event ID it would log.",
    skill: "security",
  },
  "rk-06": {
    id: "rk-06",
    challenge: "keys-to-the-domain",
    title: "Know What You Are Looking For (INC-1080)",
    prompt: "Choose the detail that tells a real DCSync request apart from normal replication.",
    skill: "security",
  },
  "rk-07": {
    id: "rk-07",
    challenge: "keys-to-the-domain",
    title: "Rule Out the Legitimate Case First (INC-1080)",
    prompt: "Name the one account that legitimately has replication rights in this lab.",
    skill: "security",
  },
  "rk-08": {
    id: "rk-08",
    challenge: "keys-to-the-domain",
    title: "Read the Richer Log",
    prompt: "Find the Sysmon Process Creation event for klist.exe and report its parent process.",
    skill: "logs",
  },
  "rk-09": {
    id: "rk-09",
    challenge: "keys-to-the-domain",
    title: "Two Techniques and No Malware",
    prompt: "Name what Kerberoasting and DCSync both abuse to work at all.",
    skill: "security",
  },
  "dr-01": {
    id: "dr-01",
    challenge: "build-out-directory",
    title: "Pre-Stage the Workstation",
    prompt: "Pre-stage IT-WKS09 in IT Workstations and name the folder an unstaged computer lands in.",
    skill: "directory",
  },
  "dr-02": {
    id: "dr-02",
    challenge: "build-out-directory",
    title: "Point It at the Domain",
    prompt: "Report the address a workstation must use as its preferred DNS server.",
    skill: "troubleshooting",
  },
  "dr-03": {
    id: "dr-03",
    challenge: "build-out-directory",
    title: "Give Compliance a Workstations Folder",
    prompt: "Create a Workstations OU under Compliance and report its path.",
    skill: "directory",
  },
  "dr-04": {
    id: "dr-04",
    challenge: "build-out-directory",
    title: "Delegate Only What Helpdesk Needs",
    prompt: "Choose where to delegate password resets for Compliance staff only.",
    skill: "access",
  },
  "dr-05": {
    id: "dr-05",
    challenge: "build-out-directory",
    title: "Create the New Hire",
    prompt: "Create quinn.harper in IT Users with the right title and report the logon name.",
    skill: "accounts",
  },
  "dr-06": {
    id: "dr-06",
    challenge: "build-out-directory",
    title: "Person, Machine or Job?",
    prompt: "Pick the user object that does not represent a person.",
    skill: "accounts",
  },
  "dr-07": {
    id: "dr-07",
    challenge: "build-out-directory",
    title: "Mirror the Right Peer",
    prompt: "Give quinn.harper Priya's access and name the group Quinn must not get.",
    skill: "access",
  },
  "dr-08": {
    id: "dr-08",
    challenge: "build-out-directory",
    title: "OU or Container?",
    prompt: "Decide whether a GPO linked to OU=IT reaches an account in the default Users folder.",
    skill: "directory",
  },
  "dr-09": {
    id: "dr-09",
    challenge: "build-out-directory",
    title: "Create the Service Account",
    prompt: "Create svc-print-queue the way a service account should be built and name the setting that limits when it signs in.",
    skill: "accounts",
  },
  "dr-10": {
    id: "dr-10",
    challenge: "build-out-directory",
    title: "A Job Running Outside Its Window",
    prompt: "Decide what a service account signing in outside its logon hours means.",
    skill: "security",
  },
  "dr-11": {
    id: "dr-11",
    challenge: "build-out-directory",
    title: "Link the Policy",
    prompt: "Create and link a GPO to the Compliance Workstations OU and name the places a GPO can link.",
    skill: "directory",
  },
  "dr-12": {
    id: "dr-12",
    challenge: "build-out-directory",
    title: "The Password Rule That Will Not Apply",
    prompt: "Choose how to give one department stricter passwords.",
    skill: "access",
  },
  "dk-01": {
    id: "dk-01",
    challenge: "new-hire-week",
    title: "Find the Caller",
    prompt: "Use Find to open jordan.ellis and report the title on the account.",
    skill: "directory",
  },
  "dk-02": {
    id: "dk-02",
    challenge: "new-hire-week",
    title: "Reset and Force a Change",
    prompt: "Reset maya.okafor's password with a change at next logon and say which fix the call needed.",
    skill: "troubleshooting",
  },
  "dk-03": {
    id: "dk-03",
    challenge: "new-hire-week",
    title: "Locked, Not Forgotten",
    prompt: "Choose the fix for a user who remembers the password but is locked out.",
    skill: "troubleshooting",
  },
  "dk-04": {
    id: "dk-04",
    challenge: "new-hire-week",
    title: "Put Maya in the Right Folder",
    prompt: "Move maya.okafor into Wealth Management Users and name the group that must come off.",
    skill: "accounts",
  },
  "dk-05": {
    id: "dk-05",
    challenge: "new-hire-week",
    title: "Finish the Access Half",
    prompt: "Swap maya.okafor's department group and report the one you removed.",
    skill: "accounts",
  },
  "dk-06": {
    id: "dk-06",
    challenge: "new-hire-week",
    title: "Record the Ticket",
    prompt: "Record the ticket on maya.okafor's Description and name the tab that holds Title.",
    skill: "directory",
  },
  "dk-07": {
    id: "dk-07",
    challenge: "new-hire-week",
    title: "Read the Raw Attribute",
    prompt: "Report what pwdLastSet shows on maya.okafor after the forced change.",
    skill: "troubleshooting",
  },
  "dk-08": {
    id: "dk-08",
    challenge: "new-hire-week",
    title: "The Missing Tab",
    prompt: "Name the tab missing when a computer is opened from Find.",
    skill: "directory",
  },
  "dk-09": {
    id: "dk-09",
    challenge: "new-hire-week",
    title: "Which Last Logon to Trust",
    prompt: "Choose the logon attribute that is shared between domain controllers.",
    skill: "troubleshooting",
  },
  "dk-10": {
    id: "dk-10",
    challenge: "new-hire-week",
    title: "Close the Transfer",
    prompt: "Confirm maya.okafor's transfer and name the two things that must both match.",
    skill: "accounts",
  },
  "w1-01": {
    id: "w1-01",
    challenge: "weekend-incident-report",
    title: "Close the Exposed Client Export",
    prompt: "Find the Wealth Management client export sitting in the Operations share, move it where it belongs, and report how many client records were exposed.",
    skill: "security",
  },
  "w1-02": {
    id: "w1-02",
    challenge: "weekend-incident-report",
    title: "Catch the Altered Wire",
    prompt: "Prove the November wire approvals were changed, restore the approved copy, and name the wire that was altered.",
    skill: "security",
  },
  "w1-03": {
    id: "w1-03",
    challenge: "weekend-incident-report",
    title: "Bring the File Shares Back",
    prompt: "Find what is blocking every department's file shares since the weekend, switch it off, and report the port it blocked.",
    skill: "troubleshooting",
  },
  "w1-04": {
    id: "w1-04",
    challenge: "weekend-incident-report",
    title: "Weakness or Threat?",
    prompt: "For the exposed client export, choose which part is the vulnerability and which is the threat.",
    skill: "risk",
  },
  "w1-05": {
    id: "w1-05",
    challenge: "weekend-incident-report",
    title: "Rank the Weekend",
    prompt: "Rank the three findings by risk and choose which one the firm must deal with first.",
    skill: "risk",
  },
  "w2-01": {
    id: "w2-01",
    challenge: "tuesday-after-breach",
    title: "Decode the Settlement Script",
    prompt: "Decode the password in the Operations settlement script that its comment calls encrypted.",
    skill: "security",
  },
  "w2-02": {
    id: "w2-02",
    challenge: "tuesday-after-breach",
    title: "Catch the Altered Download",
    prompt: "Find which VPN client mirror fails the published SHA-256 and move it to quarantine.",
    skill: "security",
  },
  "w2-03": {
    id: "w2-03",
    challenge: "tuesday-after-breach",
    title: "The Recovery Key Call",
    prompt: "Decide what to do before reading a BitLocker recovery key to a caller.",
    skill: "security",
  },
  "w2-04": {
    id: "w2-04",
    challenge: "tuesday-after-breach",
    title: "Crack the Shared Hash",
    prompt: "Crack the password two staff share in the leaked table and force both to change it at next logon.",
    skill: "accounts",
  },
  "w2-05": {
    id: "w2-05",
    challenge: "tuesday-after-breach",
    title: "Fix the Script for Good",
    prompt: "Choose the real fix for a password stored in a script.",
    skill: "security",
  },
  "w3-01": {
    id: "w3-01",
    challenge: "network-change",
    title: "Fix the Portal's Address",
    prompt: "Find why the intranet portal stopped resolving after the weekend change, point it at its new home, and report the address it was stuck on.",
    skill: "troubleshooting",
  },
  "w3-02": {
    id: "w3-02",
    challenge: "network-change",
    title: "Timed Out or Refused?",
    prompt: "Tell a firewall drop from a closed port by the error each user saw.",
    skill: "troubleshooting",
  },
  "w3-03": {
    id: "w3-03",
    challenge: "network-change",
    title: "Close the Vendor's Door",
    prompt: "Find the inbound rule the contractor left open, switch it off, and report its port.",
    skill: "security",
  },
  "w3-04": {
    id: "w3-04",
    challenge: "network-change",
    title: "Why Is the DC Sending Mail?",
    prompt: "Find the outbound rule that lets the domain controller send mail, switch it off, and name the protocol.",
    skill: "security",
  },
  "w3-05": {
    id: "w3-05",
    challenge: "network-change",
    title: "What HTTPS Still Shows",
    prompt: "Decide what a capture of an HTTPS upload can and cannot prove.",
    skill: "logs",
  },
  "w4-01": {
    id: "w4-01",
    challenge: "access-review",
    title: "Retire the Shared Login",
    prompt: "Find the account several people sign in with, disable it, and report its username.",
    skill: "access",
  },
  "w4-02": {
    id: "w4-02",
    challenge: "access-review",
    title: "The MFA Exemption Request",
    prompt: "Decide how to answer an executive who wants to skip MFA.",
    skill: "access",
  },
  "w4-03": {
    id: "w4-03",
    challenge: "access-review",
    title: "Access That Outlived the Audit",
    prompt: "Remove the Compliance access a help desk technician kept after an audit and name the group.",
    skill: "access",
  },
  "w4-04": {
    id: "w4-04",
    challenge: "access-review",
    title: "The Temporary Domain Admin",
    prompt: "Find the staff account left in Domain Admins after the migration and remove it.",
    skill: "access",
  },
  "w4-05": {
    id: "w4-05",
    challenge: "access-review",
    title: "Change One Number in the URL",
    prompt: "Name the failure and the fix when changing a client number shows another client's statement.",
    skill: "access",
  },
};

export const CHALLENGE_PATHS: Record<
  MissionCatalogEntry["challenge"],
  { href: string; tab: string }
> = {
  "day-one": { href: "/range/phase-1/home-lab-challenges", tab: "operation-day-one" },
  "ticket-queue": { href: "/range/phase-1/home-lab-challenges", tab: "ticket-queue" },
  "client-data": { href: "/range/phase-1/home-lab-challenges", tab: "the-client-data-review" },
  "credential-campaign": { href: "/range/phase-2/capstone", tab: "the-credential-campaign" },
  "phishing-chain": { href: "/range/phase-2/capstone", tab: "the-phishing-chain" },
  "open-door": { href: "/range/phase-2/capstone", tab: "the-open-door" },
  "keys-to-the-domain": { href: "/range/phase-2/capstone", tab: "the-keys-to-the-domain" },
  "document-the-five-ws": { href: "/range/phase-2/soc-mindset", tab: "turn-a-vague-alert-into-a-documented-account" },
  "default-posture": { href: "/range/phase-2/soc-mindset", tab: "what-the-firewall-does-with-what-you-never-mentioned" },
  "trigger-a-real-detection": { href: "/range/phase-2/week-1", tab: "prove-the-signature-match-then-find-its-limit" },
  "read-a-process-tree": { href: "/range/phase-2/week-1", tab: "follow-the-process-tree-to-what-keeps-it-alive" },
  "one-timeline-two-machines": { href: "/range/phase-2/week-2", tab: "one-timeline-two-machines" },
  "turn-on-script-logging": { href: "/range/phase-2/week-2", tab: "keep-what-a-process-launch-alone-throws-away" },
  "confirm-the-map": { href: "/range/phase-2/baselines-thresholds", tab: "ask-the-machine-not-the-lesson" },
  "trace-persistence": { href: "/range/phase-2/detection-writing", tab: "build-the-detection-that-would-have-caught-it" },
  "access-outlier": { href: "/range/phase-2/baselines-thresholds", tab: "baseline-a-team-then-find-who-breaks-it" },
  "overnight-alert": { href: "/range/phase-2/soc-mindset", tab: "approved-overnight-or-not" },
  "lockout-threshold": { href: "/range/phase-2/baselines-thresholds", tab: "set-a-defensible-lockout-threshold" },
  "build-out-directory": { href: "/range/phase-1/home-lab-directory", tab: "build-out-the-directory" },
  "new-hire-week": { href: "/range/phase-1/home-lab-desk", tab: "a-new-hire-s-first-week" },
  "weekend-incident-report": { href: "/range/phase-1/week-1", tab: "the-weekend-incident-report" },
  "tuesday-after-breach": { href: "/range/phase-1/week-2", tab: "tuesday-after-the-breach" },
  "network-change": { href: "/range/phase-1/week-3", tab: "the-network-change-that-went-wrong" },
  "access-review": { href: "/range/phase-1/week-4", tab: "the-quarterly-access-review" },
};

/** The challenge a page's "Challenge: ..." tab runs, from the page and the tab's slug. */
export function challengeAt(href: string, tab: string): MissionCatalogEntry["challenge"] | null {
  const hit = (Object.entries(CHALLENGE_PATHS) as [MissionCatalogEntry["challenge"], { href: string; tab: string }][]).find(([, p]) => p.href === href && p.tab === tab);
  return hit ? hit[0] : null;
}

export function missionHref(id: string): string {
  const mission = MISSION_CATALOG[id];
  if (!mission) return "/range";
  return `${CHALLENGE_PATHS[mission.challenge].href}#${id}`;
}

export function challengeTabHref(challenge: MissionCatalogEntry["challenge"]): string {
  const p = CHALLENGE_PATHS[challenge];
  return `${p.href}#${p.tab}`;
}

export function challengeFromMission(id: string): MissionCatalogEntry["challenge"] | null {
  if (id.startsWith("d1-")) return "day-one";
  if (/^tq-(0[1-5]|1[1-9]|20)$/.test(id)) return "ticket-queue";
  if (id.startsWith("cd-")) return "client-data";
  return MISSION_CATALOG[id]?.challenge ?? null;
}

/** Next open ticket in a challenge — last one they touched if still open. */
export function continueMissionId(challenge: MissionCatalogEntry["challenge"], results: Results): string {
  const list = Object.values(MISSION_CATALOG).filter((m) => m.challenge === challenge);
  let last: { id: string; t: number } | null = null;
  for (const m of list) {
    const r = results[m.id];
    if (!r?.at) continue;
    const t = new Date(r.at).getTime();
    if (Number.isNaN(t)) continue;
    if (!last || t > last.t) last = { id: m.id, t };
  }
  if (last && !results[last.id]?.solved) return last.id;
  return list.find((m) => !results[m.id]?.solved)?.id ?? list[0].id;
}

export function challengeHref(challenge: MissionCatalogEntry["challenge"], results: Results): string {
  return missionHref(continueMissionId(challenge, results));
}

export const CHALLENGE_LABELS: Record<MissionCatalogEntry["challenge"], string> = {
  "day-one": "Operation Day One",
  "ticket-queue": "Ticket Queue",
  "client-data": "The Client Data Review",
  "credential-campaign": "The Credential Campaign",
  "phishing-chain": "The Phishing Chain",
  "open-door": "The Open Door",
  "keys-to-the-domain": "The Keys to the Domain",
  "document-the-five-ws": "Turn a Vague Alert Into a Documented Account",
  "default-posture": "What the Firewall Does With What You Never Mentioned",
  "trigger-a-real-detection": "Prove the Signature Match, Then Find Its Limit",
  "read-a-process-tree": "Follow the Process Tree to What Keeps It Alive",
  "one-timeline-two-machines": "One Timeline, Two Machines",
  "turn-on-script-logging": "Keep What a Process Launch Alone Throws Away",
  "confirm-the-map": "Ask the Machine, Not the Lesson",
  "trace-persistence": "Build the Detection That Would Have Caught It",
  "access-outlier": "Baseline a Team, Then Find Who Breaks It",
  "overnight-alert": "Approved Overnight, or Not?",
  "lockout-threshold": "Set a Defensible Lockout Threshold",
  "build-out-directory": "Build Out the Directory",
  "new-hire-week": "A New Hire's First Week",
  "weekend-incident-report": "The Weekend Incident Report",
  "tuesday-after-breach": "Tuesday After the Breach",
  "network-change": "The Network Change That Went Wrong",
  "access-review": "The Quarterly Access Review",
};

export function lastTouchedMission(results: Results): MissionCatalogEntry | null {
  let best: { id: string; t: number } | null = null;
  for (const [id, r] of Object.entries(results)) {
    if (!MISSION_CATALOG[id] || !r.at) continue;
    const t = new Date(r.at).getTime();
    if (Number.isNaN(t)) continue;
    if (!best || t > best.t) best = { id, t };
  }
  return best ? MISSION_CATALOG[best.id] : null;
}

export function nextMissions(results: Results, n = 2): MissionCatalogEntry[] {
  const last = lastTouchedMission(results);
  const challenge = last?.challenge ?? "day-one";
  const list = Object.values(MISSION_CATALOG).filter((m) => m.challenge === challenge);
  const open = list.filter((m) => !results[m.id]?.solved);
  return (open.length ? open : list).slice(0, n);
}

export function findMissionsByQuery(query: string): MissionCatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return Object.values(MISSION_CATALOG);
  return Object.values(MISSION_CATALOG).filter((m) => {
    const hay = `${m.id} ${m.title} ${m.prompt} ${m.challenge}`.toLowerCase();
    return hay.includes(q) || q.includes(m.id);
  });
}

/** Tickets that need a real change in the student's lab before they can answer. */
export const LAB_GATED_MISSIONS = [
  "tq-01", "tq-02", "tq-03", "tq-04", "tq-05", "tq-11", "tq-12", "tq-13", "tq-14", "tq-15", "tq-16", "tq-17", "tq-18", "tq-19", "tq-20", "tq-21", "tq-22", "tq-23", "tq-24", "tq-25",
  "zt-02", "cp-04",   "sl-01", "sl-02", "sl-03",
  "rc-01", "dl-01", "pc-03", "pi-01", "pc-05", "pi-02", "ao-01", "ao-02",
  "od-02", "od-04", "od-05", "od-06", "od-07",
  "rk-01", "rk-02", "rk-04", "rk-03", "rk-05", "rk-06", "rk-07", "rk-08",
  "la2-04",
  "dr-01", "dr-03", "dr-05", "dr-07", "dr-09", "dr-11",
  "dk-02", "dk-04", "dk-05", "dk-06", "dk-07", "dk-10",
  "w1-01", "w1-02", "w1-03",
  "w2-02", "w2-04",
  "w3-01", "w3-03", "w3-04",
  "w4-01", "w4-03", "w4-04",
];

/**
 * The on-the-job task each mission practices. A gated ticket seen in the lab
 * counts as proven. Built from PROOF_TICKETS, the Portfolio's own ticket-to-job
 * map, so "Work you have done" can never credit a ticket the Portfolio does
 * not, or the other way around -- a hand-kept second copy of this list drifted
 * from PROOF_TICKETS as new tickets were added, which is exactly the kind of
 * mismatch that is otherwise invisible until a student compares the two.
 */
export const MISSION_JOBS: Record<string, string> = {
  ...Object.fromEntries(Object.entries(PROOF_TICKETS).map(([id, t]) => [id, t.job])),
  // Investigation tickets: nothing changes in the lab, so there is no portfolio job.
  "tq-06": "trace-logon",
  "tq-07": "read-logs",
  "tq-08": "read-logs",
  "tq-09": "triage-alert",
  "tq-10": "triage-alert",
};
