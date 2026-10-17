// Small animated drawings for the lesson slides, one per kind of topic. Drawn
// in SVG and moved with CSS (lesson-deck.css, the lka- classes), so they
// take the accent color in either theme and cost no image downloads. Each
// one's resting frame is a finished picture, so with reduced motion they
// simply hold still.

import { CARTOON_NAMES, CartoonArt, type Cartoon } from "./cartoon-art";
import { EXPLAINER_NAMES, ExplainerArt, type Explainer } from "./explainer-art";
import { splitLessonIntoDeck } from "@/lib/lesson-deck";

export const SCENE_NAMES = [
  "lock",
  "scan",
  "server",
  "bug",
  "radar",
  "gauge",
  "search",
  "people",
  "tree",
  "network",
  "terminal",
  "handshake",
  "ports",
  "tls",
  "layers",
  "transform",
  "badge",
  "keys",
  "door",
  "ticket",
  "move",
  "firewall",
  "ddos",
  "logs",
  "mail",
  "dns",
  "backup",
  "infect",
  "isolate",
  "deck",
  ...CARTOON_NAMES,
  ...EXPLAINER_NAMES,
] as const;
export type Scene = (typeof SCENE_NAMES)[number];

export function isScene(name: string | undefined): name is Scene {
  return Boolean(name && (SCENE_NAMES as readonly string[]).includes(name));
}

const isCartoon = (scene: Scene): scene is Cartoon => (CARTOON_NAMES as readonly string[]).includes(scene);
const isExplainer = (scene: Scene): scene is Explainer => (EXPLAINER_NAMES as readonly string[]).includes(scene);

// First match wins, so the narrower words sit above the broader ones.
const SCENES: [RegExp, Scene][] = [
  // Explainers first: where a slide teaches one of these ideas, the drawing
  // that shows the idea happening beats any picture of the topic.
  [/confidential/i, "leak"],
  [/hashing and integrity|what a hash tells|same input|sha-?256/i, "avalanche"],
  [/\bintegrity\b/i, "lie"],
  [/\bavailability\b/i, "lockout"],
  [/^risk\b|risk = |likelihood × impact|threat × vulnerability/i, "riskmix"],
  [/\bsalt/i, "salt"],
  [/encryption and keys|what encryption does|two kinds of keys|wrong key/i, "wrongkey"],
  [/\bmfa\b|multi-factor|second factor/i, "mfa"],
  [/overview|introduc|questions answered|this week/i, "presenter"],
  [/phish/i, "phished"],
  [/insider|leaver|left the company|stale account|contractor/i, "insider"],
  [/attacker|criminal|hacker|adversar|nation-state|intrusion/i, "attacker"],
  [/help ?desk|caller|phone call|on the call|support call/i, "helpdesk"],
  [/analyst|\bsoc\b|siem|on the desk|triage|alert fires|working a/i, "analyst"],
  [/investigat|evidence|clue|read the account|find an account|look ?up/i, "detective"],
  [/handshake|\bsyn\b|syn-ack/i, "handshake"],
  [/\bcontain\b|containment|isolat|quarantin/i, "isolate"],
  [/virus|worm|trojan|ransomware|spyware|infostealer|rootkit|malware|infect/i, "infect"],
  [/\blogs?\b|event ids?|sign-in record|login record/i, "logs"],
  [/firewall/i, "firewall"],
  [/ddos|denial of service/i, "ddos"],
  [/e-?mail|smtp|imap|pop3|phish/i, "mail"],
  [/\bdns\b|dhcp|name lookup/i, "dns"],
  [/backup|redundan|restore/i, "backup"],
  [/\btls\b|\bssl\b|https|certificate|in transit/i, "tls"],
  [/\bports?\b/i, "ports"],
  [/tcp\/?ip|protocol|\blayers?\b|\budp\b/i, "layers"],
  [/encod|base64|three ways|tell them apart/i, "transform"],
  [/broken access|access control|\bidor\b|direct object|forced browsing|parameter/i, "door"],
  [/password|credential|key\b|keys\b|encrypt|decrypt|cipher|confidential|secret|leak|private/i, "lock"],
  [/hash|integrity|tamper|fingerprint|verify|checksum/i, "scan"],
  [/authenticat|\bmfa\b|factor|sign-?in|log ?on|passkey|unlock|reset|locked out|lockout/i, "badge"],
  [/authoriz|least privilege|need to know|separation of duties|\broles?\b|access levels?/i, "keys"],
  [/ticket|help ?desk|queue|escalat/i, "ticket"],
  [/\bmove\b|moving|relocat/i, "move"],
  [/connects?\b|chain|together/i, "people"],
  [/availab|outage|uptime|server|domain controller|database|backup/i, "server"],
  [/vulnerab|patch|cve|flaw|weakness|exploit/i, "bug"],
  [/threat|attack|phish|malware|adversar|alert|detect/i, "radar"],
  [/risk|sever|cvss|score|priorit|impact|likelihood/i, "gauge"],
  [/find|search|look ?up|locate|read the account/i, "search"],
  [/organizational unit|\bous?\b|folder|tree|org chart|hierarch/i, "tree"],
  [/\bgroups?\b|members?|account|user|staff|service account|admin|privilege|access|permission|policy|gpo/i, "people"],
  [/network|dns|traffic|packet|\bip\b|port|join|computer|workstation|domain/i, "network"],
  [/powershell|command|script|terminal|cmd|install|set ?up|build|environment/i, "terminal"],
];

