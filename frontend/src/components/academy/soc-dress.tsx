"use client";

import { Check, RotateCcw } from "lucide-react";
import { BUILDS, DEFAULT_AVATAR, HAIRS, HAIR_STYLES, SHIRTS, SKINS, TOPS, TROUSERS, type Avatar } from "./soc-avatar";

/** A row of colour swatches. */
function Swatches({ label, value, options, onPick }: { label: string; value: string; options: string[]; onPick: (c: string) => void }) {
  return (
    <div className="sw-dress__row">
      <p className="sw-dress__label">{label}</p>
      <div className="sw-dress__swatches" role="radiogroup" aria-label={label}>
        {options.map((c) => (
          <button key={c} type="button" role="radio" aria-checked={value === c} aria-label={c} className="sw-dress__swatch" style={{ background: c }} onClick={() => onPick(c)}>
            {value === c && <Check aria-hidden />}
          </button>
        ))}
      </div>
    </div>
  );
}

/** A row of word choices. */
function Choices<T extends string>({ label, value, options, onPick }: { label: string; value: T; options: { id: T; label: string }[]; onPick: (v: T) => void }) {
  return (
    <div className="sw-dress__row">
      <p className="sw-dress__label">{label}</p>
      <div className="sw-dress__choices" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={value === o.id} className={value === o.id ? "is-on" : ""} onClick={() => onPick(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Setting up your analyst. The camera turns to face you while this is open,
 * so every change shows on the figure in the room as you make it.
 */
export function SocDress({ avatar, onChange, onDone }: { avatar: Avatar; onChange: (update: (a: Avatar) => Avatar) => void; onDone: () => void }) {
  const set = <K extends keyof Avatar>(k: K, v: Avatar[K]) => onChange((a) => ({ ...a, [k]: v }));
  return (
    <aside className="sw-dress" aria-label="Your analyst" onPointerDown={(e) => e.stopPropagation()}>
      <div className="sw-dress__head">
        <p className="sw-dress__kicker">Your analyst</p>
        <h3>How you show up on the floor</h3>
      </div>
      <div className="sw-dress__body">
        <Choices label="Build" value={avatar.build} options={BUILDS} onPick={(v) => set("build", v)} />
        <Choices label="Hair" value={avatar.hairStyle} options={HAIR_STYLES} onPick={(v) => set("hairStyle", v)} />
        <Swatches label="Skin tone" value={avatar.skin} options={SKINS} onPick={(c) => set("skin", c)} />
        <Swatches label="Hair colour" value={avatar.hair} options={HAIRS} onPick={(c) => set("hair", c)} />
        <Choices
          label="Outfit"
          value={avatar.jacket ? "jacket" : "shirt"}
          options={[
            { id: "jacket", label: "Jacket" },
            { id: "shirt", label: "Shirt only" },
          ]}
          onPick={(v) => set("jacket", v === "jacket")}
        />
        {avatar.jacket && <Swatches label="Jacket" value={avatar.top} options={TOPS} onPick={(c) => set("top", c)} />}
        <Swatches label="Shirt" value={avatar.shirt} options={SHIRTS} onPick={(c) => set("shirt", c)} />
        <Swatches label="Trousers" value={avatar.trousers} options={TROUSERS} onPick={(c) => set("trousers", c)} />
      </div>
      <div className="sw-dress__foot">
        <button type="button" className="sw-dress__reset" onClick={() => onChange(() => DEFAULT_AVATAR)}>
          <RotateCcw aria-hidden /> Reset
        </button>
        <button type="button" className="sw-dress__done" onClick={onDone}>
          Done
        </button>
      </div>
    </aside>
  );
}
