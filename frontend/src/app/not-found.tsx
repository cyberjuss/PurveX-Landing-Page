import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm px-10 py-12 max-w-md shadow-sm">
        <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden />
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground font-[family-name:var(--font-display)]">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          The page you requested does not exist or was moved. Check the URL or return home.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
