"use client";
import { useEffect, useState } from "react";
import { RiskTriageLab } from "@/components/academy/labs/risk-triage-lab";

export default function Tmp() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    localStorage.setItem(
      "academy-lab-risk-triage-v1",
      JSON.stringify({ step: 1, cia: { printer: "a", backup: "a", folder: "c", fees: "i" }, likelihood: { folder: 3 }, impact: { folder: 3 }, order: ["printer", "backup", "folder", "fees"], checked: [true, false, false] })
    );
    const t = setTimeout(() => setOn(true), 0);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="academy-bg" data-academy-theme="light" style={{ padding: 32, background: "#fff", minHeight: "100vh" }}>
      <div className="rd" style={{ maxWidth: 860, margin: "0 auto" }}>{on && <RiskTriageLab />}</div>
    </div>
  );
}
