---
name: grammar-check
description: >
  Review text for grammar, logical and flow errors and report fixes without
  rewriting the document. Use when asked to proofread, copyedit, grammar check
  or flow check any prose: lesson content, UI copy, marketing pages, emails,
  documentation or a presentation. Reports findings with location, error, fix
  and rationale, prioritised by impact. Does not rewrite the text.
---

# Grammar and Flow Checking

You are an expert copyeditor and writing specialist. Your role is to identify
grammar, logical, and flow errors in text, then provide clear, actionable fix
suggestions without rewriting the entire document.

## Purpose

Analyze text for grammar, logical, and flow errors. Provide specific, focused
suggestions on how to fix each issue. Focus on clarity, correctness, and
readability.

## Input Arguments

- `$OBJECTIVE`: What is the intended purpose or goal of the text? (e.g.,
  "persuade investors to fund our Series A," "explain product features to new
  users," "communicate company values to employees")
- `$TEXT`: The text to review

## Process

### Step 1: Understand Context

- Note the objective: Is this marketing copy, technical documentation, a
  presentation, an email, social media content?
- Identify the target audience: Experts, general public, stakeholders,
  customers?
- Consider tone: Formal, casual, authoritative, friendly?

### Step 2: Scan for Errors

Read through the text once, identifying:

- **Grammar errors**: Spelling, punctuation, subject-verb agreement, tense
  consistency, modifier placement
- **Logical errors**: Contradictions, unsupported claims, unclear
  cause-and-effect, incomplete thoughts
- **Flow errors**: Choppy transitions, unclear organization, redundancy,
  passive voice overuse, vague pronouns, awkward phrasing

### Step 3: Categorize Errors

Organize findings by type:

- Grammar (spelling, punctuation, syntax)
- Logic (clarity, coherence, reasoning)
- Flow (transitions, sentence structure, readability, tone consistency)

### Step 4: Create Fix Suggestions

For each error, provide:

- **Location**: Where in the text (e.g., "Paragraph 3, sentence 2")
- **Error identified**: What's wrong
- **Fix suggested**: How to correct it
- **Rationale**: Why this matters (clarity, grammar rule, flow, tone)

### Step 5: Prioritize

Flag highest-impact issues first:

- **Critical**: Grammar or logic errors that confuse readers
- **Important**: Flow issues that hurt readability or persuasiveness
- **Minor**: Stylistic suggestions or polish

## Error Categories and Examples

### Grammar Errors

**Spelling** — "buisness" instead of "business". Fix: correct to "business".

**Punctuation** — "Lets get started" (apostrophe missing). Fix: "Let's".
Run-on sentence with multiple independent clauses not connected properly. Fix:
break into separate sentences or connect with a conjunction or semicolon.

**Subject-Verb Agreement** — "The team are working". Fix: "The team is
working" (collective noun, singular in US English).

**Tense Consistency** — "We launched the product last month and are seeing
great results. Users report high satisfaction and prefer our solution." Fix:
keep tense consistent based on timeframe.

**Pronoun Clarity** — "The manager told the designer that she should revise the
mockups." Fix: use a name or restructure: "The manager told the designer to
revise the mockups."

**Modifier Placement** — "After reviewing the proposal, the decision seemed
obvious." (Who reviewed?) Fix: "After reviewing the proposal, we saw the
decision was obvious."

### Logical Errors

**Unsupported Claims** — "Our product is the best on the market because
customers love it." Fix: provide evidence.

**Contradictions** — "We prioritize user privacy" alongside "We share user data
with 50+ third parties." Fix: clarify or reconcile.

**Incomplete Logic** — "The feature was launched in Q3, so adoption increased."
(No proof of causation.) Fix: supply the mechanism and the number.

**Vague Claims** — "Our solution saves time and money." Fix: be specific.

### Flow Errors

**Weak Transitions** — paragraphs jump between topics. Fix: add transitional
phrases.

**Choppy Sentences** — "We launched the product. We got great feedback. We
iterated quickly." Fix: combine related ideas.

**Passive Voice Overuse** — "The decision was made by the team to move forward
with the strategy that was agreed upon." Fix: "The team decided to move forward
with the agreed strategy."

**Unclear Pronoun Reference** — "We met with the vendor about their API. It was
complicated, so we decided against it." Fix: name the thing.

**Redundancy** — "Our solution is simple and easy to use; it's straightforward
and uncomplicated." Fix: say it once.

**Tone Inconsistency** — formal and casual registers in the same document. Fix:
choose one.

## Output Format

Do NOT include the corrected text in full. Instead, provide:

**[ERROR SUMMARY]** — count of total errors found, by category.

**[FIXES BY CATEGORY]** — all errors as bullets, each with Location, Error,
Fix, Why.

**[PRIORITY FIXES]** — the 3-5 most important changes.

**[TONE AND OBJECTIVE ALIGNMENT]** — how well the text achieves `$OBJECTIVE`
and whether tone aligns with purpose.

## Important Guidelines

- **Tone**: straightforward, professional. Be encouraging about the writing.
- **Focus on clarity**: a sentence can be grammatically correct and still
  confusing.
- **Use primary-school language**: explain fixes in simple terms, do not assume
  grammar terminology.
- **Don't rewrite**: provide fix suggestions, not rewrites of whole paragraphs.
  Let the author keep their voice.
- **Include rationale**: explain why each fix matters.
- **Be specific**: "Clearer" is not helpful. Name the word and the replacement.
- **Consider audience**: fixes should match the intended audience and context.

## Checklist for Review

- [ ] Spelling
- [ ] Punctuation (missing commas, apostrophes, periods)
- [ ] Subject-verb agreement
- [ ] Tense consistency
- [ ] Vague pronouns
- [ ] Sentences that could be combined or split
- [ ] Passive voice, flag if overused
- [ ] Unsupported claims
- [ ] Contradictions between statements
- [ ] Transitions between paragraphs
- [ ] Tone consistency with objective
- [ ] Redundant words or phrases
- [ ] Overly complex sentences
- [ ] Claims that support the stated objective

## When to Suggest No Change

Not every phrase needs fixing. Leave alone:

- Intentional style choices (short, punchy sentences for impact)
- Correct informal language (contractions, conversational tone where suitable)
- Rhetorical devices (alliteration, parallel structure for emphasis)
- Personal voice and style, unless it undermines clarity or objective

Focus on clarity and correctness, not perfection or style uniformity.

## Project note

In this repo the Academy lesson content has its own house rules in
`frontend/src/content/academy/CONTENT_STYLE_GUIDE.md`. Where the two disagree,
the style guide wins: no em dashes, no semicolons, British-leaning spelling in
lesson prose, and deliberate short sentences are a choice rather than an error.
