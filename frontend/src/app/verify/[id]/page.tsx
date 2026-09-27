import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { findProofByCredential } from "@/lib/academy-proof-store";
import "./verify.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Credential verification", robots: { index: false, follow: false } };

const ID_FORMAT = /^PX-[A-Z0-9]{4}-[A-Z0-9]{2}$/;
const stamp = (d: Date) => d.toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC", timeZoneName: "short" });
const dateOnly = (iso: string) => (iso ? new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }) : "");

// An employer checks a portfolio credential ID here. A private portfolio's
// credential shows as not active and never reveals who holds it.
export default async function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const code = decodeURIComponent(id).trim().toUpperCase().slice(0, 20);
  const wellFormed = ID_FORMAT.test(code);
  const found = wellFormed ? await findProofByCredential(code) : null;
  const state = !found ? "missing" : found.settings.published ? "valid" : "inactive";
  const checkedAt = stamp(new Date());

  return (
    <main className="vf">
      <div className="vf-card">
        <header className="vf-brand">
          <Link href="/" aria-label="PurveX home">
            <Image src="/logo.png" alt="" width={30} height={30} priority />
            <span>PurveX</span>
          </Link>
          <small>Credential verification</small>
        </header>

        <section className={`vf-status vf-status--${state}`} role="status">
          <span className="vf-status__icon" aria-hidden="true">
            {state === "valid" ? (
              <svg viewBox="0 0 24 24">
                <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" />
                <path d="m8.5 12 2.5 2.5 4.5-5" />
              </svg>
            ) : state === "inactive" ? (
              <svg viewBox="0 0 24 24">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6M9 9l6 6" />
              </svg>
            )}
          </span>
          <div>
            <h1>{state === "valid" ? "Verified credential" : state === "inactive" ? "Credential not active" : "Credential not found"}</h1>
            <p>
              {state === "valid" && "This credential is genuine and current. It was issued by PurveX Academy for lab work confirmed in the holder's own lab."}
              {state === "inactive" && "This credential exists, but its holder has made their portfolio private. Ask them to make it public, then check again."}
              {state === "missing" && (wellFormed ? "No PurveX credential has this ID. Check it against the portfolio or PDF you were given." : "This is not a valid PurveX credential ID. IDs look like PX-A4YT-Q5.")}
            </p>
          </div>
        </section>

        <dl className="vf-details">
          <div>
            <dt>Credential ID</dt>
            <dd>
              <code>{code || "None"}</code>
            </dd>
          </div>
          {state === "valid" && found && (
            <>
              <div>
                <dt>Issued to</dt>
                <dd>{found.settings.displayName}</dd>
              </div>
              <div>
                <dt>Issued by</dt>
                <dd>PurveX Academy</dd>
              </div>
              {found.settings.updatedAt && (
                <div>
                  <dt>Last updated</dt>
                  <dd>{dateOnly(found.settings.updatedAt)}</dd>
                </div>
              )}
            </>
          )}
          <div>
            <dt>Status</dt>
            <dd className={`vf-pill vf-pill--${state}`}>{state === "valid" ? "Active" : state === "inactive" ? "Not active" : "Not found"}</dd>
          </div>
          <div>
            <dt>Checked</dt>
            <dd>{checkedAt}</dd>
          </div>
        </dl>

        {state === "valid" && found && (
          <Link className="vf-btn" href={`/p/${found.settings.slug}`}>
            View {found.settings.displayName.split(" ")[0]}&rsquo;s portfolio
          </Link>
        )}

        <footer className="vf-foot">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <p>
            This result is read live from PurveX records each time the page loads. Only a page at <b>purvex.io/verify</b> can confirm a PurveX credential. A screenshot or PDF of this page is not proof.
          </p>
        </footer>
      </div>
    </main>
  );
}
