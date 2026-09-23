# Academy Content Editing Guide

Companion to `CONTENT_STYLE_GUIDE.md`. That guide is for *writing new* lessons.
This one is for *editing existing* lessons, labs, and quizzes — tone passes,
clarity passes, restructuring. Not rendered on the site.

## Core rule

Edit what exists. Do not invent what does not exist.

Every technical statement in a file after an edit must be traceable to
content that was already in that file (or a file it explicitly references,
like a lab script) before the edit. If a statement can't be traced, it
shouldn't be there.

## Source restriction

The source of truth for a piece of content is that content itself as it
already exists in this repo — the `.md` lesson files, and anything they
reference directly (a lab's `.ps1` script, a linked tab). Not outside
knowledge about how Active Directory, Windows, or security tooling "usually"
works, however accurate that knowledge is.

Do not, in the course of an editing pass:

- Introduce a technical concept the file didn't already cover
- Add a command (PowerShell or otherwise) that isn't already in the file or
  its referenced script
- Invent a lab exercise, troubleshooting scenario, or security finding
- Add a technology (AWS, Azure, Splunk, Sentinel, Sysmon, specific Windows
  Event IDs, etc.) that isn't already named in the file
- Fill a technical gap with a plausible-sounding assumption
- Expand a section just because more detail would be useful

If a technical statement needs support the source doesn't have, leave it out
rather than filling it in. If something important seems to be missing,
flag it (`[Detail not in source]`) rather than guessing.

## What editing *is* for

- Tightening prose, fixing tone, cutting fluff and redundancy
- Reordering for clearer logical flow
- Clarifying an *existing* explanation (what a command does, why a step
  matters, what a result means) without introducing new technical claims
- Fixing a command's formatting/typo when it's clearly wrong, not changing
  its behavior
- Restructuring a lab into Objective / Prerequisites / Steps / Expected
  Result / Validation / Troubleshooting *only* where the source already has
  enough material for each section — never inventing a missing one

## Style while editing

Same banned-phrase list as `CONTENT_STYLE_GUIDE.md`. Additionally:

- Direct language over throat-clearing: "Configure the domain controller and
  verify the required settings," not "In today's cybersecurity landscape,
  it's essential to understand domain controller configuration."
- No semicolons.
- No personal pronouns in resume-style or procedural instruction text.
- Avoid excessive headings — only what the content actually needs.

## Verifying a claim before keeping it

When editing a Home Lab or lab file specifically, cross-check any command,
group name, OU path, or access-level claim against the actual `.ps1` script
it describes (`Install-Forest.ps1`, `Build-Environment.ps1`, etc.) or against
another tab that already establishes it (e.g. `admin-roles.md` for access
levels, `ad-building-blocks.md` for OU/Container/GPO facts). If a claim in
prose doesn't match what the script actually does, fix the prose to match
the script — the script is the ground truth, not the other way around.