// Used when nothing in a slide names a topic, or every match was already
// shown earlier in the same lesson.
const FALLBACK: Scene[] = ["presenter", "analyst", "detective", "deck", "people", "layers", "network", "terminal", "gauge", "radar", "search"];
// Then every other drawing in turn, so a whole week runs before one repeats.
const FILLER: Scene[] = SCENE_NAMES.filter((s) => !(EXPLAINER_NAMES as readonly string[]).includes(s));

/**
 * Drawings for every lesson tab in a week, picked in order with one shared
 * memory, so the Integrity tab does not reuse what Confidentiality showed.
 */
export function weekScenes(sections: { label: string; markdown: string }[]): Scene[][] {
  const used = new Set<Scene>();
  // Each tab's signature drawing (the best match for its own name) is held
  // for that tab, so an overview that mentions access control in passing
  // does not take the door that belongs to Broken Access Control.
  const signature = sections.map((s) => sceneCandidates(s.label)[0]);
  return sections.map((s, i) => {
    const held = new Set(signature.filter((sig, j): sig is Scene => Boolean(sig) && j !== i));
    return pickScenes(splitLessonIntoDeck(s.markdown, s.label), s.label, used, held);
  });
}

/** Every drawing that fits, best first: the title's matches, then the body's, then the section's. */
export function sceneCandidates(...texts: string[]): Scene[] {
  const out: Scene[] = [];
  for (const text of texts) for (const [re, scene] of SCENES) if (re.test(text) && !out.includes(scene)) out.push(scene);
  return out;
}

export function sceneFor(...texts: string[]): Scene {
  return sceneCandidates(...texts)[0] ?? "deck";
}

/**
 * One drawing per slide with no repeats inside a lesson: each slide takes its
 * best match not already used, then a fallback, and only repeats once every
 * option is spent. An author's <!-- art --> pick always wins.
 */
export function pickScenes(
  slides: { title: string; markdown: string; art?: string; visual?: boolean; activity?: unknown; recap?: unknown }[],
  label: string,
  /** Drawings already shown earlier in the week, so a later tab does not repeat them. */
  used: Set<Scene> = new Set<Scene>(),
  /** Drawings held for another tab this week. */
  held: Set<Scene> = new Set<Scene>()
): Scene[] {
  return slides.map((s) => {
    // A screenshot or an activity fills the slide, so it does not spend a drawing.
    if (s.visual || s.activity || s.recap) return "deck";
    if (isScene(s.art)) {
      used.add(s.art);
      return s.art;
    }
    // An explainer belongs to the slide or tab whose subject it is, so a body
    // that merely mentions the idea in passing does not spend it, and it is
    // never filler.
    const fromBody = sceneCandidates(s.markdown).filter((c) => !(EXPLAINER_NAMES as readonly string[]).includes(c));
    const options = [...sceneCandidates(s.title), ...fromBody, ...sceneCandidates(label), ...FALLBACK, ...FILLER];
    const pick = options.find((o) => !used.has(o) && !held.has(o)) ?? options.find((o) => !used.has(o)) ?? options[0];
    used.add(pick);
    return pick;
  });
}

