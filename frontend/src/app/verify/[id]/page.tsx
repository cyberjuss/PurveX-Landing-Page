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

  const title = state === "valid" ? "Credential verified" : state === "inactive" ? "Credential not active" : "Credential not found";
  const detail =
    state === "valid"
      ? "This is a genuine, current credential issued by PurveX Academy."
      : state === "inactive"
        ? "This credential exists, but its holder has made their portfolio private."
        : wellFormed
          ? "No PurveX credential matches this ID."
          : "This is not a valid PurveX credential ID. IDs look like PX-A4YT-Q5.";

  return (
    <main className="vf">
      <div className="vf-card">
        <header className="vf-brand">
          <Link href="/" aria-label="PurveX home">
            <Image src="/logo.png" alt="" width={26} height={26} priority />
            <span>PurveX</span>
          </Link>
          <small>Credential verification</small>
        </header>

        <section className={`vf-result vf-result--${state}`} role="status">
          <span className="vf-result__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              {state === "valid" ? <path d="m6 12.5 4 4 8-9" /> : state === "inactive" ? <path d="M12 7v6m0 4h.01" /> : <path d="m7 7 10 10M17 7 7 17" />}
            </svg>
          </span>
          <h1>{title}</h1>
          <p>{detail}</p>
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
        </dl>

        {state === "valid" && found && (
          <Link className="vf-btn" href={`/p/${found.settings.slug}`}>
            View portfolio
          </Link>
        )}

        <footer className="vf-foot">Checked live on purvex.io · {checkedAt}</footer>
      </div>
    </main>
  );
}
