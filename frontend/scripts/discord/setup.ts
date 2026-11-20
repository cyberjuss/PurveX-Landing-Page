/**
 * Builds out the Range, PurveX's Discord: roles, categories, channels, who can post
 * where, the welcome and rules posts, and the #wins webhook Range posts to.
 *
 *   npm run discord:setup -- --dry-run   # print the plan, change nothing
 *   npm run discord:setup                # create or tidy whatever is off
 *
 * Safe to run again. It finds things by name, including the plain names an
 * earlier version of this script used, and brings them to the current
 * layout: it renames, moves and reorders rather than duplicating, edits its
 * own welcome post in place, and leaves anything you added by hand alone.
 * The only things it deletes are its own old rules post (the rules now have
 * a channel of their own) and the "Text Channels" / "Voice Channels"
 * categories Discord makes for a new server, once they are empty.
 *
 * This file is plain ASCII on purpose: every emoji is written as an escape.
 * Copying it through a Windows console that re-encodes text cannot garble
 * what it posts.
 *
 * Needs, in your terminal's environment (never commit either):
 *   DISCORD_BOT_TOKEN  the bot's token, from discord.com/developers ->
 *                      your app -> Bot -> Reset Token
 *   DISCORD_GUILD_ID   the server's ID: in Discord, turn on Developer Mode
 *                      (Settings -> Advanced), then right-click the server
 *                      icon -> Copy Server ID
 *
 * Invite the bot first with the link this prints (--dry-run prints it too,
 * given DISCORD_APP_ID). It needs Manage Roles, Manage Channels, Manage
 * Webhooks, View Channels, Send Messages and Read Message History.
 */

// Overridable only so the script can be tested against a stand-in server.
const API = process.env.DISCORD_API_BASE ?? "https://discord.com/api/v10";
const dryRun = process.argv.includes("--dry-run");

// Permission bits, from Discord's documentation. BigInt because the higher
// bits pass what a plain number holds exactly once they are OR-ed together.
const bit = (n: number) => BigInt(Math.pow(2, n));
const P = {
  CREATE_INSTANT_INVITE: bit(0),
  MANAGE_CHANNELS: bit(4),
  ADD_REACTIONS: bit(6),
  VIEW_CHANNEL: bit(10),
  SEND_MESSAGES: bit(11),
  READ_MESSAGE_HISTORY: bit(16),
  MANAGE_ROLES: bit(28),
  MANAGE_WEBHOOKS: bit(29),
  SEND_MESSAGES_IN_THREADS: bit(38),
  CREATE_PUBLIC_THREADS: bit(35),
};
// Create Invite is what lets the bot add a student who links their Discord
// account in Range to the server (the guilds.join sign-in scope).
const BOT_PERMISSIONS = P.CREATE_INSTANT_INVITE | P.MANAGE_ROLES | P.MANAGE_CHANNELS | P.MANAGE_WEBHOOKS | P.VIEW_CHANNEL | P.SEND_MESSAGES | P.READ_MESSAGE_HISTORY;
const NO_POSTING = P.SEND_MESSAGES | P.SEND_MESSAGES_IN_THREADS | P.CREATE_PUBLIC_THREADS;

const TEXT = 0;
const VOICE = 2;
const CATEGORY = 4;

// The brand purple, also the Staff role's color.
const BRAND = 0x5546e0;
const LOGO = "https://purvex.io/logo.png";

const E = {
  wave: "\u{1F44B}",
  scroll: "\u{1F4DC}",
  megaphone: "\u{1F4E3}",
  ticket: "\u{1F3AB}",
  testTube: "\u{1F9EA}",
  calendar: "\u{1F4C5}",
  trophy: "\u{1F3C6}",
  raisedHand: "\u{1F64B}",
  briefcase: "\u{1F4BC}",
  books: "\u{1F4DA}",
  speech: "\u{1F4AC}",
  shield: "\u{1F6E1}\u{FE0F}",
  speaker: "\u{1F50A}",
  headphones: "\u{1F3A7}",
  pin: "\u{1F4CC}",
  map: "\u{1F5FA}\u{FE0F}",
  rocket: "\u{1F680}",
  star: "\u{2B50}",
  computer: "\u{1F5A5}\u{FE0F}",
  robot: "\u{1F916}",
  idCard: "\u{1FAAA}",
  check: "\u{2705}",
  gradCap: "\u{1F393}",
  card: "\u{1F4B3}",
  gem: "\u{1F48E}",
  cloud: "\u{2601}\u{FE0F}",
  arrow: "\u{2192}",
  dot: "\u{B7}",
};
const SEP = "\u{30FB}";

// Highest first. Colors are plain hex as integers.
const ROLES = [
  { name: "Staff", color: BRAND, hoist: true },
  { name: "Mentor", color: 0x0f9d74, hoist: true },
  { name: "Pro", color: 0xd97706, hoist: true },
  { name: "Student", color: 0x64748b, hoist: false },
];

