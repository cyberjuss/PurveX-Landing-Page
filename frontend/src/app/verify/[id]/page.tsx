import type { Metadata } from "next";
import { findProofByCredential } from "@/lib/academy-proof-store";
import "@/components/proof/proof-public.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Verify a credential", robots: { index: false, follow: false } };

// An employer checks a portfolio credential ID here.
export default async function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const code = decodeURIComponent(id).toUpperCase().slice(0, 20);
  const found = await findProofByCredential(code);
  const live = Boolean(found?.settings.published);

  return (
    <main className="pp">
      <div className="pp__wrap">
        <header className="pp-head pp-head--plain">
          <p className="pp-kicker">PurveX Academy · Credential check</p>
          <h1>{code}</h1>
          {!found && <p className="pp-role">No credential with this ID exists. Check the ID and try again.</p>}
          {found && live && (
            <p className="pp-role">
              Valid. Issued by PurveX Academy to <b>{found.settings.displayName}</b>.{" "}
              <a href={`/p/${found.settings.slug}`}>View the portfolio</a>
            </p>
          )}
          {found && !live && <p className="pp-role">This credential is not active. {found.settings.displayName} has turned off their portfolio.</p>}
        </header>
      </div>
    </main>
  );
}
