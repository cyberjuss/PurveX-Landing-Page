"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Monitor, Server, Shield, X } from "lucide-react";
import { academyFetch } from "@/lib/academy-client";
import "./network-map.css";

type Node = { role: "dc" | "desktop"; label: string; os: string; ip: string | null };
type Dns = { name: string; ip: string };
type Rule = { name: string; enabled: boolean; direction: string; action: string; localPort: string; remoteAddress: string };
type Network = { nodes: Node[]; dns: Dns[]; firewall: Rule[] };

// The pod's own network, read from the student's latest snapshot rather than
// drawn up: two machines on one private subnet, the DNS records and firewall
// rules their own domain controller actually holds. A student reads an
// address instead of being told one.

export function NetworkMap({ onClose }: { onClose: () => void }) {
  const [net, setNet] = useState<Network | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<"dc" | "desktop" | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;
    academyFetch("/academy/api/hosted-lab/network")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: Network) => live && setNet(data))
      .catch(() => live && setError("Could not read your lab's network. Try again in a minute."));
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  const dc = net?.nodes.find((n) => n.role === "dc") ?? null;
  const desktop = net?.nodes.find((n) => n.role === "desktop") ?? null;
  const active = picked === "dc" ? dc : picked === "desktop" ? desktop : null;

  return createPortal(
    <div className="nm" role="dialog" aria-modal="true" aria-labelledby="nm-title">
      <div className="nm__scrim" onClick={onClose} />
      <div className="nm__panel" ref={panel} tabIndex={-1}>
        <header className="nm__head">
          <div>
            <p className="nm__kicker">Your lab</p>
            <h2 className="nm__title" id="nm-title">Lab addresses</h2>
          </div>
          <button type="button" className="nm__x" onClick={onClose} aria-label="Close">
            <X className="h-[18px] w-[18px]" aria-hidden />
          </button>
        </header>

        {error && <p className="nm__error">{error}</p>}
        {!net && !error && (
          <p className="nm__loading">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Reading your lab&rsquo;s last report&hellip;
          </p>
        )}

        {net && (
          <>
            <p className="nm__lede">
              Both machines sit on one private subnet, yours alone. Click one to see the real addresses your lab&rsquo;s latest report has for it.
            </p>
            <div className="nm__net">
              <span className="nm__net__tag">Private network</span>
              <div className="nm__row">
                {dc && (
                  <button
                    type="button"
                    className={`nm__node${picked === "dc" ? " is-on" : ""}`}
                    onClick={() => setPicked(picked === "dc" ? null : "dc")}
                  >
                    <Server className="h-5 w-5" aria-hidden />
                    <span className="nm__node__label">{dc.label}</span>
                    <small>{dc.ip ?? "no IP reported yet"}</small>
                  </button>
                )}
                {dc && desktop && <span className="nm__wire" aria-hidden />}
                {desktop && (
                  <button
                    type="button"
                    className={`nm__node${picked === "desktop" ? " is-on" : ""}`}
                    onClick={() => setPicked(picked === "desktop" ? null : "desktop")}
                  >
                    <Monitor className="h-5 w-5" aria-hidden />
                    <span className="nm__node__label">{desktop.label}</span>
                    <small>{desktop.ip ?? "no IP reported yet"}</small>
                  </button>
                )}
              </div>
              {!desktop && <p className="nm__solo">No Ubuntu desktop on this pod yet.</p>}
            </div>

            {active && (
              <div className="nm__detail">
                <dl>
                  <div>
                    <dt>Role</dt>
                    <dd>{active.role === "dc" ? "Domain controller" : "Desktop"}</dd>
                  </div>
                  <div>
                    <dt>OS</dt>
                    <dd>{active.os}</dd>
                  </div>
                  <div>
                    <dt>IP address</dt>
                    <dd>{active.ip ?? "Not reported yet"}</dd>
                  </div>
                </dl>

                {active.role === "dc" && (
                  <>
                    <section className="nm__list">
                      <h3>
                        <Shield className="h-3.5 w-3.5" aria-hidden /> DNS records ({net.dns.length})
                      </h3>
                      {net.dns.length === 0 ? (
                        <p className="nm__empty">None reported yet.</p>
                      ) : (
                        <ul>
                          {net.dns.map((r) => (
                            <li key={`${r.name}:${r.ip}`}>
                              <code>{r.name}</code>
                              <span>{r.ip}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                    <section className="nm__list">
                      <h3>
                        <Shield className="h-3.5 w-3.5" aria-hidden /> Firewall rules ({net.firewall.length})
                      </h3>
                      {net.firewall.length === 0 ? (
                        <p className="nm__empty">None reported yet.</p>
                      ) : (
                        <ul>
                          {net.firewall.map((r) => (
                            <li key={r.name}>
                              <code>{r.name}</code>
                              <span>
                                {r.direction} · {r.action} · {r.localPort || "any port"}
                                {r.enabled ? "" : " · disabled"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  </>
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