// slug is the channel's plain name, which the welcome post links to and
// which earlier versions created. was lists any other names it may have now.
type Channel = { slug: string; emoji: string; type?: number; topic?: string; readOnly?: boolean; was?: string[] };
// proOnly hides the whole category, and everything in it, from anyone
// without the Pro, Mentor or Staff role.
type Group = { category: string; was: string[]; proOnly?: boolean; channels: Channel[] };
const LAYOUT: Group[] = [
  {
    category: `${E.pin} Start Here`,
    was: ["Start here"],
    channels: [
      { slug: "welcome", emoji: E.wave, topic: "Start here: what the Range is, how to get your free lab, and where everything lives.", readOnly: true },
      { slug: "rules", emoji: E.scroll, topic: "The Range rules. The big one: hints, never answers.", readOnly: true },
      { slug: "go-pro", emoji: E.star, topic: "What Range Pro adds, what it costs, and how to start your free trial.", readOnly: true },
      { slug: "announcements", emoji: E.megaphone, topic: "Range news: new challenges, phase launches and events.", readOnly: true },
    ],
  },
  {
    category: `${E.ticket} The Desk`,
    was: ["The desk"],
    channels: [
      { slug: "ticket-help", emoji: E.ticket, topic: "Stuck on a challenge? Say which ticket and what you tried. Hints only, never answers." },
      { slug: "lab-setup", emoji: E.testTube, topic: "Building the home lab or getting into the cloud lab. Paste the error, not a photo of it." },
      { slug: "ticket-of-the-week", emoji: E.calendar, topic: "A new ticket every Friday. Work it, then compare how you got there." },
    ],
  },
  {
    category: `${E.trophy} Progress`,
    was: ["Progress"],
    channels: [
      { slug: "wins", emoji: E.trophy, topic: "Finished challenges, passed certs, interviews and offers. The Range posts your solves here too." },
      { slug: "introductions", emoji: E.raisedHand, topic: "Who you are, where you're starting from, and the role you're going for." },
    ],
  },
  {
    category: `${E.briefcase} Career`,
    was: ["Career"],
    channels: [
      { slug: "job-hunt", emoji: E.briefcase, topic: "Resumes, interview questions and postings." },
      { slug: "cert-study", emoji: E.books, topic: "Security+, A+ and CySA+ study: notes, questions and study partners." },
    ],
  },
  {
    category: `${E.gem} Range Pro`,
    was: [],
    proOnly: true,
    channels: [
      { slug: "pro-lounge", emoji: E.gem, topic: "For Range Pro members. Say hi, share progress, ask anything." },
      { slug: "cloud-lab-help", emoji: E.cloud, topic: "Help with your Pro cloud lab: starting it, connecting, and anything that won't behave." },
      { slug: "proof-review", emoji: E.idCard, topic: "Share your Proof Profile or resume and get feedback from mentors and other Pro members." },
      { slug: "Pro Study Hall", emoji: E.gem, type: VOICE },
    ],
  },
  {
    category: `${E.speech} Community`,
    was: ["Text Channels"],
    channels: [
      { slug: "general", emoji: E.speech, topic: "Anything goes. Say hi, share what you're working on." },
      { slug: "security-news", emoji: E.shield, topic: "Breaches, CVEs and articles worth reading. Add a line on why it matters.", was: ["cybersecurity"] },
    ],
  },
  {
    category: `${E.speaker} Voice`,
    was: ["Voice", "Voice Channels"],
    channels: [
      { slug: "Study Room", emoji: E.books, type: VOICE },
      { slug: "Hangout", emoji: E.headphones, type: VOICE, was: ["General"] },
    ],
  },
];

// Categories Discord creates for a new server. Removed once nothing is left in them.
const LEFTOVER_CATEGORIES = ["Text Channels", "Voice Channels"];

const fullName = (ch: Channel) => ((ch.type ?? TEXT) === VOICE ? `${ch.emoji} ${ch.slug}` : `${ch.emoji}${SEP}${ch.slug}`);

// The names are how the Range is known everywhere it shows up.
const SERVER_NAME = "PurveX Range";
const RULES_TITLE = `${E.scroll} Range rules`;
const WELCOME_TITLE = `Welcome to the Range ${E.wave}`;

