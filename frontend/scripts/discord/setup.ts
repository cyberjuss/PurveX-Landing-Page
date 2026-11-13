/**
 * Builds out the PurveX Discord: roles, categories, channels, who can post
 * where, the welcome and rules posts, and the #wins webhook Range posts to.
 *
 *   npm run discord:setup -- --dry-run   # print the plan, change nothing
 *   npm run discord:setup                # create whatever is missing
 *
 * Safe to run again. It finds things by name and only creates what is not
 * there yet, so it never duplicates a channel, a role or the welcome post,
 * and it leaves anything you added by hand alone.
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
const BOT_PERMISSIONS = P.MANAGE_ROLES | P.MANAGE_CHANNELS | P.MANAGE_WEBHOOKS | P.VIEW_CHANNEL | P.SEND_MESSAGES | P.READ_MESSAGE_HISTORY;
const NO_POSTING = P.SEND_MESSAGES | P.SEND_MESSAGES_IN_THREADS | P.CREATE_PUBLIC_THREADS;

const TEXT = 0;
const VOICE = 2;
const CATEGORY = 4;

// Highest first. Colors are plain hex as integers.
const ROLES = [
  { name: "Staff", color: 0x5546e0, hoist: true },
  { name: "Mentor", color: 0x0f9d74, hoist: true },
  { name: "Pro", color: 0xd97706, hoist: true },
  { name: "Student", color: 0x64748b, hoist: false },
];

type Channel = { name: string; type?: number; topic?: string; readOnly?: boolean };
const LAYOUT: { category: string; channels: Channel[] }[] = [
  {
    category: "Start here",
    channels: [
      { name: "welcome", topic: "What Range is, the free lab, and the rules.", readOnly: true },
      { name: "announcements", topic: "New challenges, phase launches and events.", readOnly: true },
    ],
  },
  {
    category: "The desk",
    channels: [
      { name: "ticket-help", topic: "Stuck on a challenge? Ask here. Hints only, never answers." },
      { name: "lab-setup", topic: "Building the home lab or getting into the cloud lab." },
      { name: "ticket-of-the-week", topic: "One ticket every Friday. Work it, then compare how you got there." },
    ],
  },
  {
    category: "Progress",
    channels: [
      { name: "wins", topic: "Finished challenges, passed certs, interviews and offers." },
      { name: "introductions", topic: "Who you are and the role you're going for." },
    ],
  },
  {
    category: "Career",
    channels: [
      { name: "job-hunt", topic: "Resumes, interview questions and postings." },
      { name: "cert-study", topic: "Security+, A+ and CySA+ study." },
    ],
  },
  { category: "Voice", channels: [{ name: "Study Room", type: VOICE }] },
];

const WELCOME = `# Welcome to PurveX Range 👋

This is the community for **Range**, where you work real IT tickets in a real company's Active Directory: PurveX Financial.

**Start here**
1. Get the free lab: https://purvex.io/range
2. Say hi in #introductions: who you are and the role you're going for
3. Start with **Operation Day One**, then the **Ticket Queue**

**Where to go**
- Stuck on a challenge → #ticket-help
- Lab won't build or connect → #lab-setup
- Finished something → #wins
- Resumes and interviews → #job-hunt

Every Friday there's a new ticket in #ticket-of-the-week.`;

const RULES = `# Rules

1. **No answers.** Never post a challenge's answer, flag or exact value. Give a hint, point to the console or the tab, or ask a question that gets them there.
2. **Be kind.** Everyone here started somewhere. No one gets laughed at for a question.
3. **No spam** and no promotion of unrelated products or servers.
4. **Keep it legal.** Practice only on your own lab. No help attacking systems you don't own.
5. **Protect your info.** Never post passwords, keys or anything from a real job.

Breaking a rule gets a warning, then removal. Questions about the rules → message Staff.`;

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
type GuildChannel = { id: string; name: string; type: number; parent_id: string | null };
type Message = { author: { id: string }; content: string };
type Webhook = { id: string; token?: string; name: string };

const say = (s: string) => console.log(s);

async function main() {
  if (appId) say(`Bot invite link: https://discord.com/oauth2/authorize?client_id=${appId}&scope=bot&permissions=${BOT_PERMISSIONS}\n`);

  if (dryRun && (!token || !guild)) {
    say("Dry run without DISCORD_BOT_TOKEN and DISCORD_GUILD_ID, so here is the full plan:\n");
    say(`Roles: ${ROLES.map((r) => r.name).join(", ")}`);
    for (const c of LAYOUT) say(`${c.category}: ${c.channels.map((ch) => (ch.type === VOICE ? `🔊 ${ch.name}` : `#${ch.name}${ch.readOnly ? " (staff posts only)" : ""}`)).join(", ")}`);
    say("Posts the welcome and rules messages in #welcome, and makes the #wins webhook if it has none.");
    return;
  }
  if (!token || !guild) throw new Error("Set DISCORD_BOT_TOKEN and DISCORD_GUILD_ID first. See the top of this file.");

  const me = await api<{ id: string; username: string }>("GET", "/users/@me");
  say(`Signed in as ${me.username}.${dryRun ? " Dry run: nothing is changed." : ""}\n`);

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

  // Categories and channels. @everyone's role id is the server's id.
  let channels = await api<GuildChannel[]>("GET", `/guilds/${guild}/channels`);
  const byName = (name: string, type: number, parent?: string | null) =>
    channels.find((c) => c.name.toLowerCase() === name.toLowerCase().replace(/ /g, type === TEXT ? "-" : " ") && c.type === type && (parent === undefined || c.parent_id === parent));
  const made: Record<string, string> = {};
  for (const group of LAYOUT) {
    let cat = byName(group.category, CATEGORY);
    if (!cat && !dryRun) {
      cat = await api<GuildChannel>("POST", `/guilds/${guild}/channels`, { name: group.category, type: CATEGORY });
      channels = [...channels, cat];
      say(`\n${group.category}: created`);
    } else say(`\n${group.category}: ${cat ? "already there" : "would create"}`);
    for (const ch of group.channels) {
      const type = ch.type ?? TEXT;
      // A channel you already made counts wherever it sits, so a #wins made
      // by hand (with its webhook) is reused rather than doubled.
      const existing = byName(ch.name, type);
      if (existing) {
        made[ch.name] = existing.id;
        say(`  ${ch.name}: already there`);
        continue;
      }
      if (dryRun || !cat) {
        say(`  ${ch.name}: would create${ch.readOnly ? " (staff posts only)" : ""}`);
        continue;
      }
      const overwrites = ch.readOnly
        ? [
            { id: guild, type: 0, deny: String(NO_POSTING), allow: "0" },
            ...(roleId.Staff ? [{ id: roleId.Staff, type: 0, allow: String(P.SEND_MESSAGES), deny: "0" }] : []),
            { id: me.id, type: 1, allow: String(P.SEND_MESSAGES | P.VIEW_CHANNEL), deny: "0" },
          ]
        : [];
      const c = await api<GuildChannel>("POST", `/guilds/${guild}/channels`, {
        name: ch.name,
        type,
        parent_id: cat.id,
        ...(ch.topic ? { topic: ch.topic } : {}),
        permission_overwrites: overwrites,
      });
      channels = [...channels, c];
      made[ch.name] = c.id;
      say(`  ${ch.name}: created${ch.readOnly ? " (staff posts only)" : ""}`);
    }
  }

  // Welcome and rules, once.
  if (made.welcome) {
    const recent = await api<Message[]>("GET", `/channels/${made.welcome}/messages?limit=20`);
    const mine = recent.filter((m) => m.author.id === me.id);
    for (const [label, content] of [["welcome", WELCOME], ["rules", RULES]] as const) {
      if (mine.some((m) => m.content.split("\n")[0] === content.split("\n")[0])) say(`\n${label} post: already there`);
      else if (dryRun) say(`\n${label} post: would post`);
      else {
        await api("POST", `/channels/${made.welcome}/messages`, { content, allowed_mentions: { parse: [] } });
        say(`\n${label} post: posted`);
      }
    }
  }

  // The #wins webhook Range posts to. One you made by hand counts.
  if (made.wins) {
    const hooks = await api<Webhook[]>("GET", `/channels/${made.wins}/webhooks`);
    if (hooks.length) say(`\n#wins webhook: already there (${hooks.map((h) => h.name).join(", ")}). Keep using the URL you have.`);
    else if (dryRun) say("\n#wins webhook: would create");
    else {
      const hook = await api<Webhook>("POST", `/channels/${made.wins}/webhooks`, { name: "PurveX Range" });
      say("\n#wins webhook created. Put this in your hosting settings as DISCORD_WINS_WEBHOOK_URL, and keep it private:");
      say(`  https://discord.com/api/webhooks/${hook.id}/${hook.token}`);
    }
  }

  say("\nDone. Next: make an invite link that never expires (right-click #welcome -> Invite People -> Edit invite link -> Never),");
  say("and set it as NEXT_PUBLIC_DISCORD_INVITE_URL so Range links to the server.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
