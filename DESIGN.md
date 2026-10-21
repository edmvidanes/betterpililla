---
name: BetterLGU civic portal
description: Restrained Kapwa-style public information interface with Tailwind
colors:
  primary: "#1d4ed8"
  link: "#1747ab"
  foreground: "#172b4d"
  muted: "#4c5e78"
  background: "#ffffff"
  border: "#d6deeb"
  selected: "#eaf1ff"
  warning-background: "#fffaeb"
  warning-foreground: "#5c420b"
typography:
  body:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.65
  headline:
    fontSize: "clamp(1.75rem, 3vw, 2.6rem)"
    fontWeight: 730
    lineHeight: 1.2
    letterSpacing: "-0.025em"
rounded:
  panel: "0.65rem"
  notice: "0.5rem"
  input: "0.35rem"
spacing:
  panel: "1.25rem"
  desktop-column-gap: "3rem"
---

# Design System: Civic portal

## Overview

The user selected restrained Kapwa styling with Tailwind, not a bespoke visual redesign. This file records the implemented interface; it does not add a new branding direction. Sources, coverage and readable original records lead. No authored animation or decorative illustration is required.

## Colors

Primary blue identifies actions and navigation; dark foreground and muted evidence labels sit on white. Pale blue indicates the active topic. Amber notices identify coverage or verification limits, not live emergency alerts. Palette values are recorded in frontmatter; `src/index.css` and Kapwa are the implementation authorities.

## Typography

Use the body stack and responsive headline scale above. No font is downloaded by the portal. Long original legal titles must wrap rather than truncate the source wording. Supporting prose is limited to readable measures where appropriate; tables retain tabular numbers.

## Layout

The desktop shell has a maximum width of 1320px, a 230px topic column and a fluid content column. At 800px and below it becomes a single column; native topic navigation starts collapsed on mobile. At 480px, filter fields and topic lists stack. Source tables may scroll inside their own labeled page region rather than overflowing the document.

## Elevation & Depth

Flat surfaces with subtle borders and tonal notices. No decorative shadows, gradients or hero metrics.

## Shapes

Lightly rounded panels, inputs and notices use the frontmatter radii. Record lists use dividing rules instead of repeating dashboard cards.

## Components

Use the installed Kapwa `Button` variants for actions. Inputs/selects are native, explicitly labeled controls. Keyboard focus is a visible 3px outline with a 4px offset. Source citations expose publisher routes, direct evidence URLs, independent status dimensions and last checks. Status chips are informational, not actions. The topic menu is a native disclosure, and the first focusable link skips to main content.

## Do's and Don'ts

- Do preserve source-original strings and visibly label missing translations.
- Do expose coverage gaps and last checks next to the affected content.
- Do keep native keyboard interactions and visible focus.
- Don't display an unavailable dataset as a zero-value metric.
- Don't add branding, animation or decorative visual systems beyond the approved restrained interface.