function welcomeEmbed(link: (slug: string) => string) {
  return {
    title: WELCOME_TITLE,
    url: "https://purvex.io/range",
    color: BRAND,
    thumbnail: { url: LOGO },
    description: [
      "This is **the Range**, PurveX's training ground for IT and security. You learn by doing the job: real tickets, inside **PurveX Financial**, a company with its own Active Directory, its own staff and its own problems.",
      "",
      `**${E.rocket} Get started**`,
      "**1.** Get your free Range lab at **[purvex.io/range](https://purvex.io/range)**",
      `**2.** Say hi in ${link("introductions")}: who you are and the role you're going for`,
      "**3.** Start with **Operation Day One**, then work the **Ticket Queue**",
    ].join("\n"),
    fields: [
      {
        name: `${E.map} Where to go`,
        value: [
          `${E.ticket} Stuck on a challenge ${E.arrow} ${link("ticket-help")}`,
          `${E.testTube} Lab won't build or connect ${E.arrow} ${link("lab-setup")}`,
          `${E.trophy} Finished something ${E.arrow} ${link("wins")}`,
          `${E.briefcase} Resumes and interviews ${E.arrow} ${link("job-hunt")}`,
          `${E.books} Studying for a cert ${E.arrow} ${link("cert-study")}`,
        ].join("\n"),
      },
      { name: `${E.calendar} Every Friday`, value: `A new ticket drops in ${link("ticket-of-the-week")}. Work it, then compare how you got there.` },
      {
        name: `${E.star} Want the job faster?`,
        value: `**Range Pro** adds your own cloud lab, an AI coach and a Proof Profile employers can verify. $49 a month, free for 3 days. See ${link("go-pro")}.`,
      },
      { name: `${E.scroll} Before you post`, value: `Read ${link("rules")}. The big one: hints, never answers.` },
    ],
    footer: { text: `The Range ${E.dot} by PurveX ${E.dot} Learn it by doing the job` },
  };
}

function rulesEmbed() {
  return {
    title: RULES_TITLE,
    color: BRAND,
    description: [
      "**1. No answers.** Never post a challenge's answer, flag or exact value. Give a hint, point to the console or the tab, or ask a question that gets them there.",
      "",
      "**2. Be kind.** Everyone here started somewhere. No one gets laughed at for a question.",
      "",
      "**3. No spam,** and no promotion of unrelated products or servers.",
      "",
      "**4. Keep it legal.** Practice only on your own lab. No help attacking systems you don't own.",
      "",
      "**5. Protect your info.** Never post passwords, keys or anything from a real job.",
    ].join("\n"),
    footer: { text: "Breaking a rule gets a warning, then removal from the Range. Questions about the rules? Message a Staff member." },
  };
}

// Link buttons under the welcome post.
const WELCOME_BUTTONS = [
  {
    type: 1,
    components: [
      { type: 2, style: 5, label: "Get your free Range lab", url: "https://purvex.io/range", emoji: { name: E.rocket } },
      { type: 2, style: 5, label: "What's in the course", url: "https://purvex.io/cybersecurity-training", emoji: { name: E.books } },
    ],
  },
];

// Discord's layout components. A post built from them gets real headings,
// small grey subtext, and dividers with proper spacing between sections,
// which a card (embed) cannot do. The card versions above stay as the
// fallback for the rare server where Discord refuses the layout.
const LAYOUT_FLAG = 1 << 15; // IS_COMPONENTS_V2
const text = (content: string) => ({ type: 10, content });
const gap = (divider = false) => ({ type: 14, divider, spacing: 2 });
const container = (components: unknown[]) => ({ type: 17, accent_color: BRAND, components });

function welcomeLayout(link: (slug: string) => string) {
  return [
    container([
      {
        type: 9,
        components: [
          text(`# Welcome to the Range ${E.wave}`),
          text("PurveX's training ground for IT and security.\n-# Learn it by doing the job."),
        ],
        accessory: { type: 11, media: { url: LOGO }, description: "PurveX" },
      },
      gap(true),
      text(
        "You learn by doing the job: real tickets inside **PurveX Financial**, a company with its own Active Directory, its own staff and its own problems.",
      ),
      gap(),
      text(
        [
          `### ${E.rocket} Get started`,
          "**1.** Get your free Range lab at **[purvex.io/range](https://purvex.io/range)**",
          `**2.** Say hi in ${link("introductions")}: who you are and the role you're going for`,
          "**3.** Start with **Operation Day One**, then work the **Ticket Queue**",
        ].join("\n"),
      ),
      gap(true),
      text(
        [
          `### ${E.map} Where to go`,
          `${E.ticket} Stuck on a challenge ${E.arrow} ${link("ticket-help")}`,
          `${E.testTube} Lab won't build or connect ${E.arrow} ${link("lab-setup")}`,
          `${E.trophy} Finished something ${E.arrow} ${link("wins")}`,
          `${E.briefcase} Resumes and interviews ${E.arrow} ${link("job-hunt")}`,
          `${E.books} Studying for a cert ${E.arrow} ${link("cert-study")}`,
        ].join("\n"),
      ),
      gap(true),
      text(`### ${E.calendar} Every Friday\nA new ticket drops in ${link("ticket-of-the-week")}. Work it, then compare how you got there.`),
      gap(true),
      text(
        `### ${E.star} Want the job faster?\n**Range Pro** adds your own cloud lab, an AI coach that reads it, a Proof Profile employers can verify, and private Pro channels here. ` +
          `$49 a month, free for your first 3 days. Everything it includes is in ${link("go-pro")}.`,
      ),
      gap(),
      text(`### ${E.scroll} Before you post\nRead ${link("rules")}. The big one: **hints, never answers.**`),
      gap(true),
      WELCOME_BUTTONS[0],
      text(`-# The Range ${E.dot} by PurveX`),
    ]),
  ];
}

