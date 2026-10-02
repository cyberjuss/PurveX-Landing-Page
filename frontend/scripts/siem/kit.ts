/* Shared kit for building SIEM cases: a seeded RNG, the PurveX cast, table
 * schemas, and the on-disk case.json shape. Deterministic by design. */
import type { Row } from "../../src/lib/siem/types";
import type { CasePublic, TableSchema } from "../../src/lib/siem/types";

/** A tiny seeded RNG (mulberry32), so a case is byte-identical every run. */
export function rng(seed: string) {
  let a = 0;
  for (const c of seed) a = (a * 31 + c.charCodeAt(0)) >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const USERS = [
  "alex.rivera", "priya.nair", "devon.brooks", "morgan.lee", "sam.whitfield",
  "jamie.torres", "taylor.osei", "riley.kwan", "jordan.ellis",
];
export const WORKSTATIONS = ["IT-WKS01", "WM-WKS07", "FIN-LT14", "OPS-WKS03"];

/** Case data is shifted to recent time so Azure would accept it and ago() works.
 *  Day 0 is three days ago at midnight UTC, rounded, for stable output. */
export const DAY0 = Date.UTC(2026, 0, 1, 0, 0, 0); // fixed epoch; the loader reshifts to "now"
export const iso = (ms: number) => new Date(ms).toISOString();

/** Full table schemas, trimmed to the columns a Tier-1 analyst actually reads.
 *  Names and column names match Microsoft Sentinel / Defender tables. */
export const SCHEMAS: Record<string, TableSchema> = {
  SecurityEvent: {
    name: "SecurityEvent",
    about: "Windows Security log events from the domain controller, such as sign-ins (4624/4625) and account changes.",
    columns: [
      { name: "TimeGenerated", type: "datetime", about: "When the event happened (UTC)." },
      { name: "EventID", type: "int", about: "The Windows event ID, e.g. 4625 failed sign-in." },
      { name: "Account", type: "string", about: "The account the event is about." },
      { name: "Computer", type: "string", about: "The host that logged the event." },
      { name: "IpAddress", type: "string", about: "The source address, when the event has one." },
      { name: "LogonType", type: "int", about: "How the sign-in happened, e.g. 3 network, 10 RDP." },
      { name: "Activity", type: "string", about: "A short description of the event." },
    ],
  },
  DeviceProcessEvents: {
    name: "DeviceProcessEvents",
    about: "Processes that started on a device, with the command line and the parent process.",
    columns: [
      { name: "TimeGenerated", type: "datetime", about: "When the process started (UTC)." },
      { name: "DeviceName", type: "string", about: "The device the process ran on." },
      { name: "AccountName", type: "string", about: "The account the process ran as." },
      { name: "FileName", type: "string", about: "The program's file name, e.g. powershell.exe." },
      { name: "ProcessCommandLine", type: "string", about: "The full command line." },
      { name: "InitiatingProcessFileName", type: "string", about: "The parent process that launched it." },
    ],
  },
  DeviceFileEvents: {
    name: "DeviceFileEvents",
    about: "File create, rename and modify actions on a device.",
    columns: [
      { name: "TimeGenerated", type: "datetime", about: "When the file action happened (UTC)." },
      { name: "DeviceName", type: "string", about: "The device the file is on." },
      { name: "ActionType", type: "string", about: "FileCreated, FileRenamed or FileModified." },
      { name: "FileName", type: "string", about: "The file's name." },
      { name: "FolderPath", type: "string", about: "The full path to the file." },
      { name: "InitiatingProcessFileName", type: "string", about: "The process that touched the file." },
    ],
  },
  DeviceNetworkEvents: {
    name: "DeviceNetworkEvents",
    about: "Outbound and inbound network connections a device made.",
    columns: [
      { name: "TimeGenerated", type: "datetime", about: "When the connection happened (UTC)." },
      { name: "DeviceName", type: "string", about: "The device that made the connection." },
      { name: "RemoteIP", type: "string", about: "The address it connected to." },
      { name: "RemoteUrl", type: "string", about: "The host name, when known." },
      { name: "RemotePort", type: "int", about: "The destination port." },
      { name: "SentBytes", type: "int", about: "Bytes sent on the connection." },
      { name: "InitiatingProcessFileName", type: "string", about: "The process that opened the connection." },
    ],
  },
  EmailEvents: {
    name: "EmailEvents",
    about: "Email that arrived for PurveX staff, with sender, subject and attachment.",
    columns: [
      { name: "TimeGenerated", type: "datetime", about: "When the message arrived (UTC)." },
      { name: "RecipientEmailAddress", type: "string", about: "Who received it." },
      { name: "SenderFromAddress", type: "string", about: "The From address." },
      { name: "Subject", type: "string", about: "The subject line." },
      { name: "AttachmentName", type: "string", about: "The attachment file name, if any." },
      { name: "DeliveryAction", type: "string", about: "Delivered, Junked or Blocked." },
    ],
  },
};

/** One flag the student must find, its accepted answers, and a query that
 *  proves the flag is answerable from the data. Never shown to the student. */
export type Answer = { id: string; prompt: string; accept: string[]; proof: string; expect: string };

/** The full on-disk case: the public half the student sees and the private
 *  half (answer key + proofs) the server keeps. */
export type CaseFile = {
  public: CasePublic;
  answers: Answer[];
  /** Rows appended, after a short delay, when the student fires the sim. */
  sim?: { table: string; rows: Row[] }[];
};

export type BuiltCase = { id: string; tables: Record<string, Row[]>; caseFile: CaseFile };

/** Sort rows by time so the files read like a real export and output is stable. */
export const byTime = (rows: Row[]) => [...rows].sort((a, b) => String(a.TimeGenerated).localeCompare(String(b.TimeGenerated)));
