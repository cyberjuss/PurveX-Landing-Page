"use client";

import { useEffect } from "react";

// Which step of a lab is showing, said out loud so the lab's page can react
// to it (the workstation scene sits only above the first step). Both the
// markdown labs' carousel and the widget labs' stepper announce it.

export const LAB_STEP_EVENT = "academy:lab-step";

// A lab that resumes saved progress announces its step while mounting, before
// the page around it starts listening (child effects run first), so the last
// step is kept for the page to read when it does.
let last = 0;
export const lastLabStep = () => last;

export function useAnnounceLabStep(step: number) {
  useEffect(() => {
    last = step;
    window.dispatchEvent(new CustomEvent(LAB_STEP_EVENT, { detail: { step } }));
  }, [step]);
}