const RULE_LIST: [string, string][] = [
  ["No answers", "Never post a challenge's answer, flag or exact value. Give a hint, point to the console or the tab, or ask a question that gets them there."],
  ["Be kind", "Everyone here started somewhere. No one gets laughed at for a question."],
  ["No spam", "No spam, and no promotion of unrelated products or servers."],
  ["Keep it legal", "Practice only on your own lab. No help attacking systems you don't own."],
  ["Protect your info", "Never post passwords, keys or anything from a real job."],
];

function rulesLayout() {
  return [
    container([
      text(`# ${E.scroll} Range rules\n-# Five rules for the Range. The first one matters most.`),
      gap(true),
      ...RULE_LIST.flatMap(([title, body], i) => [text(`### ${i + 1}. ${title}\n${body}`), ...(i < RULE_LIST.length - 1 ? [gap()] : [])]),
      gap(true),
      text("-# Breaking a rule gets a warning, then removal from the Range. Questions about the rules? Message a Staff member."),
    ]),
  ];
}

// Range Pro, for #go-pro. Every claim here matches the site's own plans
// (the training page's pricing cards and /range/upgrade): keep them in step.
const UPGRADE_URL = "https://purvex.io/range/upgrade";
const PRO_TITLE = `${E.star} Range Pro`;
const PRO_BUTTONS = {
  type: 1,
  components: [
    { type: 2, style: 5, label: "Start your free trial", url: UPGRADE_URL, emoji: { name: E.star } },
    { type: 2, style: 5, label: "Compare plans", url: "https://purvex.io/cybersecurity-training#pricing", emoji: { name: E.books } },
  ],
};

function proLayout(link: (slug: string) => string) {
  return [
    container([
      {
        type: 9,
        components: [
          text(`# ${PRO_TITLE}`),
          text(`Every lesson in the Range is free. Pro is for when you want the job.\n-# $49 a month ${E.dot} free for your first 3 days ${E.dot} cancel in one click`),
        ],
        accessory: { type: 11, media: { url: LOGO }, description: "PurveX" },
      },
      gap(true),
      text(
        [
          "### What Pro adds",
          `${E.computer} **Your own cloud lab in a browser tab.** A real Windows domain built just for you. Nothing to install, and you can open it from any computer.`,
          "",
          `${E.robot} **An AI coach that reads your lab.** When you're stuck, it looks at what's actually in your directory and gives you the next step. It never hands you the answer.`,
          "",
          `${E.idCard} **A Proof Profile employers can verify.** Your finished work, screenshots and recorded solves on one page you can share, with a credential ID a hiring manager can check.`,
          "",
          `${E.gem} **The Pro channels, right here.** A private lounge, help with your cloud lab, and Proof Profile and resume reviews with mentors. Only Pro members can see them.`,
        ].join("\n"),
      ),
      gap(true),
      text(
        [
          "### What stays free",
          `${E.check} Every lesson, including each new phase`,
          `${E.check} The whole Ticket Queue and every challenge`,
          `${E.check} Every lab, on your own Windows PC`,
          `${E.check} Your readiness score from day one`,
        ].join("\n"),
      ),
      gap(true),
      text(
        [
          "### How it works",
          `**1.** Start your free trial at **[purvex.io/range/upgrade](${UPGRADE_URL})**. You add a card, and nothing is charged for 3 days.`,
          "**2.** Open the Range and start your cloud lab from any page. Coach and your Proof Profile are switched on with it.",
          "**3.** In Range, open **Goals** and choose **Connect Discord**. The **Pro** role and the Pro channels arrive by themselves, and they go if Pro ends.",
          "**4.** After the trial it's $49 a month. Cancel in one click whenever you like, including before the trial ends.",
        ].join("\n"),
      ),
      gap(true),
      text(
        `### ${E.gradCap} In a class?\nIf your school or program gave you a passcode, your seat is already covered and everything in Pro is open to you. There's nothing to buy. ` +
          "Connect Discord in Goals and the Pro role follows.",
      ),
      gap(true),
      PRO_BUTTONS,
      text(`-# Questions about Pro? Ask in ${link("general")} or message a Staff member.`),
    ]),
  ];
}

