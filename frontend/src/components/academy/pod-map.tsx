"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Database, Globe, Loader2, Monitor, Route, ShieldCheck, X, type LucideIcon } from "lucide-react";
import { academyFetch } from "@/lib/academy-client";
import "./pod-map.css";

// The pod's own network, read from the lab's live snapshot rather than
// drawn from memory -- same data the "confirm the map" challenge has the
// student pull by hand, surfaced here as an at-a-glance picture instead.
// That challenge's own point (ask the machine, not a summary) still stands:
// this is an orientation aid for a lab the student has not opened yet, not
// a replacement for reading the real ports off their own machine.
type Node = { role: "dc" | "desktop"; label: string; os: string; ip: string | null };
type Dns = { name: string; ip: string };
type Rule = { name: string; enabled: boolean; direction: string; action: string; localPort: string; remoteAddress: string };
type Network = { nodes: Node[]; dns: Dns[]; firewall: Rule[] };

function useNetwork() {
  const [net, setNet] = useState<Network | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    academyFetch("/academy/api/hosted-lab/network")
      .then((r) => r.json())
      .then((d: Network & { error?: string }) => {
        if (!alive) return;
        if (d.error) setError(d.error);
        else setNet(d);
      })
      .catch(() => {
        if (alive) setError("Could not reach AWS. Try again in a minute.");
      });
    return () => {
      alive = false;
    };
  }, []);
  return { net, error };
}

/** A bigger, illustrated version of the portal's usual tinted-square mark: a
 *  soft glow behind the icon and a slow ring around it, the same stage
 *  treatment lesson art gets, scaled down to a node in a diagram instead of
 *  a whole slide. */
function Glyph({ Icon, tone }: { Icon: LucideIcon; tone?: "accent" | "good" | "muted" }) {
  return (
    <span className={`pm__glyph${tone ? ` pm__glyph--${tone}` : ""}`} aria-hidden>
      <span className="pm__glyph-glow" />
      <span className="pm__glyph-ring" />
      <Icon className="h-6 w-6" />
    </span>
  );
}

function PodNode({ node }: { node: Node }) {
  const Icon = node.role === "dc" ? Database : Monitor;
  return (
    <div className="pm__node">
      <Glyph Icon={Icon} tone="accent" />
      <div>
        <em>{node.role === "dc" ? "DC" : "DESKTOP"}</em>
        <strong>{node.label}</strong>
        <small>{node.os}</small>
      </div>
      <code>{node.ip ?? "—"}</code>
    </div>
  );
}

export function PodMap({ onClose }: { onClose: () => void }) {
  const { net, error } = useNetwork();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  const dc = net?.nodes.find((n) => n.role === "dc");
  const desktop = net?.nodes.find((n) => n.role === "desktop");

  return createPortal(
    <div className="pm" role="dialog" aria-modal="true" aria-labelledby="pm-title">
      <div className="pm__scrim" onClick={onClose} />
      <div className="pm__panel" ref={panel} tabIndex={-1}>
        <header className="pm__head">
          <div>
            <p className="pm__kicker">Your hosted lab</p>
            <h2 className="pm__title" id="pm-title">
              How your pod connects
            </h2>
          </div>
          <button type="button" className="pm__x" onClick={onClose} aria-label="Close">
            <X className="h-[18px] w-[18px]" aria-hidden />
          </button>
        </header>

        {error ? (
          <p className="pm__error" role="alert">
            {error}
          </p>
        ) : !net ? (
          <p className="pm__loading">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Reading your pod&apos;s network…
          </p>
        ) : (
          <>
            <div className="pm__stage">
              <div className="pm__tier">
                <Glyph Icon={Globe} tone="muted" />
                <span className="pm__tier-label">Internet</span>
              </div>
              <div className="pm__flow pm__flow--v" aria-hidden="true">
                <span className="pm__wire pm__wire--v" />
                <span className="pm__pulse pm__pulse--v" />
              </div>
              <div className="pm__tier">
                <Glyph Icon={ShieldCheck} tone="good" />
                <span className="pm__tier-label">Firewall</span>
                {net.firewall.length > 0 && (
                  <em className="pm__tier-count">
                    {net.firewall.length} rule{net.firewall.length === 1 ? "" : "s"}
                  </em>
                )}
              </div>
              <div className="pm__flow pm__flow--v" aria-hidden="true">
                <span className="pm__wire pm__wire--v" />
                <span className="pm__pulse pm__pulse--v" />
              </div>
              <div className="pm__pod">
                <p className="pm__pod-label">purvexfinancial.local</p>
                <div className="pm__rack">
                  {dc && <PodNode node={dc} />}
                  {desktop && (
                    <div className="pm__link" aria-hidden="true">
                      <span className="pm__wire" />
                      <span className="pm__pulse" />
                    </div>
                  )}
                  {desktop && <PodNode node={desktop} />}
                </div>
              </div>
            </div>

            {(net.dns.length > 0 || net.firewall.length > 0) && (
              <div className="pm__lists">
                {net.dns.length > 0 && (
                  <div className="pm__list">
                    <p className="pm__list-title">
                      <span className="pm__list-mark" aria-hidden>
                        <Route className="h-3 w-3" />
                      </span>
                      DNS
                    </p>
                    <ul>
                      {net.dns.map((d) => (
                        <li key={d.name}>
                          <code>{d.name}</code>
                          <span>{d.ip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {net.firewall.length > 0 && (
                  <div className="pm__list">
                    <p className="pm__list-title">
                      <span className="pm__list-mark" aria-hidden>
                        <ShieldCheck className="h-3 w-3" />
                      </span>
                      Firewall
                    </p>
                    <ul>
                      {net.firewall.map((f) => (
                        <li key={f.name}>
                          <code>{f.name}</code>
                          <span>
                            {f.direction} · {f.action} · {f.localPort || f.remoteAddress}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
