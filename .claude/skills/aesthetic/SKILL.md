---
name: aesthetic
description: >
  Create aesthetically beautiful interfaces following proven design principles.
  Use when building UI/UX, implementing visual hierarchy and colour theory,
  adding micro-interactions, auditing a surface against design standards, or
  writing design documentation. Four stages: BEAUTIFUL (aesthetic principles),
  RIGHT (functionality and accessibility), SATISFYING (micro-interactions),
  PEAK (storytelling).
---

# Aesthetic

Create aesthetically beautiful interfaces by following proven design principles
and systematic workflows.

## When to Use This Skill

- Building or designing user interfaces
- Analysing designs from inspiration websites
- Implementing visual hierarchy, typography, colour theory
- Adding micro-interactions and animations
- Creating design documentation and style guides
- Guidance on accessibility and design systems

## Core Framework: Four-Stage Approach

### 1. BEAUTIFUL: Understanding Aesthetics

Study existing designs, identify patterns, extract principles. AI lacks
aesthetic sense, so standards must come from analysing high-quality examples
and aligning with market tastes. Covers visual hierarchy, typography, colour
theory and white space.

### 2. RIGHT: Ensuring Functionality

Beautiful designs lacking usability are worthless. Design systems, component
architecture, WCAG accessibility requirements.

### 3. SATISFYING: Micro-Interactions

Subtle animations with appropriate timing (150-300ms), easing curves (ease-out
for entry, ease-in for exit), sequential delays.

### 4. PEAK: Storytelling Through Design

Narrative elements, parallax, thematic consistency. Use restraint: too much of
anything isn't good.

## Workflows

### Workflow 1: Capture & Analyse Inspiration

1. Browse inspiration sites (Dribbble, Mobbin, Behance, Awwwards).
2. Capture full-screen screenshots.
3. Analyse and extract: design style, layout and grid, typography system and
   hierarchy (predict the actual font, do not default to Inter or Poppins),
   colour palette with hex codes, visual hierarchy techniques, component
   patterns, micro-interactions, accessibility, and an aesthetic rating out
   of 10.
4. Document findings in the project design guidelines.

### Workflow 2: Generate & Iterate Design Images

1. Define the prompt: style, colours, typography, audience, animation.
2. Generate design images.
3. Analyse the output and score it.
4. Below 7/10, name the specific weakness (colour, typography, layout,
   spacing, hierarchy), refine, regenerate.
5. Repeat until the score clears 7/10.
6. Document the final decisions.

## Design Documentation

- `docs/design-guideline.md`: colour patterns, typography system, layout and
  spacing, component standards, accessibility, rationale.
- `docs/design-story.md`: narrative elements, emotional journey, peak moments,
  decision rationale.

## Key Principles

1. Aesthetic standards come from humans, not AI. Study quality examples.
2. Iterate based on analysis. Never settle for the first output.
3. Balance beauty with functionality and accessibility.
4. Document decisions for consistency across development.
5. Use progressive disclosure. Reveal complexity gradually.
6. Evaluate aesthetic quality objectively (score >= 7/10).

## Notes for this repo

The original skill chains to `chrome-devtools`, `ai-multimodal`,
`media-processing`, `ui-styling` and `web-frameworks`, and to reference files
(`references/design-principles.md`, `references/micro-interactions.md`,
`references/storytelling-design.md`, `references/design-resources.md`) and
templates (`assets/design-guideline-template.md`,
`assets/design-story-template.md`). None of those shipped with the text this
was installed from, and no Gemini image generation is wired up here, so
Workflow 2 cannot run as written. Workflow 1 is still doable with headless
Chrome for the screenshots and a read of them.

What is portable and used here is the four-stage framework and the audit it
implies. The portal's own system lives in `docs/design-guideline.md`, and the
house rules that outrank generic advice are in
`frontend/src/content/academy/CONTENT_STYLE_GUIDE.md` for copy and in this
repo's conventions for surfaces: square corners on portal panels, one type
scale on `:root`, one motion scale, and no analogy boxes or colour-strip
callouts.