function proEmbed() {
  return {
    title: PRO_TITLE,
    url: UPGRADE_URL,
    color: BRAND,
    thumbnail: { url: LOGO },
    description: "Every lesson in the Range is free. Pro is for when you want the job.\n**$49 a month, free for your first 3 days, cancel in one click.**",
    fields: [
      {
        name: "What Pro adds",
        value: [
          `${E.computer} **Your own cloud lab** in a browser tab: a real Windows domain built just for you`,
          `${E.robot} **An AI coach** that reads your lab and never hands you the answer`,
          `${E.idCard} **A Proof Profile** employers can verify, with your screenshots and recorded solves`,
          `${E.gem} **The Pro channels** here: a private lounge, cloud lab help and Proof Profile reviews`,
        ].join("\n"),
      },
      { name: "What stays free", value: "Every lesson, the whole Ticket Queue and every challenge, every lab on your own Windows PC, and your readiness score." },
      { name: `${E.gradCap} In a class?`, value: "If your school gave you a passcode, your seat is covered and Pro is already open to you." },
    ],
    footer: { text: "Start your trial at purvex.io/range/upgrade" },
  };
}

// Every piece of text and button label in a layout, in order. Two posts with
// the same signature read the same, whatever ids Discord added to one of them.
function signature(node: unknown, out: string[] = []): string[] {
  if (Array.isArray(node)) for (const n of node) signature(n, out);
  else if (node && typeof node === "object") {
    const c = node as { type?: number; content?: string; label?: string; components?: unknown; accessory?: unknown };
    if (c.type === 10 && c.content) out.push(c.content);
    if (c.type === 2 && c.label) out.push(c.label);
    if (c.components) signature(c.components, out);
    if (c.accessory) signature(c.accessory, out);
  }
  return out;
}
const sameText = (a: unknown, b: unknown) => JSON.stringify(signature(a)) === JSON.stringify(signature(b));

const token = process.env.DISCORD_BOT_TOKEN;
const guild = process.env.DISCORD_GUILD_ID;
const appId = process.env.DISCORD_APP_ID;

async function api<T>(method: string, path: string, body?: unknown): Promise<T> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: { authorization: `Bot ${token}`, "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (res.status === 429) {
      const wait = Number(((await res.json().catch(() => ({}))) as { retry_after?: number }).retry_after ?? 1);
      await new Promise((r) => setTimeout(r, Math.ceil(wait * 1000) + 250));
      continue;
    }
    if (!res.ok) throw new Error(`${method} ${path} failed (${res.status}): ${await res.text()}`);
    return (res.status === 204 ? undefined : await res.json()) as T;
  }
  throw new Error(`${method} ${path} kept hitting Discord's rate limit.`);
}

type Role = { id: string; name: string };
type Overwrite = { id: string; type: number; allow: string; deny: string };
type GuildChannel = { id: string; name: string; type: number; parent_id: string | null; topic?: string | null; position: number; permission_overwrites?: Overwrite[] };
type Embed = { title?: string; description?: string };
type Message = { id: string; author: { id: string }; content: string; flags?: number; embeds?: Embed[]; components?: unknown[] };
type Webhook = { id: string; token?: string; name: string };

const say = (s: string) => console.log(s);
// Discord lowercases text channel names and turns spaces into dashes.
const norm = (name: string, type: number) => (type === TEXT ? name.toLowerCase().replace(/ /g, "-") : name.toLowerCase());

