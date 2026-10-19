// The student, drawn. Stylized rather than realistic: a tinted head and a
// shirt in the station's accent with their initials on it, so it reads as
// "you" without guessing at anyone's appearance.

/** Standing, facing the room. Walking swings the legs and arms. */
export function PersonStanding({ initials, walking = false }: { initials: string; walking?: boolean }) {
  return (
    <svg className={`soc-person${walking ? " is-walking" : ""}`} viewBox="0 0 44 80" aria-hidden>
      <ellipse cx="22" cy="77" rx="13" ry="3" className="soc-person__shadow" />
      <g className="soc-person__leg soc-person__leg--l">
        <rect x="13" y="50" width="7" height="24" rx="3" className="soc-person__pants" />
      </g>
      <g className="soc-person__leg soc-person__leg--r">
        <rect x="24" y="50" width="7" height="24" rx="3" className="soc-person__pants" />
      </g>
      <g className="soc-person__arm soc-person__arm--l">
        <rect x="4" y="26" width="7" height="22" rx="3.5" className="soc-person__shirt" />
      </g>
      <g className="soc-person__arm soc-person__arm--r">
        <rect x="33" y="26" width="7" height="22" rx="3.5" className="soc-person__shirt" />
      </g>
      <rect x="9" y="23" width="26" height="31" rx="7" className="soc-person__shirt" />
      <text x="22" y="43" textAnchor="middle" className="soc-person__tag">
        {initials}
      </text>
      <circle cx="22" cy="13" r="10" className="soc-person__head" />
      <path d="M12 12 a10 10 0 0 1 20 0 q-4 -4 -10 -4 t-10 4z" className="soc-person__hair" />
    </svg>
  );
}

/**
 * Seated at a desk, seen from behind: what the station and the lab scene
 * show. `pose` drives the arms and the head.
 */
export function PersonSeated({ initials, pose = "idle" }: { initials: string; pose?: "idle" | "typing" | "right" | "wrong" | "done" }) {
  return (
    <g className={`soc-seated is-${pose}`}>
      <rect x="-26" y="10" width="52" height="46" rx="10" className="soc-seated__chair" />
      <g className="soc-seated__arm soc-seated__arm--l">
        <rect x="-27" y="-2" width="10" height="26" rx="5" className="soc-person__shirt" />
      </g>
      <g className="soc-seated__arm soc-seated__arm--r">
        <rect x="17" y="-2" width="10" height="26" rx="5" className="soc-person__shirt" />
      </g>
      <path d="M-20 34 v-26 a14 12 0 0 1 14 -12 h12 a14 12 0 0 1 14 12 v26 z" className="soc-person__shirt" />
      <text x="0" y="26" textAnchor="middle" className="soc-person__tag soc-person__tag--back">
        {initials}
      </text>
      <g className="soc-seated__head">
        <circle cx="0" cy="-12" r="11" className="soc-person__head" />
        <path d="M-11 -12 a11 11 0 0 1 22 0 v3 a11 9 0 0 1 -22 0 z" className="soc-person__hair" />
      </g>
    </g>
  );
}
