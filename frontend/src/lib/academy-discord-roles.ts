import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { rangeEntitlement } from "@/lib/range-plan";
import type { AcademyStudent } from "@/lib/academy-student";

// The Pro role in the PurveX Discord follows Range Pro, with nobody handing
// it out. A student links their Discord account once (Goals -> Community ->
// Connect Discord, which is Discord's own sign-in), and from then on the bot
// gives them the Pro role while rangeEntitlement() says Pro and takes it away
// when it stops saying so: a cancelled subscription whose paid period has
// ended, a failed payment, a class seat past its 12 weeks.
//
// It is re-checked on every Range Pro billing event, whenever the student
// opens Goals, and once a day for everyone linked (/api/cron/discord-roles),
// which is what catches the changes no event announces, like a class seat
// running out.
//
// Needs, in the server's environment:
//   DISCORD_APP_ID         the Discord application's id (also the bot's)
//   DISCORD_CLIENT_SECRET  OAuth2 page -> Client Secret. A SECRET.
//   DISCORD_BOT_TOKEN      the bot's token. A SECRET.
//   DISCORD_GUILD_ID       the server's id
//   DISCORD_PRO_ROLE_ID    the Pro role's id (scripts/discord/setup.ts prints it)
// and the callback URL, https://<site>/range/discord/callback, added under
// OAuth2 -> Redirects in the developer portal. Unset, the Connect button is
// hidden and nothing else changes.

const API = "https://discord.com/api/v10";
const env = (k: string) => (process.env[k] ?? "").trim();
const appId = () => env("DISCORD_APP_ID");
const clientSecret = () => env("DISCORD_CLIENT_SECRET");
const botToken = () => env("DISCORD_BOT_TOKEN");
const guildId = () => env("DISCORD_GUILD_ID");
const proRoleId = () => env("DISCORD_PRO_ROLE_ID");

export const discordLinkConfigured = () => Boolean(appId() && clientSecret() && botToken() && guildId() && proRoleId());

/** The cookie that ties the Discord sign-in to the browser that started it. */
export const LINK_COOKIE = "pvx_discord_link";
const STATE_TTL_MS = 10 * 60_000;

export function redirectUri(origin: string): string {
  return env("DISCORD_REDIRECT_URI") || `${origin}/range/discord/callback`;
}

const b64 = (s: string | Buffer) => Buffer.from(s).toString("base64url");
const sign = (payload: string) => createHmac("sha256", clientSecret()).update(payload).digest("base64url");

/**
 * Where to send the student, and the nonce to keep in their browser. The
 * state names the student and expires in ten minutes, and it is signed, so it
 * cannot be forged. The nonce in a cookie means it can only be finished in
 * the browser that asked: a link to someone else's sign-in, sent to you,
 * cannot attach your Discord account to their Range account.
 */
export function startLink(userId: string, origin: string): { url: string; nonce: string } {
  const nonce = randomBytes(16).toString("base64url");
  const payload = b64(JSON.stringify({ u: userId, e: Date.now() + STATE_TTL_MS, n: nonce }));
  const state = `${payload}.${sign(payload)}`;
  const url = new URL("https://discord.com/oauth2/authorize");
  url.searchParams.set("client_id", appId());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri(origin));
  // identify: who they are. guilds.join: lets the bot add them to the server
  // if they are not in it yet, so linking is also joining.
  url.searchParams.set("scope", "identify guilds.join");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "none");
  return { url: url.toString(), nonce };
}

/** The student a returning state belongs to, or null if it is forged, stale or from another browser. */
export function checkState(state: string, cookieNonce: string | undefined): string | null {
  const [payload, mac] = state.split(".");
  if (!payload || !mac || !cookieNonce) return null;
  const want = Buffer.from(sign(payload));
  const got = Buffer.from(mac);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  try {
    const s = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { u?: string; e?: number; n?: string };
    if (!s.u || !s.e || s.e < Date.now() || s.n !== cookieNonce) return null;
    return s.u;
  } catch {
    return null;
  }
}

async function bot(method: string, path: string, body?: unknown, reason?: string): Promise<Response> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: {
        authorization: `Bot ${botToken()}`,
        ...(body === undefined ? {} : { "content-type": "application/json" }),
        ...(reason ? { "x-audit-log-reason": encodeURIComponent(reason) } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(8_000),
    });
    if (res.status !== 429) return res;
    const wait = Number(((await res.json().catch(() => ({}))) as { retry_after?: number }).retry_after ?? 1);
    await new Promise((r) => setTimeout(r, Math.min(10_000, Math.ceil(wait * 1000) + 250)));
  }
  throw new Error(`${method} ${path} kept hitting Discord's rate limit`);
}

type Link = { user_id: string; discord_user_id: string; discord_username: string | null };

export async function loadLink(userId: string): Promise<Link | null> {
  if (!supabaseAdmin) return null;
  const { data } = await supabaseAdmin
    .from("academy_discord_links")
    .select("user_id, discord_user_id, discord_username")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as Link | null) ?? null;
}