const delay = (s: number) => ({ animationDelay: `${s}s` });

export function SlideArt({ scene }: { scene: Scene }) {
  return (
    <svg viewBox="0 0 200 200" className={`lka lka--${scene}`} aria-hidden focusable="false">
      {isExplainer(scene) && <ExplainerArt scene={scene} />}
      {isCartoon(scene) && (
        <>
          <ellipse className="lkc-shadow" cx="100" cy="186" rx="68" ry="6" />
          <g className="lkc-body">
            <CartoonArt scene={scene} />
          </g>
        </>
      )}
      {scene === "lock" && (
        <>
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} className="lka-bit" cx="14" cy="125" r="4" style={delay(i * 0.6)} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} className="lka-cipher" x="142" y="122" width="12" height="6" rx="2" style={delay(i * 0.6 + 0.3)} />
          ))}
          <path className="lka-line lka-shackle" d="M78 96 V74 a22 22 0 0 1 44 0 V96" />
          <rect className="lka-solid" x="62" y="94" width="76" height="62" rx="8" />
          <circle className="lka-hole" cx="100" cy="119" r="7" />
          <rect className="lka-hole" x="97" y="122" width="6" height="16" rx="2" />
        </>
      )}

      {scene === "scan" && (
        <>
          <rect className="lka-line" x="56" y="34" width="88" height="124" rx="6" />
          {[56, 72, 88, 104, 120].map((y, i) => (
            <rect key={y} className="lka-text" x="70" y={y} width={i % 2 ? 46 : 60} height="6" rx="3" />
          ))}
          <rect className="lka-scanbar" x="50" y="34" width="100" height="4" rx="2" />
          <g className="lka-ok">
            <circle cx="142" cy="152" r="18" />
            <path d="M133 152 l6 6 l12 -13" />
          </g>
        </>
      )}

      {scene === "server" && (
        <>
          {[34, 66, 98].map((y, i) => (
            <g key={y}>
              <rect className="lka-line" x="50" y={y} width="100" height="26" rx="4" />
              <circle className="lka-led" cx="66" cy={y + 13} r="4" style={delay(i * 0.45)} />
              <rect className="lka-text" x="80" y={y + 10} width="54" height="6" rx="3" />
            </g>
          ))}
          <path className="lka-line lka-pulse" d="M14 160 H66 L76 140 L88 178 L98 150 L106 160 H186" />
        </>
      )}

      {scene === "bug" && (
        <>
          <path className="lka-line" d="M100 28 L154 48 V98 C154 134 130 158 100 172 C70 158 46 134 46 98 V48 Z" />
          <path className="lka-crack" d="M100 56 L90 84 L106 100 L94 128" />
          <g className="lka-bugbody">
            <ellipse className="lka-solid" cx="146" cy="146" rx="11" ry="14" />
            <path className="lka-line" d="M135 140 l-9 -5 M135 148 h-10 M135 156 l-9 5 M157 140 l9 -5 M157 148 h10 M157 156 l9 5 M140 133 l-4 -7 M152 133 l4 -7" />
          </g>
        </>
      )}

      {scene === "radar" && (
        <>
          <circle className="lka-line lka-faint" cx="100" cy="100" r="72" />
          <circle className="lka-line lka-faint" cx="100" cy="100" r="48" />
          <circle className="lka-line lka-faint" cx="100" cy="100" r="24" />
          <path className="lka-line lka-faint" d="M100 28 V172 M28 100 H172" />
          <path className="lka-sweep" d="M100 100 L100 28 A72 72 0 0 1 162 64 Z" />
          <circle className="lka-blip" cx="136" cy="70" r="6" />
          <circle className="lka-blip" cx="70" cy="132" r="5" style={delay(2)} />
        </>
      )}

      {scene === "gauge" && (
        <>
          <path className="lka-arc lka-arc--good" d="M36 140 A64 64 0 0 1 68 84.6" />
          <path className="lka-arc lka-arc--warn" d="M72 82.4 A64 64 0 0 1 128 82.4" />
          <path className="lka-arc lka-arc--bad" d="M132 84.6 A64 64 0 0 1 164 140" />
          <g className="lka-needle">
            <path className="lka-line" d="M100 140 L100 88" />
            <circle className="lka-solid" cx="100" cy="140" r="8" />
          </g>
          <rect className="lka-text" x="60" y="160" width="80" height="8" rx="4" />
        </>
      )}

      {scene === "search" && (
        <>
          {[44, 74, 104, 134].map((y, i) => (
            <rect key={y} className={i === 2 ? "lka-row lka-row--hit" : "lka-row"} x="30" y={y} width="120" height="20" rx="4" />
          ))}
          <g className="lka-glass">
            <circle className="lka-line" cx="150" cy="54" r="16" />
            <path className="lka-line" d="M162 66 L176 80" />
          </g>
        </>
      )}

      {scene === "people" && (
        <>
          {[
            [100, 34],
            [160, 78],
            [138, 152],
            [62, 152],
            [40, 78],
          ].map(([x, y], i) => (
            <g key={i}>
              <path className="lka-line lka-link" d={`M100 100 L${x} ${y}`} style={delay(i * 0.3)} />
              <circle className="lka-node" cx={x} cy={y} r="14" style={delay(i * 0.3)} />
              <circle className="lka-hole" cx={x} cy={y - 3} r="4" />
              <path className="lka-hole" d={`M${x - 7} ${y + 8} a7 6 0 0 1 14 0 Z`} />
            </g>
          ))}
          <circle className="lka-solid lka-hub" cx="100" cy="100" r="16" />
        </>
      )}

      {scene === "tree" && (
        <>
          <path className="lka-line lka-branch" d="M100 50 V70 M54 70 H146 M54 70 V90 M146 70 V90" />
          <path className="lka-line lka-branch" d="M54 110 V126 M32 126 H76 M32 126 V140 M76 126 V140" style={delay(0.6)} />
          <path className="lka-line lka-branch" d="M146 110 V126 M124 126 H168 M124 126 V140 M168 126 V140" style={delay(0.9)} />
          <rect className="lka-solid lka-pop" x="80" y="28" width="40" height="22" rx="4" />
          {[
            [34, 90, 0.3],
            [126, 90, 0.45],
            [16, 140, 0.8],
            [60, 140, 0.9],
            [108, 140, 1.1],
            [152, 140, 1.2],
          ].map(([x, y, d]) => (
            <rect key={`${x}-${y}`} className="lka-node lka-pop" x={x} y={y} width="32" height="20" rx="4" style={delay(d)} />
          ))}
        </>
      )}

      {scene === "network" && (
        <>
          <rect className="lka-line" x="14" y="72" width="60" height="42" rx="4" />
          <path className="lka-line" d="M36 124 H52 M44 114 V124" />
          <rect className="lka-line" x="128" y="58" width="56" height="74" rx="4" />
          {[74, 92, 110].map((y, i) => (
            <circle key={y} className="lka-led" cx="142" cy={y} r="3.5" style={delay(i * 0.5)} />
          ))}
          <path className="lka-line lka-faint" d="M74 88 H128 M74 100 H128" />
          <circle className="lka-packet" cx="80" cy="88" r="4" />
          <circle className="lka-packet lka-packet--back" cx="122" cy="100" r="4" style={delay(1)} />
        </>
      )}

      {scene === "terminal" && (
        <>
          <rect className="lka-line" x="22" y="40" width="156" height="120" rx="8" />
          <path className="lka-line lka-faint" d="M22 60 H178" />
          {[34, 46, 58].map((x) => (
            <circle key={x} className="lka-hole lka-dot" cx={x} cy="50" r="3" />
          ))}
          {[
            [76, 80],
            [98, 108],
            [120, 64],
          ].map(([y, w], i) => (
            <g key={y}>
              <path className="lka-line" d={`M36 ${y - 4} l6 4 l-6 4`} />
              <rect className="lka-type" x="50" y={y - 3} width={w} height="6" rx="3" style={delay(i * 0.9)} />
            </g>
          ))}
          <rect className="lka-cursor" x="50" y="134" width="10" height="12" rx="1" />
        </>
      )}

      {scene === "handshake" && (
        <>
          <rect className="lka-line" x="12" y="48" width="36" height="104" rx="5" />
          <rect className="lka-line" x="152" y="48" width="36" height="104" rx="5" />
          <circle className="lka-linkup" cx="30" cy="136" r="5" />
          <circle className="lka-linkup" cx="170" cy="136" r="5" />
          <g className="lka-msg">
            <path className="lka-line" d="M56 66 H142 M134 59 L142 66 L134 73" />
            <text className="lka-label" x="99" y="56" textAnchor="middle">SYN</text>
          </g>
          <g className="lka-msg lka-msg--back" style={delay(0.9)}>
            <path className="lka-line" d="M144 100 H58 M66 93 L58 100 L66 107" />
            <text className="lka-label" x="101" y="90" textAnchor="middle">SYN-ACK</text>
          </g>
          <g className="lka-msg" style={delay(1.8)}>
            <path className="lka-line" d="M56 134 H142 M134 127 L142 134 L134 141" />
            <text className="lka-label" x="99" y="124" textAnchor="middle">ACK</text>
          </g>
        </>
      )}

      {scene === "ports" && (
        <>
          <rect className="lka-line" x="46" y="20" width="108" height="160" rx="8" />
          {["22", "53", "443", "3389"].map((port, i) => (
            <g key={port}>
              <rect className="lka-port" x="62" y={36 + i * 36} width="76" height="26" rx="4" style={delay(i * 0.8)} />
              <text className="lka-label" x="100" y={53 + i * 36} textAnchor="middle">
                {port}
              </text>
            </g>
          ))}
          <circle className="lka-packet lka-packet--port" cx="16" cy="49" r="5" />
        </>
      )}

      {scene === "tls" && (
        <>
          <rect className="lka-line" x="8" y="84" width="40" height="30" rx="3" />
          <path className="lka-line" d="M20 122 H36" />
          <rect className="lka-line" x="158" y="70" width="34" height="58" rx="4" />
          <path className="lka-line lka-tube" d="M52 90 H154 M52 110 H154" />
          {[0, 1, 2].map((i) => (
            <circle key={i} className="lka-tlspkt" cx="58" cy="100" r="4" style={delay(i * 0.7)} />
          ))}
          <g className="lka-bob">
            <path className="lka-line" d="M95 58 v-7 a8 8 0 0 1 16 0 v7" />
            <rect className="lka-solid" x="89" y="56" width="28" height="22" rx="4" />
          </g>
          <g className="lka-eye">
            <path className="lka-line lka-faint" d="M78 152 Q103 132 128 152 Q103 172 78 152 Z" />
            <circle className="lka-solid lka-pupil" cx="103" cy="152" r="5" />
            <path className="lka-crack" d="M76 170 L130 134" />
          </g>
        </>
      )}

      {scene === "layers" && (
        <>
          {["Application", "Transport · TCP", "Internet · IP", "Link"].map((name, i) => (
            <g key={name}>
              <rect className="lka-slab" x="28" y={36 + i * 34} width="124" height="26" rx="4" style={delay(i * 0.6)} />
              <text className="lka-label lka-label--sm" x="90" y={53 + i * 34} textAnchor="middle">
                {name}
              </text>
            </g>
          ))}
          <circle className="lka-solid lka-drop" cx="172" cy="49" r="6" />
        </>
      )}

      {scene === "transform" && (
        <>
          <rect className="lka-solid" x="8" y="88" width="50" height="24" rx="4" />
          <text className="lka-label lka-label--inv" x="33" y="104" textAnchor="middle">Hello</text>
          {[
            ["M58 100 C82 100 82 50 106 50", 40, "SGVsbG8=", 0],
            ["M58 100 H106", 89, "U2FsdGV…", 0.7],
            ["M58 100 C82 100 82 150 106 150", 138, "185f8db3…", 1.4],
          ].map(([d, y, text, at]) => (
            <g key={text as string}>
              <path className="lka-line lka-wire" d={d as string} style={delay(at as number)} />
              <g className="lka-pop" style={delay((at as number) + 0.4)}>
                <rect className="lka-node" x="106" y={y as number} width="86" height="22" rx="4" />
                <text className="lka-label lka-label--sm" x="149" y={(y as number) + 15} textAnchor="middle">
                  {text as string}
                </text>
              </g>
            </g>
          ))}
        </>
      )}

      {scene === "badge" && (
        <>
          <rect className="lka-line" x="16" y="48" width="104" height="72" rx="8" />
          <circle className="lka-node" cx="44" cy="80" r="13" />
          <rect className="lka-text" x="66" y="72" width="42" height="6" rx="3" />
          <rect className="lka-text" x="66" y="86" width="30" height="6" rx="3" />
          <rect className="lka-cardscan" x="12" y="48" width="112" height="4" rx="2" />
          <rect className="lka-line" x="136" y="62" width="48" height="86" rx="8" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} className="lka-code" x={144 + i * 9} y="100" width="6" height="10" rx="2" style={delay(0.8 + i * 0.25)} />
          ))}
          <g className="lka-ok">
            <circle cx="68" cy="152" r="18" />
            <path d="M59 152 l6 6 l12 -13" />
          </g>
        </>
      )}

      {scene === "keys" && (
        <>
          {[
            [24, "Files", "lka-open"],
            [82, "Print", "lka-open lka-open--2"],
            [140, "DC", "lka-shut"],
          ].map(([x, name, cls]) => (
            <g key={name as string}>
              <text className="lka-label lka-label--sm" x={(x as number) + 18} y="40" textAnchor="middle">
                {name as string}
              </text>
              <rect className="lka-line" x={x as number} y="48" width="36" height="72" rx="3" />
              <rect className={`lka-panel ${cls}`} x={x as number} y="48" width="36" height="72" rx="3" />
            </g>
          ))}
          <path className="lka-deny" d="M148 76 l20 20 M168 76 l-20 20" />
          <g className="lka-key">
            <circle className="lka-line" cx="34" cy="152" r="9" />
            <path className="lka-line" d="M43 152 H64 M56 152 v8 M62 152 v6" />
          </g>
        </>
      )}

      {scene === "door" && (
        <>
          <rect className="lka-line lka-faint" x="12" y="20" width="176" height="26" rx="13" />
          <text className="lka-label lka-label--sm" x="26" y="37">/record?id=104</text>
          <text className="lka-label lka-label--sm lka-id-a" x="116" y="37">2</text>
          <text className="lka-label lka-label--sm lka-id-b" x="116" y="37">3</text>
          <path className="lka-beam" d="M70 72 H130 V170 H70 Z" />
          <rect className="lka-line" x="66" y="68" width="68" height="104" rx="3" />
          <rect className="lka-panel lka-swing" x="66" y="68" width="68" height="104" rx="3" />
          <g className="lka-blip lka-warnmark">
            <circle cx="160" cy="84" r="12" />
            <path d="M160 77 v8 M160 90 v1" />
          </g>
        </>
      )}

      {scene === "ticket" && (
        <>
          <g className="lka-slidein">
            <rect className="lka-line" x="28" y="52" width="144" height="84" rx="8" />
            <circle className="lka-hole" cx="28" cy="94" r="9" />
            <circle className="lka-hole" cx="172" cy="94" r="9" />
            <rect className="lka-text" x="48" y="70" width="76" height="7" rx="3.5" />
            <rect className="lka-text" x="48" y="86" width="104" height="6" rx="3" />
            <rect className="lka-status" x="48" y="106" width="46" height="14" rx="7" />
          </g>
          <g className="lka-ok">
            <circle cx="150" cy="138" r="18" />
            <path d="M141 138 l6 6 l12 -13" />
          </g>
        </>
      )}

      {scene === "move" && (
        <>
          <path className="lka-line" d="M12 96 H40 L46 104 H86 V156 H12 Z" />
          <path className="lka-line" d="M114 96 H142 L148 104 H188 V156 H114 Z" />
          <text className="lka-label lka-label--sm" x="49" y="176" textAnchor="middle">Sales</text>
          <text className="lka-label lka-label--sm" x="151" y="176" textAnchor="middle">Finance</text>
          <g className="lka-hop">
            <rect className="lka-node" x="30" y="114" width="38" height="32" rx="5" />
            <circle className="lka-solid" cx="49" cy="125" r="5" />
            <path className="lka-solid" d="M40 140 a9 7 0 0 1 18 0 Z" />
          </g>
        </>
      )}

      {scene === "firewall" && (
        <>
          {[0, 1, 2, 3, 4, 5, 6].map((row) =>
            row === 3 ? null : (
              <g key={row}>
                <rect className="lka-brick" x={row % 2 ? 84 : 92} y={30 + row * 20} width="16" height="16" rx="2" />
                <rect className="lka-brick" x={row % 2 ? 102 : 110} y={30 + row * 20} width="16" height="16" rx="2" />
              </g>
            )
          )}
          <circle className="lka-bounce" cx="16" cy="58" r="6" />
          <circle className="lka-bounce" cx="16" cy="138" r="6" style={delay(1)} />
          <circle className="lka-pass" cx="16" cy="98" r="6" style={delay(0.5)} />
        </>
      )}

      {scene === "ddos" && (
        <>
          <g className="lka-strain">
            <rect className="lka-line" x="138" y="56" width="48" height="88" rx="6" />
            {[76, 100, 124].map((y, i) => (
              <circle key={y} className="lka-led lka-led--bad" cx="152" cy={y} r="4" style={delay(i * 0.2)} />
            ))}
            <rect className="lka-text" x="162" y="72" width="16" height="6" rx="3" />
            <rect className="lka-text" x="162" y="96" width="16" height="6" rx="3" />
            <rect className="lka-text" x="162" y="120" width="16" height="6" rx="3" />
          </g>
          {/* Packets start spread down the left edge and converge on the server. */}
          {[30, 160, 70, 110, 50, 140, 90, 180].map((y, i) => (
            <circle
              key={i}
              className="lka-swarm"
              cx="14"
              cy={y}
              r="4"
              style={{ ...delay(i * 0.18), ["--dy" as string]: `${100 - y}px` }}
            />
          ))}
        </>
      )}

      {scene === "logs" && (
        <>
          <defs>
            <clipPath id="lka-logclip">
              <rect x="26" y="52" width="148" height="114" />
            </clipPath>
          </defs>
          <rect className="lka-line" x="22" y="28" width="156" height="144" rx="8" />
          <path className="lka-line lka-faint" d="M22 48 H178" />
          <g clipPath="url(#lka-logclip)">
            <g className="lka-scroll">
              {Array.from({ length: 16 }, (_, i) => (
                <g key={i}>
                  <rect className="lka-text" x="36" y={58 + i * 14} width="24" height="6" rx="3" />
                  <rect
                    className={i === 5 || i === 13 ? "lka-logbad" : "lka-text"}
                    x="66"
                    y={58 + i * 14}
                    width={[70, 92, 56, 84, 64, 98, 76, 60][i % 8]}
                    height="6"
                    rx="3"
                  />
                </g>
              ))}
            </g>
          </g>
          <g className="lka-glass lka-glass--log">
            <circle className="lka-line" cx="150" cy="140" r="14" />
            <path className="lka-line" d="M160 150 L172 162" />
          </g>
        </>
      )}

      {scene === "mail" && (
        <>
          <path className="lka-line lka-faint lka-trail" d="M20 140 Q100 40 172 110" />
          <g className="lka-fly">
            <rect className="lka-solid" x="12" y="122" width="44" height="32" rx="4" />
            <path className="lka-flap" d="M14 125 L34 140 L54 125" />
          </g>
          <rect className="lka-line" x="150" y="100" width="40" height="44" rx="4" />
          <path className="lka-line" d="M150 116 H190" />
          <circle className="lka-arrive" cx="186" cy="100" r="7" />
        </>
      )}

      {scene === "dns" && (
        <>
          <rect className="lka-node" x="8" y="40" width="80" height="26" rx="13" />
          <text className="lka-label lka-label--sm" x="48" y="57" textAnchor="middle">google.com</text>
          <g className="lka-globe">
            <circle className="lka-line" cx="100" cy="112" r="32" />
            <ellipse className="lka-line lka-faint lka-meridian" cx="100" cy="112" rx="14" ry="32" />
            <path className="lka-line lka-faint" d="M68 112 H132 M74 96 H126 M74 128 H126" />
          </g>
          <path className="lka-line lka-wire" d="M60 70 Q70 90 76 94" />
          <path className="lka-line lka-wire" d="M126 96 Q140 80 148 74" style={delay(0.9)} />
          <g className="lka-pop" style={delay(1.4)}>
            <rect className="lka-solid" x="112" y="40" width="80" height="26" rx="13" />
            <text className="lka-label lka-label--sm lka-label--inv" x="152" y="57" textAnchor="middle">IP address</text>
          </g>
        </>
      )}

      {scene === "backup" && (
        <>
          {[20, 128].map((x, i) => (
            <g key={x}>
              <ellipse className="lka-line" cx={x + 26} cy="62" rx="26" ry="9" />
              <path className="lka-line" d={`M${x} 62 V138 a26 9 0 0 0 52 0 V62`} />
              {i === 1 && <rect className="lka-fill" x={x + 4} y="74" width="44" height="64" rx="3" />}
            </g>
          ))}
          {[0, 1, 2].map((i) => (
            <rect key={i} className="lka-copy" x="58" y="92" width="18" height="22" rx="2" style={delay(i * 0.7)} />
          ))}
        </>
      )}

      {scene === "infect" && (
        <>
          <path className="lka-line lka-faint" d="M100 58 L48 140 M100 58 L152 140 M48 140 H152" />
          {[
            [100, 46, 0],
            [48, 128, 1],
            [152, 128, 2],
          ].map(([x, y, i]) => (
            <g key={i}>
              <rect className="lka-host" x={x - 26} y={y - 18} width="52" height="36" rx="4" style={delay(i * 1.1)} />
              <path className="lka-line" d={`M${x - 8} ${y + 26} H${x + 8} M${x} ${y + 18} V${y + 26}`} />
            </g>
          ))}
          <g className="lka-germ">
            <circle cx="100" cy="46" r="7" />
            <path d="M100 34 v-5 M100 58 v5 M88 46 h-5 M112 46 h5 M92 38 l-4 -4 M108 54 l4 4 M92 54 l-4 4 M108 38 l4 -4" />
          </g>
        </>
      )}

      {scene === "isolate" && (
        <>
          <circle className="lka-line lka-faint lka-ring" cx="70" cy="100" r="54" />
          <rect className="lka-line" x="40" y="78" width="60" height="42" rx="4" />
          <path className="lka-line" d="M60 130 H80 M70 120 V130" />
          <circle className="lka-germ-dot" cx="70" cy="99" r="8" />
          <path className="lka-line lka-cable-a" d="M100 100 H128" />
          <path className="lka-line lka-cable-b" d="M150 100 H186" />
          <path className="lka-crack lka-snip" d="M132 88 L146 112 M146 88 L132 112" />
        </>
      )}

      {scene === "deck" && (
        <>
          <rect className="lka-line lka-faint" x="52" y="58" width="104" height="76" rx="6" />
          <rect className="lka-line lka-faint" x="44" y="66" width="104" height="76" rx="6" />
          <g className="lka-float">
            <rect className="lka-solid" x="36" y="74" width="104" height="76" rx="6" />
            <rect className="lka-hole" x="50" y="90" width="52" height="8" rx="4" />
            <rect className="lka-hole" x="50" y="106" width="76" height="6" rx="3" />
            <rect className="lka-hole" x="50" y="118" width="64" height="6" rx="3" />
          </g>
          <circle className="lka-spark" cx="160" cy="48" r="5" />
          <circle className="lka-spark" cx="172" cy="74" r="3" style={delay(0.8)} />
        </>
      )}
    </svg>
  );
}