async function main() {
  if (appId) say(`Bot invite link: https://discord.com/oauth2/authorize?client_id=${appId}&scope=bot&permissions=${BOT_PERMISSIONS}\n`);

  if (dryRun && (!token || !guild)) {
    say("Dry run without DISCORD_BOT_TOKEN and DISCORD_GUILD_ID, so here is the full plan:\n");
    say(`Roles: ${ROLES.map((r) => r.name).join(", ")}`);
    for (const g of LAYOUT) say(`${g.category}: ${g.channels.map((ch) => `${fullName(ch)}${ch.readOnly ? " (staff posts only)" : ""}`).join(", ")}${g.proOnly ? " (Pro members only)" : ""}`);
    say("Posts the welcome in #welcome and the rules in #rules, and makes the #wins webhook if it has none.");
    return;
  }
  if (!token || !guild) throw new Error("Set DISCORD_BOT_TOKEN and DISCORD_GUILD_ID first. See the top of this file.");

  const me = await api<{ id: string; username: string }>("GET", "/users/@me");
  say(`Signed in as ${me.username}.${dryRun ? " Dry run: nothing is changed." : ""}\n`);

  // The server's own name. Renaming a server needs Manage Server, which the
  // bot's invite deliberately does not ask for, so a refusal is expected and
  // only means you rename it yourself.
  const server = await api<{ name: string }>("GET", `/guilds/${guild}`);
  if (server.name === SERVER_NAME) say(`  server name: already "${SERVER_NAME}"`);
  else if (dryRun) say(`  server name: would rename "${server.name}" to "${SERVER_NAME}"`);
  else {
    try {
      await api("PATCH", `/guilds/${guild}`, { name: SERVER_NAME });
      say(`  server name: renamed "${server.name}" to "${SERVER_NAME}"`);
    } catch {
      say(`  server name: still "${server.name}". The bot can't rename the server, so do it in Server Settings -> Overview -> Server Name: ${SERVER_NAME}`);
    }
  }

  // Roles.
  const roles = await api<Role[]>("GET", `/guilds/${guild}/roles`);
  const roleId: Record<string, string> = {};
  for (const r of ROLES) {
    const found = roles.find((x) => x.name === r.name);
    if (found) {
      roleId[r.name] = found.id;
      say(`  role ${r.name}: already there`);
    } else if (dryRun) say(`  role ${r.name}: would create`);
    else {
      const made = await api<Role>("POST", `/guilds/${guild}/roles`, { ...r, mentionable: false, permissions: "0" });
      roleId[r.name] = made.id;
      say(`  role ${r.name}: created`);
    }
  }

  // Who can post in a staff-only channel. @everyone's role id is the server's id.
  const readOnlyOverwrites = (): Overwrite[] => [
    { id: guild, type: 0, deny: String(NO_POSTING), allow: "0" },
    ...(roleId.Staff ? [{ id: roleId.Staff, type: 0, allow: String(P.SEND_MESSAGES), deny: "0" }] : []),
    { id: me.id, type: 1, allow: String(P.SEND_MESSAGES | P.VIEW_CHANNEL), deny: "0" },
  ];
  // Who can see a Pro channel at all: nobody but Pro, Mentor and Staff (and the
  // bot, which has to see a channel to look after it). Only seeing is set here.
  // Posting and joining voice come from the server's normal permissions, and
  // the bot could not grant Connect anyway, because it does not hold it.
  const proOnlyOverwrites = (): Overwrite[] => [
    { id: guild, type: 0, deny: String(P.VIEW_CHANNEL), allow: "0" },
    ...["Pro", "Mentor", "Staff"].filter((r) => roleId[r]).map((r) => ({ id: roleId[r], type: 0, allow: String(P.VIEW_CHANNEL), deny: "0" })),
    { id: me.id, type: 1, allow: String(P.SEND_MESSAGES | P.VIEW_CHANNEL), deny: "0" },
  ];
  const overwritesFor = (group: Group, ch?: Channel) => (group.proOnly ? proOnlyOverwrites() : ch?.readOnly ? readOnlyOverwrites() : []);
  const access = (group: Group, ch: Channel) => (group.proOnly ? " (Pro members only)" : ch.readOnly ? " (staff posts only)" : "");

  // Categories and channels.
  let channels = await api<GuildChannel[]>("GET", `/guilds/${guild}/channels`);
  const find = (names: string[], type: number) => {
    const want = names.map((n) => norm(n, type));
    // The current name wins over an old one, so a half-finished earlier run
    // never picks the stale copy.
    for (const w of want) {
      const hit = channels.find((c) => c.type === type && norm(c.name, type) === w);
      if (hit) return hit;
    }
    return undefined;
  };
  const replace = (c: GuildChannel) => {
    channels = [...channels.filter((x) => x.id !== c.id), c];
  };
  const made: Record<string, string> = {};
  // Where each channel belongs, for working out what is left in a category,
  // and its spot. Only the spot goes to Discord: each channel was already
  // moved into its category one at a time above, and Discord refuses a bulk
  // reorder that changes more than one channel's category.
  const order: { id: string; position: number; parent_id?: string | null }[] = [];

  for (const [gi, group] of LAYOUT.entries()) {
    let cat = find([group.category, ...group.was], CATEGORY);
    if (!cat) {
      if (dryRun) say(`\n${group.category}: would create`);
      else {
        cat = await api<GuildChannel>("POST", `/guilds/${guild}/channels`, { name: group.category, type: CATEGORY, permission_overwrites: overwritesFor(group) });
        replace(cat);
        say(`\n${group.category}: created`);
      }
    } else if (cat.name !== group.category) {
      if (dryRun) say(`\n${group.category}: would rename from "${cat.name}"`);
      else {
        cat = await api<GuildChannel>("PATCH", `/channels/${cat.id}`, { name: group.category });
        replace(cat);
        say(`\n${group.category}: renamed from its old name`);
      }
    } else say(`\n${group.category}: already there`);
    if (cat) order.push({ id: cat.id, position: gi });
    if (cat && group.proOnly && !dryRun) {
      for (const o of proOnlyOverwrites()) await api("PUT", `/channels/${cat.id}/permissions/${o.id}`, o);
    }

    for (const [ci, ch] of group.channels.entries()) {
      const type = ch.type ?? TEXT;
      const name = fullName(ch);
      // A channel you already made counts wherever it sits, so a #wins made
      // by hand (with its webhook) is reused rather than doubled.
      const existing = find([name, ch.slug, ...(ch.was ?? [])], type);
      if (!existing) {
        if (dryRun || !cat) {
          say(`  ${name}: would create${access(group, ch)}`);
          continue;
        }
        const c = await api<GuildChannel>("POST", `/guilds/${guild}/channels`, {
          name,
          type,
          parent_id: cat.id,
          ...(ch.topic ? { topic: ch.topic } : {}),
          permission_overwrites: overwritesFor(group, ch),
        });
        replace(c);
        made[ch.slug] = c.id;
        order.push({ id: c.id, position: ci, parent_id: cat.id });
        say(`  ${name}: created${access(group, ch)}`);
        continue;
      }
      made[ch.slug] = existing.id;
      const patch: Record<string, unknown> = {};
      const changes: string[] = [];
      if (norm(existing.name, type) !== norm(name, type)) {
        patch.name = name;
        changes.push(`renamed from "${existing.name}"`);
      }
      if (type === TEXT && ch.topic && existing.topic !== ch.topic) {
        patch.topic = ch.topic;
        changes.push("topic updated");
      }
      if (cat && existing.parent_id !== cat.id) {
        patch.parent_id = cat.id;
        changes.push(`moved into ${group.category}`);
      }
      if (!dryRun && Object.keys(patch).length) replace(await api<GuildChannel>("PATCH", `/channels/${existing.id}`, patch));
      if ((ch.readOnly || group.proOnly) && !dryRun) {
        for (const o of overwritesFor(group, ch)) await api("PUT", `/channels/${existing.id}/permissions/${o.id}`, o);
      }
      if (cat) order.push({ id: existing.id, position: ci, parent_id: cat.id });
      say(`  ${name}: ${changes.length ? (dryRun ? "would be " : "") + changes.join(", ") : "already there"}`);
    }
  }

  // Put the categories, and the channels inside each, in the layout's order.
  if (!dryRun && order.length) {
    await api("PATCH", `/guilds/${guild}/channels`, order.map(({ id, position }) => ({ id, position })));
    say("\nOrder: categories and channels arranged");
  }

  // Discord's starter categories, once nothing is left in them.
  // In a dry run nothing has moved yet, so a channel counts as gone from a
  // category once the plan puts it somewhere else.
  for (const name of LEFTOVER_CATEGORIES) {
    const cat = channels.find((c) => c.type === CATEGORY && c.name === name);
    if (!cat || order.some((o) => o.id === cat.id)) continue;
    const children = channels.filter((c) => c.parent_id === cat.id && !order.some((o) => o.id === c.id && o.parent_id !== cat.id));
    if (children.length) continue;
    if (dryRun) say(`\n"${name}" category: would remove, it is empty`);
    else {
      await api("DELETE", `/channels/${cat.id}`);
      say(`\n"${name}" category: removed, it was empty`);
    }
  }

  // A clickable channel link where the channel exists, plain text in a dry run.
  const link = (slug: string) => (made[slug] ? `<#${made[slug]}>` : `#${slug}`);

  // Put a post in its channel with the layout. One already in the layout is
  // edited in place. A card from an earlier run cannot be turned into the
  // layout, so the new post goes up first and the old one is deleted after,
  // which never leaves the channel empty. If Discord refuses the layout, the
  // post stays (or becomes) a card instead.
  const isLayout = (m: Message) => ((m.flags ?? 0) & LAYOUT_FLAG) !== 0;
  async function place(label: string, channelId: string, existing: Message | undefined, layout: unknown[], card: Record<string, unknown>) {
    if (existing && isLayout(existing) && sameText(existing.components, layout)) return say(`${label} post: already up to date`);
    if (dryRun) return say(`${label} post: would ${!existing ? "post" : isLayout(existing) ? "update in place" : "rebuild with the new layout"}`);
    if (existing && isLayout(existing)) {
      await api("PATCH", `/channels/${channelId}/messages/${existing.id}`, { components: layout, allowed_mentions: { parse: [] } });
      return say(`${label} post: updated in place`);
    }
    try {
      await api("POST", `/channels/${channelId}/messages`, { flags: LAYOUT_FLAG, components: layout, allowed_mentions: { parse: [] } });
    } catch (err) {
      const why = err instanceof Error ? err.message.slice(0, 200) : String(err);
      const body = { content: "", ...card, allowed_mentions: { parse: [] } };
      if (existing) await api("PATCH", `/channels/${channelId}/messages/${existing.id}`, body);
      else await api("POST", `/channels/${channelId}/messages`, body);
      return say(`${label} post: Discord refused the new layout, so it is a card instead. ${why}`);
    }
    if (existing) await api("DELETE", `/channels/${channelId}/messages/${existing.id}`);
    say(`${label} post: ${existing ? "rebuilt with the new layout" : "posted"}`);
  }

  // The welcome post, kept as the only post at the top of #welcome.
  if (made.welcome) {
    const recent = await api<Message[]>("GET", `/channels/${made.welcome}/messages?limit=50`);
    const mine = recent.filter((m) => m.author.id === me.id);
    const isWelcome = (m: Message) =>
      m.content.startsWith("# Welcome") || m.embeds?.some((e) => e.title?.startsWith("Welcome to")) || signature(m.components).some((t) => t.includes("Welcome to the Range"));
    // Prefer one already in the layout, so a run that stopped halfway resumes cleanly.
    const welcomes = mine.filter(isWelcome);
    const welcome = welcomes.find(isLayout) ?? welcomes[0];
    say("");
    await place("welcome", made.welcome, welcome, welcomeLayout(link), { embeds: [welcomeEmbed(link)], components: WELCOME_BUTTONS });
    // Leftovers: a second welcome from a run that stopped halfway, and the
    // rules, which used to be posted here before they had their own channel.
    const leftovers = mine.filter((m) => m.id !== welcome?.id && ((isWelcome(m) && welcome && isLayout(welcome)) || m.content.startsWith("# Rules")));
    for (const old of leftovers) {
      if (dryRun) say("old post in #welcome: would remove");
      else {
        await api("DELETE", `/channels/${made.welcome}/messages/${old.id}`);
        say("old post in #welcome: removed");
      }
    }
  }

  if (made.rules) {
    const recent = await api<Message[]>("GET", `/channels/${made.rules}/messages?limit=50`);
    const isRules = (m: Message) =>
      m.author.id === me.id && (m.embeds?.some((e) => e.title?.endsWith(" rules")) || signature(m.components).some((t) => t.includes("Range rules")));
    const all = recent.filter(isRules);
    const rules = all.find(isLayout) ?? all[0];
    await place("rules", made.rules, rules, rulesLayout(), { embeds: [rulesEmbed()], components: [] });
    for (const old of all.filter((m) => m.id !== rules?.id && rules && isLayout(rules))) {
      if (dryRun) say("old post in #rules: would remove");
      else {
        await api("DELETE", `/channels/${made.rules}/messages/${old.id}`);
        say("old post in #rules: removed");
      }
    }
  } else if (dryRun) say("rules post: would post once #rules exists");

  // Range Pro, in its own channel.
  if (made["go-pro"]) {
    const recent = await api<Message[]>("GET", `/channels/${made["go-pro"]}/messages?limit=50`);
    const isPro = (m: Message) =>
      m.author.id === me.id && (m.embeds?.some((e) => e.title === PRO_TITLE) || signature(m.components).some((t) => t.includes(PRO_TITLE)));
    const all = recent.filter(isPro);
    const pro = all.find(isLayout) ?? all[0];
    await place("Range Pro", made["go-pro"], pro, proLayout(link), { embeds: [proEmbed()], components: [PRO_BUTTONS] });
    for (const old of all.filter((m) => m.id !== pro?.id && pro && isLayout(pro))) {
      if (dryRun) say("old post in #go-pro: would remove");
      else {
        await api("DELETE", `/channels/${made["go-pro"]}/messages/${old.id}`);
        say("old post in #go-pro: removed");
      }
    }
  } else if (dryRun) say("Range Pro post: would post once #go-pro exists");

  // The #wins webhook Range posts to. One you made by hand counts.
  if (made.wins) {
    const hooks = await api<Webhook[]>("GET", `/channels/${made.wins}/webhooks`);
    if (hooks.length) say(`\n#wins webhook: already there (${hooks.map((h) => h.name).join(", ")}). Keep using the URL you have.`);
    else if (dryRun) say("\n#wins webhook: would create");
    else {
      const hook = await api<Webhook>("POST", `/channels/${made.wins}/webhooks`, { name: SERVER_NAME });
      say("\n#wins webhook created. Put this in your hosting settings as DISCORD_WINS_WEBHOOK_URL, and keep it private:");
      say(`  https://discord.com/api/webhooks/${hook.id}/${hook.token}`);
    }
  }

  // What the site needs to hand the Pro role out by itself (lib/academy-discord-roles.ts).
  if (roleId.Pro) say(`\nPro role id: ${roleId.Pro}. Set it as DISCORD_PRO_ROLE_ID in your hosting settings, with this server's id as DISCORD_GUILD_ID.`);

  say("\nDone. Next: make an invite link that never expires (right-click #welcome -> Invite People -> Edit invite link -> Never),");
  say("and set it as NEXT_PUBLIC_DISCORD_INVITE_URL so Range links to the server.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