/** The Range student behind an id, with the email only if it was confirmed, the same rule getAcademyStudent() applies. */
async function studentById(userId: string): Promise<AcademyStudent | null> {
  if (!supabaseAdmin) return null;
  const { data } = await supabaseAdmin.auth.admin.getUserById(userId).catch(() => ({ data: null }));
  const u = data?.user;
  if (!u) return null;
  const confirmed = Boolean(u.email_confirmed_at || u.confirmed_at);
  return { id: u.id, email: confirmed ? (u.email ?? null) : null, name: null };
}

export type SyncResult = "unconfigured" | "unlinked" | "granted" | "removed" | "not-in-server" | "failed";

/**
 * Gives or takes the Pro role so it matches Range Pro right now. Never throws:
 * a Discord outage must not fail a billing webhook or a page load, and the
 * daily run puts right anything missed.
 */
export async function syncDiscordRole(userId: string, student?: AcademyStudent | null): Promise<SyncResult> {
  if (!discordLinkConfigured() || !supabaseAdmin) return "unconfigured";
  try {
    const link = await loadLink(userId);
    if (!link) return "unlinked";
    const who = student ?? (await studentById(userId));
    const pro = (await rangeEntitlement(who)).plan === "pro";
    const path = `/guilds/${guildId()}/members/${link.discord_user_id}/roles/${proRoleId()}`;
    const res = await bot(pro ? "PUT" : "DELETE", path, undefined, pro ? "Range Pro is active" : "Range Pro has ended");
    let result: SyncResult;
    if (res.ok) result = pro ? "granted" : "removed";
    else if (res.status === 404) result = "not-in-server";
    else {
      console.error("discord: role sync failed", res.status, (await res.text().catch(() => "")).slice(0, 200));
      result = "failed";
    }
    if (result !== "failed") {
      await supabaseAdmin
        .from("academy_discord_links")
        .update({ role_synced_pro: result === "granted", role_synced_at: new Date().toISOString() })
        .eq("user_id", userId);
    }
    return result;
  } catch (err) {
    console.error("discord: role sync failed", err instanceof Error ? err.message : err);
    return "failed";
  }
}

/**
 * Finishes a Discord sign-in: swaps the code for who the student is on
 * Discord, records the link, adds them to the server if they are not in it,
 * and sets the Pro role. Returns a short reason when it cannot.
 */
export async function finishLink(userId: string, code: string, origin: string): Promise<{ ok: true; username: string } | { ok: false; reason: string }> {
  if (!discordLinkConfigured() || !supabaseAdmin) return { ok: false, reason: "not-configured" };
  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: appId(),
      client_secret: clientSecret(),
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(origin),
    }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!tokenRes.ok) {
    console.error("discord: code exchange failed", tokenRes.status, (await tokenRes.text().catch(() => "")).slice(0, 200));
    return { ok: false, reason: "exchange" };
  }
  const { access_token } = (await tokenRes.json()) as { access_token: string };
  const meRes = await fetch(`${API}/users/@me`, { headers: { authorization: `Bearer ${access_token}` }, signal: AbortSignal.timeout(8_000) });
  if (!meRes.ok) return { ok: false, reason: "identify" };
  const me = (await meRes.json()) as { id: string; username: string; global_name?: string | null };

  // One Discord account belongs to one Range account. Linking it again from a
  // different Range account moves it, and that old account stops driving its role.
  await supabaseAdmin.from("academy_discord_links").delete().eq("discord_user_id", me.id).neq("user_id", userId);
  const { error } = await supabaseAdmin
    .from("academy_discord_links")
    .upsert({ user_id: userId, discord_user_id: me.id, discord_username: me.username, linked_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) {
    console.error("discord: could not save link", error.message);
    return { ok: false, reason: "save" };
  }

  // Into the server, if they are not there already. 201 added, 204 already a
  // member. A refusal here still leaves the link in place: they can join with
  // the invite, and the daily run gives them the role once they are in.
  await bot("PUT", `/guilds/${guildId()}/members/${me.id}`, { access_token }, "Linked their Range account").catch(() => null);

  await syncDiscordRole(userId);
  return { ok: true, username: me.username };
}

/** Takes the Pro role back, then forgets the link. */
export async function unlink(userId: string): Promise<void> {
  if (!supabaseAdmin) return;
  const link = await loadLink(userId);
  if (link && discordLinkConfigured()) {
    await bot("DELETE", `/guilds/${guildId()}/members/${link.discord_user_id}/roles/${proRoleId()}`, undefined, "Unlinked their Range account").catch(() => null);
  }
  await supabaseAdmin.from("academy_discord_links").delete().eq("user_id", userId);
}

/** Every linked student, for the daily run. */
export async function allLinkedUserIds(): Promise<string[]> {
  if (!supabaseAdmin) return [];
  const ids: string[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabaseAdmin.from("academy_discord_links").select("user_id").range(from, from + 999);
    if (error) {
      console.error("discord: could not list links", error.message);
      break;
    }
    ids.push(...(data ?? []).map((r) => r.user_id as string));
    if (!data || data.length < 1000) break;
  }
  return ids;
}
